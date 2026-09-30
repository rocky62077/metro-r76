import { Router } from "express";
import {
  transitionTestReport,
  getTestReportWorkflow,
} from "../controllers/test-report-workflow.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

const workflowRoles = [
  "admin",
  "engineer",
  "reviewer",
  "lab_manager",
  "viewer",
  "auditor",
] as const;

router.get(
  "/:reportId",
  protect,
  requireRole(...workflowRoles),
  getTestReportWorkflow,
);

router.patch(
  "/:reportId/status",
  protect,
  requireRole(...workflowRoles),
  transitionTestReport,
);

export default router;
