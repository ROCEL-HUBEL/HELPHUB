import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Feedback", feedbackSchema);
