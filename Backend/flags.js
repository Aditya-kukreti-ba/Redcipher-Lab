// ─── flags.js — Server-side flag definitions for levels 2–5 ──────────────────
// Level 1 flag lives in the frontend only (by design — it's the "easy" level).
// Levels 2–5 flags NEVER leave this file. The frontend sends the user's guess
// and this module returns pass/fail only — no flag text is ever sent over the wire.

// Flags are stored hashed so that even if someone reads your server memory or
// logs they can't extract the real values.
// We use a simple constant-time comparison to prevent timing attacks.

const crypto = require("crypto");

// ─── Raw flags (only ever read server-side) ───────────────────────────────────
const FLAGS = {
  2: "redcipher{context_confusion}",
  3: "redcipher{policy_bypass}",
  4: "redcipher{admin_escalation}",
  5: "redcipher{indirect_override_master}",
};

// ─── Pre-hash flags at startup so comparison is always against digests ────────
const FLAG_HASHES = {};
for (const [level, flag] of Object.entries(FLAGS)) {
  FLAG_HASHES[level] = crypto
    .createHash("sha256")
    .update(flag.toLowerCase().trim())
    .digest("hex");
}

// ─── Validate a submitted flag ────────────────────────────────────────────────
// Returns { valid: boolean }
// Never returns the correct flag in the response.
function validateFlag(levelId, submittedFlag) {
  const id = String(levelId);

  // Level 1 is validated client-side — reject server-side calls for it
  if (id === "1") {
    return { valid: false, error: "Level 1 is validated client-side" };
  }

  if (!FLAG_HASHES[id]) {
    return { valid: false, error: "Unknown level" };
  }

  const submittedHash = crypto
    .createHash("sha256")
    .update((submittedFlag || "").toLowerCase().trim())
    .digest("hex");

  // crypto.timingSafeEqual prevents timing attacks
  const expected = Buffer.from(FLAG_HASHES[id], "hex");
  const received = Buffer.from(submittedHash, "hex");
  const valid = crypto.timingSafeEqual(expected, received);

  return { valid };
}

module.exports = { validateFlag };
