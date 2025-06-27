// scripts/seedPermissions.ts
import { seedLabourProfiles } from "@/lib/seed/labourProfiles";
import { seedDatabase } from "../lib/seed/seed";

(async () => {
  try {
    await seedDatabase();
    await seedLabourProfiles();
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  }
})();
