import { Router } from "express";
import { calculateObservation } from "../controllers/observation-calculation.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

router.post(
  "/:observationId/calculate",
  protect,
  requireRole("admin", "engineer"),
  calculateObservation,
);

export default router;
