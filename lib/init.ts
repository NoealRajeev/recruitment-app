import { seedDatabase } from "./seed";

export async function initializeApp() {
  if (process.env.NODE_ENV !== "development") return;

  try {
    console.log("🚀 Initializing application...");
    await seedDatabase();
  } catch (error) {
    console.error("Initialization error:", error);
  }
}
