// src/models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  username: { type: String },
  password_hash: { type: String },
  mobile_number: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Customer", customerSchema);
