import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "../db-old.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const [user] = await pool.query("SELECT * FROM users WHERE google_id = ?", [profile.id]);
      if (user.length > 0) return done(null, user[0]);

      const name = profile.displayName;
      const email = profile.emails[0].value;
      const avatar = profile.photos[0].value;

      const [result] = await pool.query(
        "INSERT INTO users (role, full_name, email, google_id, avatar_url, email_verified) VALUES (?, ?, ?, ?, ?, ?)",
        ['customer', name, email, profile.id, avatar, 1]
      );

      const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
      done(null, newUser[0]);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  done(null, user[0]);
});
