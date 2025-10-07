import { Router } from "express";
import Customer from "../models/customer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ======================================================
// 🔐 Helper: Generate JWT
// ======================================================
function generateToken(id, role) {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1d" });
}

// ======================================================
// 🧑 CUSTOMER SIGNUP (Email + Password)
// ======================================================
router.post("/customer/signup", async (req, res) => {
  try {
    const { full_name, username, digital_address, country, mobile, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    const [existing] = await pool.query("SELECT id FROM customers WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO customers (full_name, username, digital_address, country, mobile, email, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, username, digital_address, country, mobile, email, hashedPassword]
    );

    res.status(201).json({ message: "Signup successful! You can now log in." });
  } catch (err) {
    console.error("❌ Customer signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// 🧑 CUSTOMER LOGIN (Email + Password)
// ======================================================
router.post("/customer/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM customers WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user.id, "customer");

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("❌ Customer login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// 🧰 PROVIDER SIGNUP (Email + Password)
// ======================================================
router.post("/provider/signup", async (req, res) => {
  try {
    const { business_name, owner_name, service_type, location, email, password } = req.body;

    if (!business_name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    const [existing] = await pool.query("SELECT id FROM providers WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO providers (business_name, owner_name, service_type, location, email, password_hash, approved)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [business_name, owner_name, service_type, location, email, hashedPassword, 0]
    );

    res.status(201).json({ message: "Signup successful! Awaiting admin approval." });
  } catch (err) {
    console.error("❌ Provider signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// 🧰 PROVIDER LOGIN (Email + Password)
// ======================================================
router.post("/provider/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM providers WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const provider = rows[0];
    if (!provider.approved) {
      return res.status(403).json({ message: "Your account has not been approved yet." });
    }

    const validPassword = await bcrypt.compare(password, provider.password_hash);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(provider.id, "provider");

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: provider.id,
        business_name: provider.business_name,
        email: provider.email,
        approved: provider.approved,
      },
    });
  } catch (err) {
    console.error("❌ Provider login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// 🌐 GOOGLE OAUTH (Customers + Providers)
// ======================================================

// Step 1: Redirect to Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  async (req, res) => {
    try {
      const { email, name } = req.user;

      // check if user already exists
      const [existing] = await pool.query("SELECT id FROM customers WHERE email = ?", [email]);
      let userId;

      if (existing.length > 0) {
        userId = existing[0].id;
      } else {
        const [result] = await pool.query(
          "INSERT INTO customers (full_name, email, username, auth_provider) VALUES (?, ?, ?, ?)",
          [name, email, email.split("@")[0], "google"]
        );
        userId = result.insertId;
      }

      const token = generateToken(userId, "customer");
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
    } catch (err) {
      console.error("❌ Google OAuth error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

router.get("/login-failed", (req, res) => {
  res.status(401).json({ message: "Google login failed" });
});

export default router;
