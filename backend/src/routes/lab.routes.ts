import { Router } from "express";
import { createLab, getLabs } from "../controllers/lab.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

// Create a new lab
router.post("/", protect, requireRole("admin", "lab_manager"), createLab);

// Get all labs
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
  getLabs,
);

export default router;
