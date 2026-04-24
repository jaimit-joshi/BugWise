import { Router } from "express";
import User from "../models/User.js";
import {
  authMiddleware,
  generateToken,
} from "../middleware/authMiddleware.js";

const router = Router();

// ── POST /api/auth/signup ─────────────────────────────────
router.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are all required.",
      });
    }
    const allowedDomains = [
      "gmail.com",
      "northeastern.edu",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com",
      "protonmail.com",
    ];
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!emailDomain || !allowedDomains.includes(emailDomain)) {
      return res.status(400).json({
        success: false,
        error: "Please use a valid email domain (Gmail, Northeastern, Yahoo, Outlook, etc.)",
      });
    }
    if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 8 characters.",
        });
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
          success: false,
          error: "Password must include at least one uppercase letter.",
        });
      }
      if (!/[0-9]/.test(password)) {
        return res.status(400).json({
          success: false,
          error: "Password must include at least one number.",
        });
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return res.status(400).json({
          success: false,
          error: "Password must include at least one special character.",
        });
      }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists.",
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("[Auth] Signup error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create account. Please try again.",
    });
  }
});

// ── POST /api/auth/login ──────────────────────────────────
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    // Find user with password field included
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          generationCount: user.generationCount,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("[Auth] Login error:", error.message);
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────
router.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        generationCount: user.generationCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[Auth] Me error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch profile." });
  }
});

export default router;
