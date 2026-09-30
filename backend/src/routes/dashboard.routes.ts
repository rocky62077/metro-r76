import { Router } from "express";

import { getDashboard } from "../controllers/dashboard.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

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
  getDashboard,
);

export default router;
