import { Router } from "express";
import {
  createTestObservation,
  getTestObservations,
} from "../controllers/test-observation.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

router.post(
  "/",
  protect,
  requireRole("admin", "engineer"),
  createTestObservation,
);

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
  getTestObservations,
);

export default router;
