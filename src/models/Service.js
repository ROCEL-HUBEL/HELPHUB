import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Service", serviceSchema);
