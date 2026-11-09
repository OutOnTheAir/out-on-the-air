// ============================================================
// Small callsign helpers shared by the log forms and the import page.
// ============================================================

// Uppercases and strips spaces so "kc1nhe " and "KC1NHE" compare equal.
export function cleanCallsign(input: string): string {
  return input.toUpperCase().replace(/\s+/g, '')
}

// Loose sanity check, not a license lookup. Accepts things like W1DNS,
// KC1NHE, 4U1UN, A61AA, and portable forms such as W1DNS/P or VE3/W1DNS.
// Needs at least one letter and one digit, 3 to 14 characters.
export function isPlausibleCallsign(call: string): boolean {
  if (call.length < 3 || call.length > 14) return false
  if (!/^[A-Z0-9]+(\/[A-Z0-9]+)*$/.test(call)) return false
  return /[A-Z]/.test(call) && /[0-9]/.test(call)
}
