// scripts/seedPermissions.ts
import { seedLabourProfiles } from "@/lib/seed/labourProfiles";
import { seedDatabase } from "../lib/seed/seed";
// import prisma from "@/lib/prisma";

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

// async function deleteNonDeployedOrShortlistedLabourProfiles() {
//   const result = await prisma.labourProfile.deleteMany({
//     where: {
//       NOT: [{ status: "DEPLOYED" }, { status: "SHORTLISTED" }],
//     },
//   });
//   console.log(
//     `Deleted ${result.count} labour profiles (not DEPLOYED or SHORTLISTED)`
//   );
// }

// if (require.main === module) {
//   deleteNonDeployedOrShortlistedLabourProfiles().then(() => process.exit(0));
// }
