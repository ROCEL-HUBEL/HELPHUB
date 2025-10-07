import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  provider_id: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProvider", required: true },
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  scheduled_date: { type: Date },
  status: { type: String, default: "pending" },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);
