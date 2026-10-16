import { createHmac, timingSafeEqual } from "node:crypto";
/**
 * Minimal event signature demonstration. Assumes a trusted HTTPS endpoint,
 * rotated shared secrets and durable deduplication in a production system.
 */
export function signedHeader({ secret, timestamp, rawBody }) {
  const hex = createHmac("sha256", secret).update(String(timestamp) + "." + rawBody).digest("hex");
  return "sha256=" + hex;
}
export function verifyEvent({ secret, timestamp, rawBody, signature, nowMs = Date.now(), windowMs = 300000 }) {
  if (typeof secret !== "string" || secret.length < 16 ||
      typeof rawBody !== "string" || typeof signature !== "string" ||
      !Number.isSafeInteger(timestamp) || !Number.isFinite(nowMs) ||
      !Number.isFinite(windowMs) || windowMs <= 0 ||
      Math.abs(nowMs - timestamp * 1000) > windowMs ||
      !/^sha256=[a-f0-9]{64}$/.test(signature)) return false;
  const expected = signedHeader({ secret, timestamp, rawBody });
  const a = Buffer.from(expected, "utf8"), b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
