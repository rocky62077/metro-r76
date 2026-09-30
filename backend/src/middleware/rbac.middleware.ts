import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";

export type UserRole =
  | "admin"
  | "engineer"
  | "reviewer"
  | "lab_manager"
  | "viewer"
  | "auditor";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
};
