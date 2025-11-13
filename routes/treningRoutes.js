import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  getTrenings,
  createTrening,
  updateTrening,
  deleteTrening,
  joinTrening,
  leaveTrening,
} from "../controllers/treningController.js";

const router = express.Router();

// Public route - no authentication required
router.get("/", getTrenings);

// Protected routes - authentication required
router.use(auth);

router.post("/", createTrening);
router.put("/:id", updateTrening);
router.delete("/:id", deleteTrening);
router.post("/:id/join", joinTrening);
router.post("/:id/leave", leaveTrening);

export default router;
