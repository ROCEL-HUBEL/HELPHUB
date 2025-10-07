// src/models/ServiceProvider.js
import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, // from Google OAuth
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String },
  profile_image: { type: String },
  company_name: { type: String },
  service_category: { type: String },
  mobile_number: { type: String },
  status: { type: String, default: "pending" }, // pending | approved | rejected
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("ServiceProvider", providerSchema);
