// scripts/seedPermissions.ts
import { applyExtras } from "@/lib/seed/seedExtras";
import { seedDatabase } from "../lib/seed/seed";

(async () => {
  try {
    await seedDatabase();
    await applyExtras();
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  }
})();
