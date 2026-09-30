import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getDashboardSummary } from "../services/dashboard.service.js";

export const getDashboard = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const dashboard = await getDashboardSummary();

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};
