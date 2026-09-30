import { Router } from "express";
import { calculateZeroSettingController } from "../controllers/zero-setting-calculation.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

router.post(
  "/calculate",
  protect,
  requireRole("admin", "engineer", "reviewer", "lab_manager"),
  calculateZeroSettingController,
);

export default router;
