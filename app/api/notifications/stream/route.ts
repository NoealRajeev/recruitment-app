import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { notificationBus } from "@/lib/notification-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // helper to send event
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // send a hello + heartbeat pings (keep-alive on proxies)
      send({ type: "hello" });

      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(":keep-alive\n\n"));
      }, 25000);

      // subscribe to user channel
      const unsub = notificationBus.subscribe(userId, (payload) => {
        send({ type: "notification", payload });
      });

      // close logic
      const close = () => {
        clearInterval(interval);
        unsub();
        controller.close();
      };

      // if client closes
      req.signal?.addEventListener?.("abort", close);
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
