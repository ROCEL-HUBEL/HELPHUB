import express from "express";
import ServiceProvider from "../models/ServiceProvider.js"; // ✅ import your mongoose model

const router = express.Router();

// ✅ Add a provider (admin action)
router.post("/add", async (req, res) => {
  try {
    const newProvider = new ServiceProvider(req.body);
    await newProvider.save();
    res.status(201).json({ message: "Provider added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all providers
router.get("/", async (req, res) => {
  try {
    const providers = await ServiceProvider.find();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching providers" });
  }
});

// ✅ Update provider status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await ServiceProvider.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Provider status updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating provider" });
  }
});

export default router;
