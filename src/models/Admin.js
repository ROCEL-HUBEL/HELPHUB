import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "admin" },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Admin", adminSchema);
