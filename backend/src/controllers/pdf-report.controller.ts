import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { generatePdfReport } from "../services/pdf-report.service.js";

export const downloadPdfReport = async (
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

    if (!reportId) {
      res.status(400).json({
        success: false,
        message: "Report ID is required",
      });
      return;
    }

    const pdfBuffer = await generatePdfReport(reportId);

    res.status(200);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="test-report-${reportId}.pdf"`,
    );

    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF report generation error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to generate PDF report";

    if (message === "Test report not found") {
      res.status(404).json({
        success: false,
        message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message,
    });
  }
};
