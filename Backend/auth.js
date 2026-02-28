// ─── auth.js — User registration, login, JWT middleware ─────────────────────
// All authentication logic is isolated here.
// Import { register, login, requireAuth } in server.js.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "7d";
const BCRYPT_ROUNDS = 12;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in .env");
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function safeUser(user) {
  return { id: user.id, email: user.email, name: user.name };
}

// ─── Register ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { email, password, name }
async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "email, password and name are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = db.findUserByEmail(email.trim());
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const result = db.createUser(email.trim().toLowerCase(), name.trim(), hashed);
    const token = signToken({ userId: result.lastInsertRowid });

    return res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, email: email.trim().toLowerCase(), name: name.trim() },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = db.findUserByEmail(email.trim());
    if (!user) {
      // Generic message — don't reveal whether the email exists
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ userId: user.id });

    return res.json({
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
}

// ─── requireAuth middleware ────────────────────────────────────────────────────
// Attach this to any route that needs authentication.
// Sets req.userId on success.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired — please log in again" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { register, login, requireAuth };
