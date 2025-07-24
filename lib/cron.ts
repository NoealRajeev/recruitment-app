import cron from "node-cron";
import { NextApiRequest, NextApiResponse } from "next";

// Helper to convert NextApiResponse to proper type
const createResponse = () => {
  const response = {
    json: (body: any) => console.log(body),
    status: (code: number) => ({
      json: (body: any) => console.log(`Status ${code}:`, body),
    }),
  } as unknown as NextApiResponse;

  return response;
};

export function startCronJobs() {
  // Run every day at 9 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("Running reminders cron job...");
    const req = {} as NextApiRequest;
    const res = createResponse();
    // await remindersHandler({ req, res } as any);
  });

  console.log("Cron jobs scheduled");
}
