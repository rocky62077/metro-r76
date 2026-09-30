import { Router } from "express";
import {
  createCalculationRule,
  getCalculationRules,
} from "../controllers/calculation-rule.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import repeatabilityCalculationRoutes from "./repeatability-calculation.routes.js";

const router = Router();

router.post(
  "/",
  protect,
  requireRole("admin", "lab_manager"),
  createCalculationRule,
);

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
  getCalculationRules,
);
router.use("/repeatability-calculations", repeatabilityCalculationRoutes);

export default router;
