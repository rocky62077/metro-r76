import { Router } from "express";
import { calculateEccentricityController } from "../controllers/eccentricity-calculation.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

router.post(
  "/calculate",
  protect,
  requireRole("admin", "engineer", "reviewer", "lab_manager"),
  calculateEccentricityController,
);

export default router;
