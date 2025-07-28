// scripts/seedPermissions.ts
import { seedDatabase } from "../lib/seed/seed";

(async () => {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  }
})();
