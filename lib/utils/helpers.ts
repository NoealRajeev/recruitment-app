// lip/utils/helpers.ts
export default function logSecurityEvent(
  event: string,
  metadata: Record<string, unknown>
) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...metadata,
    })
  );
}
