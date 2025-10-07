import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Rating", ratingSchema);
