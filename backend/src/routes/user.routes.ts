import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUserStatus,
  updateUserRole,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

router.post("/", protect, requireRole("admin"), createUser);

router.get("/", protect, requireRole("admin"), getUsers);
router.patch("/:id/status", protect, requireRole("admin"), updateUserStatus);
router.patch("/:id/role", protect, requireRole("admin"), updateUserRole);

export default router;
