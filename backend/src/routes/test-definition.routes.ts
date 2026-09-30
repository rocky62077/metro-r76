import { Router } from "express";
import {
  createTestDefinition,
  getTestDefinitions,
} from "../controllers/test-definition.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

// Create a test definition
router.post(
  "/",
  protect,
  requireRole("admin", "lab_manager"),
  createTestDefinition,
);

// Get test definitions
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
  getTestDefinitions,
);

export default router;
