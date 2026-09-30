import { Router } from "express";
import {
  createManufacturer,
  getManufacturers,
} from "../controllers/manufacturer.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

// Create manufacturer
router.post(
  "/",
  protect,
  requireRole("admin", "lab_manager"),
  createManufacturer,
);

// Get all manufacturers
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
  getManufacturers,
);

export default router;
