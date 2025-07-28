import { env } from "./env.server";
import { seedDatabase } from "./seed/seed";

export async function initializeApp() {
  if (!env.isDevelopment) return;

  try {
    console.log("🚀 Initializing application...");
    await seedDatabase();
  } catch (error) {
    console.error("Initialization error:", error);
  }
}
