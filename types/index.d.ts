type ClientWithUser = {
  id: string;
  companyName: string;
  registrationNo: string | null;
  companySector: string | null;
  companySize: string | null;
  website: string | null;
  designation: string | null;
  phone: string | null;
  image: string | null;
  createdAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  requirements: {
    id: string;
  }[];
  documents?: ClientDocument[];
};

type ClientDocument = {
  id: string;
  type: string;
  url: string;
  verified: boolean;
  createdAt: Date;
};
export type AuditLog = {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  description: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  affectedFields: string[];
  ipAddress: string | null;
  userAgent: string | null;
  performedAt: Date;
  createdAt: Date;
  performedById: string;
  performedBy: Pick<User, "id" | "name" | "email">;
};

export type CompanySector =
  | "IT"
  | "REAL_ESTATE"
  | "HEALTHCARE"
  | "FINANCE"
  | "MANUFACTURING"
  | "RETAIL"
  | "CONSTRUCTION"
  | "EDUCATION"
  | "OTHER";

export type CompanySize = "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";
