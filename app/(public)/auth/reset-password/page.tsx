"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// this lives in a client component, so ssr:false is allowed
const ResetPasswordForm = dynamic(() => import("./ResetPasswordForm"), {
  ssr: false,
});

export default function ResetPasswordLoader() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading reset form…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
