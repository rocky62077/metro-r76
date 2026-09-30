import { Router } from "express";
import { downloadPdfReport } from "../controllers/pdf-report.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

router.get(
  "/:reportId",
  protect,
  requireRole(
    "admin",
    "engineer",
    "reviewer",
    "lab_manager",
    "viewer",
    "auditor",
  ),
  downloadPdfReport,
);

export default router;
