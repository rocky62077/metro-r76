import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { TestReport } from "../models/test-report.model.js";
import { Instrument } from "../models/instrument.model.js";
import { Lab } from "../models/lab.model.js";

export const createTestReport = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { reportNumber, instrument, lab, testDate, remarks } = req.body;

    if (!reportNumber || !instrument || !lab) {
      res.status(400).json({
        success: false,
        message: "Report number, instrument and lab are required",
      });
      return;
    }

    const existingReport = await TestReport.findOne({
      reportNumber,
    });

    if (existingReport) {
      res.status(409).json({
        success: false,
        message: "Test report with this report number already exists",
      });
      return;
    }

    const instrumentExists = await Instrument.findById(instrument);

    if (!instrumentExists) {
      res.status(404).json({
        success: false,
        message: "Instrument not found",
      });
      return;
    }

    const labExists = await Lab.findById(lab);

    if (!labExists) {
      res.status(404).json({
        success: false,
        message: "Lab not found",
      });
      return;
    }

    if (!labExists.isActive) {
      res.status(400).json({
        success: false,
        message: "Lab is inactive",
      });
      return;
    }

    if (instrumentExists.lab.toString() !== lab) {
      res.status(400).json({
        success: false,
        message: "Instrument does not belong to the selected lab",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const report = await TestReport.create({
      reportNumber,
      instrument,
      lab,
      testDate: testDate || new Date(),
      testedBy: req.user.id,
      remarks,
    });

    const populatedReport = await TestReport.findById(report._id)
      .populate(
        "instrument",
        "instrumentName instrumentType modelNumber serialNumber",
      )
      .populate("lab", "name code")
      .populate("testedBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Test report created successfully",
      data: {
        report: populatedReport,
      },
    });
  } catch (error) {
    console.error("Create test report error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating test report",
    });
  }
};

export const getTestReports = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const reports = await TestReport.find()
      .populate(
        "instrument",
        "instrumentName instrumentType modelNumber serialNumber",
      )
      .populate("lab", "name code")
      .populate("testedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        reports,
      },
    });
  } catch (error) {
    console.error("Get test reports error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching test reports",
    });
  }
};
