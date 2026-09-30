import { Router } from "express";

import {
  searchTestReports,
  getInstrumentTestHistory,
} from "../controllers/test-report-repository.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

const allRoles = [
  "admin",
  "engineer",
  "reviewer",
  "lab_manager",
  "viewer",
  "auditor",
] as const;

router.get("/search", protect, requireRole(...allRoles), searchTestReports);

router.get(
  "/instrument/:instrumentId/history",
  protect,
  requireRole(...allRoles),
  getInstrumentTestHistory,
);

export default router;
