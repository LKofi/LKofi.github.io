/**
 * In-memory example of balanced journal validation and idempotent posting.
 * A real ledger needs atomic database transactions, unique constraints,
 * durable idempotency storage, authorization and observability.
 */
export class JournalError extends Error {
  constructor(code, reason) {
    super(reason);
    this.name = "JournalError";
    this.code = code;
  }
}
export function createJournal() {
  return { receipts: new Map(), entries: [] };
}
export function postJournal(store, { key, lines }) {
  if (!store?.receipts || !store?.entries || typeof key !== "string" || key.trim().length < 8) {
    throw new JournalError("INVALID_REQUEST", "Invalid journal request");
  }
  if (!Array.isArray(lines) || lines.length < 2) {
    throw new JournalError("INVALID_LINES", "A journal needs two or more lines");
  }
  const currency = lines[0]?.currency;
  if (!/^[A-Z]{3}$/.test(currency ?? "")) {
    throw new JournalError("INVALID_CURRENCY", "Use one ISO-style currency code");
  }
  const refs = new Set();
  let balance = 0n;
  for (const line of lines) {
    if (!line || typeof line.account !== "string" || !line.account.trim() || refs.has(line.account)) {
      throw new JournalError("INVALID_ACCOUNT", "Unique account names are required");
    }
    refs.add(line.account);
    if (line.currency !== currency || !Number.isSafeInteger(line.amountMinor) || line.amountMinor === 0) {
      throw new JournalError("INVALID_AMOUNT", "Use nonzero safe integers in the same currency");
    }
    balance += BigInt(line.amountMinor);
  }
  if (balance !== 0n) throw new JournalError("UNBALANCED", "Journal must balance to zero");
  const normalized = lines.map(({ account, amountMinor }) => ({ account, amountMinor }));
  const fingerprint = JSON.stringify({ currency, lines: normalized });
  const previous = store.receipts.get(key);
  if (previous) {
    if (previous.fingerprint !== fingerprint) throw new JournalError("KEY_CONFLICT", "Idempotency key reused for different data");
    return Object.freeze({ id: previous.id, replayed: true });
  }
  // All checks finish before any in-memory state mutation.
  const id = "entry-" + String(store.receipts.size + 1);
  const immutable = Object.freeze(normalized.map(row => Object.freeze({ ...row, currency, journalId: id })));
  store.entries.push(...immutable);
  store.receipts.set(key, Object.freeze({ id, fingerprint }));
  return Object.freeze({ id, replayed: false });
}
