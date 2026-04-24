import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Bug-Wise API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

export default router;
