// scripts/seedPermissions.ts
import { seedDatabase } from "../lib/seed";

seedDatabase()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
