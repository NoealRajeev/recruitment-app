// scripts/cron-runner.ts
import "dotenv/config";
import cron from "node-cron";

const BASE = process.env.CRON_BASE_URL || "http://127.0.0.1:3000";
const SECRET = process.env.CRON_SECRET || "";
const TZ = process.env.CRON_TZ || "UTC";

/** simple POST helper with secret */
async function postCron(path: string) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-cron-secret": SECRET },
  });
  const txt = await res.text();
  const payload = safeJson(txt);
  if (!res.ok) {
    console.error(`[cron] ${path} -> ${res.status}`, payload || txt);
    throw new Error(`${path} failed with ${res.status}`);
  }
  console.log(`[cron] ${path} OK`, payload ?? txt);
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function start() {
  // 🔔 Daily reminders at 09:00 (server timezone unless TZ provided)
  cron.schedule("0 9 * * *", () => postCron("/api/reminders"), {
    timezone: TZ,
  });

  // 🧹 Cleanup archived notifications at 02:30
  cron.schedule("30 2 * * *", () => postCron("/api/notifications/cleanup"), {
    timezone: TZ,
  });

  console.log(
    `[cron] scheduled | BASE=${BASE} TZ=${TZ} routes=[/api/reminders, /api/notifications/cleanup]`
  );
}

start();
