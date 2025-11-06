import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Use the same fallback as used when signing tokens in authController
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_access";

export default async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // fetch user document so role checks are possible
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    req.user = user; // attach full user (no password)
    next();
  } catch (err) {
    console.error("Auth error:", err.message || err);
    return res.status(401).json({ message: "Invalid token" });
  }
}
