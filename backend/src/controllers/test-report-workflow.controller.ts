import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { TestReport } from "../models/test-report.model.js";
import {
  validateTransition,
  getAvailableTransitions,
  TestReportStatus,
  UserRole,
} from "../services/test-report-workflow.service.js";

export const transitionTestReport = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { reportId } = req.params;
    const { status: nextStatus } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!reportId) {
      res.status(400).json({
        success: false,
        message: "Report ID is required",
      });
      return;
    }

    const validStatuses: TestReportStatus[] = [
      "draft",
      "in_progress",
      "submitted",
      "under_review",
      "approved",
      "rejected",
      "completed",
    ];

    if (!validStatuses.includes(nextStatus)) {
      res.status(400).json({
        success: false,
        message: "Invalid target status",
      });
      return;
    }

    const report = await TestReport.findById(reportId);

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Test report not found",
      });
      return;
    }

    const currentStatus = report.status as TestReportStatus;
    const role = req.user.role as UserRole;

    validateTransition(currentStatus, nextStatus, role);

    report.status = nextStatus;
    await report.save();

    res.status(200).json({
      success: true,
      message: `Test report transitioned from ${currentStatus} to ${nextStatus}`,
      data: {
        reportId: report._id,
        reportNumber: report.reportNumber,
        previousStatus: currentStatus,
        status: report.status,
        availableNextStatuses: getAvailableTransitions(
          report.status as TestReportStatus,
          role,
        ),
      },
    });
  } catch (error) {
    console.error("Test report workflow error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to transition test report";

    res.status(403).json({
      success: false,
      message,
    });
  }
};

export const getTestReportWorkflow = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { reportId } = req.params;

    const report = await TestReport.findById(reportId);

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Test report not found",
      });
      return;
    }

    const role = req.user.role as UserRole;

    const availableNextStatuses = getAvailableTransitions(
      report.status as TestReportStatus,
      role,
    );

    res.status(200).json({
      success: true,
      data: {
        reportId: report._id,
        reportNumber: report.reportNumber,
        currentStatus: report.status,
        role,
        availableNextStatuses,
      },
    });
  } catch (error) {
    console.error("Get test report workflow error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch test report workflow",
    });
  }
};
