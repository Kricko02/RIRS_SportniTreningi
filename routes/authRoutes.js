import express from "express";
import { signup, signin, refreshToken, createUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
const router = express.Router();

// Allow public signup. Role can be set from the signup form (e.g. 'user' or 'admin').
router.post("/signup", signup);
// Admin-only create user endpoint
router.post("/create", authMiddleware, createUser);
router.post("/signin", signin);
router.post("/refresh", refreshToken);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
});

export default router;
