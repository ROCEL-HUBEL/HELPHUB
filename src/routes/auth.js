// src/routes/auth.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import Customer from "../models/customer.js";
import ServiceProvider from "../models/ServiceProvider.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ======================================================
// 🧩 Helper: Generate JWT
// ======================================================
function generateToken(userId, role) {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "1d" });
}

// ======================================================
// 🌐 GOOGLE LOGIN/SIGNUP
// ======================================================
router.get("/google", (req, res, next) => {
  const { role } = req.query; // 'customer' or 'provider'
  req.session.userRole = role;
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

// ======================================================
// 🌐 GOOGLE CALLBACK
// ======================================================
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  async (req, res) => {
    try {
      const { email, name } = req.user;
      const role = req.session.userRole || "customer";

      let user;

      if (role === "customer") {
        user = await Customer.findOne({ email });
        if (!user) {
          user = new Customer({
            full_name: name,
            email,
            username: email.split("@")[0],
          });
          await user.save();
        }
      } else if (role === "provider") {
        user = await ServiceProvider.findOne({ email });
        if (!user) {
          user = new ServiceProvider({
            full_name: name,
            email,
            username: email.split("@")[0],
            status: "pending",
          });
          await user.save();
        }

        if (user.status !== "approved") {
          return res.redirect(`${process.env.FRONTEND_URL}/pending-approval`);
        }
      }

      const token = generateToken(user._id, role);
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
    } catch (err) {
      console.error("Google OAuth error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// ======================================================
// 🚫 LOGIN FAILED
// ======================================================
router.get("/login-failed", (req, res) => {
  res.status(401).json({ message: "Google login failed" });
});

export default router;
