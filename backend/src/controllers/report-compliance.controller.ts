import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { TestReport } from "../models/test-report.model.js";
import { calculateReportCompliance } from "../services/report-compliance.service.js";
import { Instrument } from "../models/instrument.model.js";
export const calculateReportComplianceController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const reportId = req.params.reportId;

    if (typeof reportId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid report ID",
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

    if (report.status === "approved" || report.status === "completed") {
      res.status(400).json({
        success: false,
        message:
          "Compliance cannot be recalculated for an approved or completed report",
      });
      return;
    }

    const compliance = await calculateReportCompliance(reportId);

    report.overallResult = compliance.overallResult;

    await report.save();

    const instrumentId = report.instrument;

    const instrument = await Instrument.findById(instrumentId);

    if (!instrument) {
      res.status(404).json({
        success: false,
        message: "Instrument linked to report not found",
      });
      return;
    }

    if (compliance.overallResult === "pass") {
      instrument.status = "passed";
    } else if (compliance.overallResult === "fail") {
      instrument.status = "failed";
    }

    await instrument.save();

    res.status(200).json({
      success: true,
      message: "Report compliance calculated successfully",
      data: {
        report: {
          id: report._id,
          reportNumber: report.reportNumber,
          status: report.status,
          overallResult: report.overallResult,
        },
        compliance,
      },
    });
  } catch (error) {
    console.error("Calculate report compliance error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while calculating report compliance",
    });
  }
};
