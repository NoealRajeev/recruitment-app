// lib/seed/seedExtras.ts
import prisma from "@/lib/prisma";

export async function applyExtras() {
  console.log("🔧 Applying DB triggers, views, constraints...");

  try {
    // 1. Create full-text search functionality
    await createFullTextSearch();

    // 2. Create soft delete triggers
    await createSoftDeleteTriggers();

    // 3. Create audit log triggers
    await createAuditTriggers();

    // 4. Create status change triggers
    await createStatusChangeTriggers();

    // 5. Create utility views
    await createUtilityViews();

    // 6. Add additional constraints
    await addAdditionalConstraints();

    console.log("✅ DB extras applied.");
  } catch (error) {
    console.error("❌ Failed to apply DB extras:", error);
    throw error;
  }
}

async function createFullTextSearch() {
  // Execute each SQL command separately
  await prisma.$executeRaw`ALTER TABLE clients ADD COLUMN IF NOT EXISTS search_vector tsvector`;
  await prisma.$executeRaw`UPDATE clients SET search_vector = to_tsvector('english', coalesce("companyName", '') || ' ' || coalesce(address, '') || ' ' || coalesce(city, '') || ' ' || coalesce(country, ''))`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS clients_search_idx ON clients USING gin(search_vector)`;

  await prisma.$executeRaw`ALTER TABLE agencies ADD COLUMN IF NOT EXISTS search_vector tsvector`;
  await prisma.$executeRaw`UPDATE agencies SET search_vector = to_tsvector('english', coalesce("agencyName", '') || ' ' || coalesce(address, '') || ' ' || coalesce(city, '') || ' ' || coalesce(country, ''))`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS agencies_search_idx ON agencies USING gin(search_vector)`;

  await prisma.$executeRaw`ALTER TABLE requirements ADD COLUMN IF NOT EXISTS search_vector tsvector`;
  await prisma.$executeRaw`UPDATE requirements SET search_vector = to_tsvector('english', coalesce("projectLocation", '') || ' ' || coalesce("specialNotes", ''))`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS requirements_search_idx ON requirements USING gin(search_vector)`;

  await prisma.$executeRaw`ALTER TABLE labour_profiles ADD COLUMN IF NOT EXISTS search_vector tsvector`;
  await prisma.$executeRaw`UPDATE labour_profiles SET search_vector = to_tsvector('english', coalesce(name, '') || ' ' || coalesce("currentPosition", '') || ' ' || coalesce("currentCompany", '') || ' ' || coalesce(education, '') || ' ' || array_to_string(skills, ' '))`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS labour_profiles_search_idx ON labour_profiles USING gin(search_vector)`;
}

async function createSoftDeleteTriggers() {
  // Create function first
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION soft_delete_user_related()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW."deleteAt" IS NOT NULL THEN
        UPDATE client_documents SET verified = false WHERE "verifiedById" = NEW.id;
        UPDATE agency_documents SET verified = false WHERE "verifiedById" = NEW.id;
        UPDATE users SET status = 'SUSPENDED' WHERE id = NEW.id;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // Then create trigger
  await prisma.$executeRaw`DROP TRIGGER IF EXISTS user_soft_delete_trigger ON users`;
  await prisma.$executeRaw`
    CREATE TRIGGER user_soft_delete_trigger
    AFTER UPDATE OF "deleteAt" ON users
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete_user_related();
  `;
}

async function createAuditTriggers() {
  // User audit function
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION log_user_changes()
    RETURNS TRIGGER AS $$
    DECLARE
      affected_fields text[];
    BEGIN
      IF TG_OP = 'UPDATE' THEN
        SELECT array_agg(key) INTO affected_fields
        FROM jsonb_each(to_jsonb(OLD)) AS old_data
        JOIN jsonb_each(to_jsonb(NEW)) AS new_data ON old_data.key = new_data.key
        WHERE old_data.value IS DISTINCT FROM new_data.value;
        
        INSERT INTO audit_logs (
          action, "entityType", "entityId", 
          "performedById", "oldData", "newData", 
          "affectedFields", description
        ) VALUES (
          'USER_UPDATED', 'User', NEW.id,
          NEW.id, 
          to_jsonb(OLD), to_jsonb(NEW),
          affected_fields,
          'User profile updated'
        );
      ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
          action, "entityType", "entityId", 
          "performedById", "newData", 
          description
        ) VALUES (
          'USER_CREATED', 'User', NEW.id,
          COALESCE(NEW."createdById", NEW.id),
          to_jsonb(NEW),
          'New user created'
        );
      END IF;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // User audit trigger
  await prisma.$executeRaw`DROP TRIGGER IF EXISTS user_audit_trigger ON users`;
  await prisma.$executeRaw`
    CREATE TRIGGER user_audit_trigger
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_changes();
  `;

  // Requirement audit function
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION log_requirement_changes()
    RETURNS TRIGGER AS $$
    DECLARE
      affected_fields text[];
    BEGIN
      IF TG_OP = 'UPDATE' THEN
        SELECT array_agg(key) INTO affected_fields
        FROM jsonb_each(to_jsonb(OLD)) AS old_data
        JOIN jsonb_each(to_jsonb(NEW)) AS new_data ON old_data.key = new_data.key
        WHERE old_data.value IS DISTINCT FROM new_data.value;
        
        INSERT INTO audit_logs (
          action, "entityType", "entityId", 
          "performedById", "oldData", "newData", 
          "affectedFields", description
        ) VALUES (
          'REQUIREMENT_UPDATED', 'Requirement', NEW.id,
          (SELECT "userId" FROM users WHERE id = NEW."clientId"),
          to_jsonb(OLD), to_jsonb(NEW),
          affected_fields,
          'Requirement updated'
        );
      ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
          action, "entityType", "entityId", 
          "performedById", "newData", 
          description
        ) VALUES (
          'REQUIREMENT_CREATED', 'Requirement', NEW.id,
          (SELECT "userId" FROM users WHERE id = NEW."clientId"),
          to_jsonb(NEW),
          'New requirement created'
        );
      END IF;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // Requirement audit trigger
  await prisma.$executeRaw`DROP TRIGGER IF EXISTS requirement_audit_trigger ON requirements`;
  await prisma.$executeRaw`
    CREATE TRIGGER requirement_audit_trigger
    AFTER INSERT OR UPDATE ON requirements
    FOR EACH ROW
    EXECUTE FUNCTION log_requirement_changes();
  `;
}

async function createStatusChangeTriggers() {
  // Labour profile status function
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION log_labour_status_change()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO labour_status_logs (
          status, comments, "labourProfileId", "changedById"
        ) VALUES (
          NEW.status, 
          CONCAT('Status changed from ', OLD.status, ' to ', NEW.status),
          NEW.id,
          (SELECT "userId" FROM agencies WHERE id = NEW."agencyId")
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // Labour profile status trigger
  await prisma.$executeRaw`DROP TRIGGER IF EXISTS labour_status_change_trigger ON labour_profiles`;
  await prisma.$executeRaw`
    CREATE TRIGGER labour_status_change_trigger
    AFTER UPDATE OF status ON labour_profiles
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_labour_status_change();
  `;

  // Requirement status function
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION log_requirement_status_change()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO audit_logs (
          action, "entityType", "entityId", 
          "performedById", description
        ) VALUES (
          'REQUIREMENT_STATUS_CHANGED', 'Requirement', NEW.id,
          (SELECT "userId" FROM users WHERE id = NEW."clientId"),
          CONCAT('Requirement status changed from ', OLD.status, ' to ', NEW.status)
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // Requirement status trigger
  await prisma.$executeRaw`DROP TRIGGER IF EXISTS requirement_status_change_trigger ON requirements`;
  await prisma.$executeRaw`
    CREATE TRIGGER requirement_status_change_trigger
    AFTER UPDATE OF status ON requirements
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_requirement_status_change();
  `;
}

async function createUtilityViews() {
  // Execute each view creation separately
  await prisma.$executeRaw`CREATE OR REPLACE VIEW active_users AS SELECT * FROM users WHERE "deleteAt" IS NULL`;
  await prisma.$executeRaw`
    CREATE OR REPLACE VIEW pending_documents AS
    SELECT 'client' AS type, id, "clientId" AS owner_id, url, "createdAt"
    FROM client_documents WHERE verified = false
    UNION ALL
    SELECT 'agency' AS type, id, "agencyId" AS owner_id, url, "createdAt"
    FROM agency_documents WHERE verified = false
  `;
  await prisma.$executeRaw`
    CREATE OR REPLACE VIEW active_requirements AS
    SELECT r.* 
    FROM requirements r
    JOIN clients c ON r."clientId" = c.id
    JOIN users u ON c."userId" = u.id
    WHERE r.status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED')
    AND u."deleteAt" IS NULL
  `;
  await prisma.$executeRaw`
    CREATE OR REPLACE VIEW available_labour_profiles AS
    SELECT lp.* 
    FROM labour_profiles lp
    JOIN agencies a ON lp."agencyId" = a.id
    JOIN users u ON a."userId" = u.id
    WHERE lp.status IN ('APPROVED', 'READY_FOR_DEPLOYMENT')
    AND u."deleteAt" IS NULL
  `;
}

async function addAdditionalConstraints() {
  try {
    // Email format validation - fixed regex
    await prisma.$executeRaw`
        ALTER TABLE users ADD CONSTRAINT valid_email_check 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}$')
      `;

    // Phone number format validation - simplified regex
    await prisma.$executeRaw`
        ALTER TABLE users ADD CONSTRAINT valid_phone_check 
        CHECK (phone IS NULL OR phone ~ '^[+]?[0-9]{8,15}$')
      `;

    // Future date validation for license expiry
    await prisma.$executeRaw`
        ALTER TABLE agencies ADD CONSTRAINT valid_license_expiry_check 
        CHECK ("licenseExpiry" > CURRENT_DATE)
      `;

    // Start date validation for requirements
    await prisma.$executeRaw`
        ALTER TABLE requirements ADD CONSTRAINT valid_start_date_check 
        CHECK ("startDate" > CURRENT_DATE)
      `;

    // Age validation for labour profiles
    await prisma.$executeRaw`
        ALTER TABLE labour_profiles ADD CONSTRAINT valid_age_check 
        CHECK (age BETWEEN 18 AND 65)
      `;
  } catch (error) {
    console.error("❌ Failed to add constraints:", error);
    throw error;
  }
}
