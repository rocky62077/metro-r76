import { Router } from "express";
import { calculateReportComplianceController } from "../controllers/report-compliance.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

router.post(
  "/:reportId/calculate",
  protect,
  requireRole("admin", "engineer", "reviewer", "lab_manager"),
  calculateReportComplianceController,
);

export default router;
