import { Router } from "express";
import {
  createInstrument,
  getInstruments,
} from "../controllers/instrument.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

// Create instrument
router.post(
  "/",
  protect,
  requireRole("admin", "lab_manager", "engineer"),
  createInstrument,
);

// Get all instruments
router.get(
  "/",
  protect,
  requireRole(
    "admin",
    "lab_manager",
    "engineer",
    "reviewer",
    "viewer",
    "auditor",
  ),
  getInstruments,
);

export default router;
