import { Router } from "express";
import {
  getOimlTests,
  getOimlTest,
} from "../controllers/oiml-test-engine.controller.js";
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
  getOimlTests,
);

router.get(
  "/:code",
  protect,
  requireRole(
    "admin",
    "engineer",
    "reviewer",
    "lab_manager",
    "viewer",
    "auditor",
  ),
  getOimlTest,
);

export default router;
