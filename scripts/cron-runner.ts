// scripts/cron-runner.ts
import "dotenv/config";
import cron from "node-cron";

const BASE = process.env.CRON_BASE_URL || "http://127.0.0.1:3000";
const SECRET = process.env.CRON_SECRET || "";
const TZ = process.env.CRON_TZ || "UTC";

async function postCron(path: string) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-cron-secret": SECRET },
  });
  const txt = await res.text();
  try {
    const payload = JSON.parse(txt);
    if (!res.ok) {
      console.error(`[cron] ${path} -> ${res.status}`, payload);
      throw new Error(`${path} failed with ${res.status}`);
    }
    console.log(`[cron] ${path} OK`, payload);
  } catch {
    if (!res.ok) {
      console.error(`[cron] ${path} -> ${res.status}`, txt);
      throw new Error(`${path} failed with ${res.status}`);
    }
    console.log(`[cron] ${path} OK`, txt);
  }
}

function start() {
  cron.schedule("0 9 * * *", () => postCron("/api/reminders"), {
    timezone: TZ,
  });

  cron.schedule("30 2 * * *", () => postCron("/api/notifications/cleanup"), {
    timezone: TZ,
  });

  cron.schedule("*/5 * * * *", () => postCron("/api/cron/agency-deletions"), {
    timezone: TZ,
  });

  console.log(
    `[cron] scheduled | BASE=${BASE} TZ=${TZ} routes=[/api/reminders, /api/notifications/cleanup, /api/cron/agency-deletions]`
  );
}

start();
