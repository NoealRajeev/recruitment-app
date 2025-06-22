// lib/otp-store.ts
type OTPEntry = {
  otp: string;
  expiresAt: number;
  attempts: number;
  lastSent: number;
};

const otpStore = new Map<string, OTPEntry>();
const MAX_ATTEMPTS = 5;
const RESEND_DELAY = 60 * 1000; // 60 seconds

export function saveOtp(identifier: string, otp: string, ttl = 5 * 60 * 1000) {
  const existingEntry = otpStore.get(identifier);

  if (existingEntry && Date.now() - existingEntry.lastSent < RESEND_DELAY) {
    throw new Error(`Please wait before requesting a new OTP`);
  }

  otpStore.set(identifier, {
    otp,
    expiresAt: Date.now() + ttl,
    attempts: existingEntry?.attempts || 0,
    lastSent: Date.now(),
  });
}

export function verifyOtp(identifier: string, enteredOtp: string): boolean {
  const entry = otpStore.get(identifier);
  if (!entry) return false;

  const isExpired = Date.now() > entry.expiresAt;
  const isValid = entry.otp === enteredOtp;
  const attemptsExceeded = entry.attempts >= MAX_ATTEMPTS;

  if (isExpired || isValid || attemptsExceeded) {
    otpStore.delete(identifier);
  } else {
    // Increment attempt counter if not valid
    otpStore.set(identifier, {
      ...entry,
      attempts: entry.attempts + 1,
    });
  }

  return !isExpired && isValid;
}

export function canResendOtp(identifier: string): boolean {
  const entry = otpStore.get(identifier);
  if (!entry) return true;
  return Date.now() - entry.lastSent >= RESEND_DELAY;
}
