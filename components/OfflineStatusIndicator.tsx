"use client";
import dynamic from "next/dynamic";

// Create a version that never renders on server
const DynamicOfflineStatusIndicator = dynamic(
  () => import("./OfflineStatusIndicatorInner"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function OfflineStatusIndicator() {
  return <DynamicOfflineStatusIndicator />;
}
