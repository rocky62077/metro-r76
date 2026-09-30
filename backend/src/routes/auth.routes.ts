import { Router } from "express";

import { register, login, getMe } from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);

router.get(
  "/engineer-test",
  protect,
  requireRole("engineer", "admin"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Engineer/Admin access granted",
    });
  },
);

router.get("/admin-test", protect, requireRole("admin"), (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
  });
});

export default router;
