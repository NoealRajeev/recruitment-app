// lib/otp-store.ts
type OTPEntry = {
  otp: string;
  expiresAt: number;
};

const otpStore = new Map<string, OTPEntry>();

export function saveOtp(identifier: string, otp: string, ttl = 5 * 60 * 1000) {
  otpStore.set(identifier, {
    otp,
    expiresAt: Date.now() + ttl,
  });
}

export function verifyOtp(identifier: string, enteredOtp: string): boolean {
  const entry = otpStore.get(identifier);
  if (!entry) return false;
  const isExpired = Date.now() > entry.expiresAt;
  const isValid = entry.otp === enteredOtp;

  if (isExpired || isValid) {
    otpStore.delete(identifier);
  }

  return !isExpired && isValid;
}
