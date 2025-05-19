// hooks/useSession.ts
"use client";

import { useSession } from "next-auth/react";
import { refreshSession } from "@/lib/auth/session";

export function useAuthSession() {
  const { data: session, update, status } = useSession();

  const refresh = async () => {
    if (session?.user?.id) {
      await refreshSession(session.user.id);
      await update();
    }
  };

  return {
    session,
    refresh,
    isLoading: status === "loading",
    update,
  };
}
