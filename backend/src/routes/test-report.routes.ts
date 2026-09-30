import { Router } from "express";
import {
  createTestReport,
  getTestReports,
} from "../controllers/test-report.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

// Create a test report
router.post("/", protect, requireRole("admin", "engineer"), createTestReport);

// Get test reports
router.get(
  "/",
  protect,
  requireRole(
    "admin",
    "engineer",
    "reviewer",
    "lab_manager",
    "viewer",
    "auditor",
  ),
  getTestReports,
);

export default router;
