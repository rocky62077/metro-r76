import { Response } from "express";
import { TestReport } from "../models/test-report.model.js";
import { Instrument } from "../models/instrument.model.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const searchTestReports = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      reportNumber,
      serialNumber,
      status,
      overallResult,
      fromDate,
      toDate,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter: Record<string, unknown> = {};

    if (reportNumber) {
      filter.reportNumber = {
        $regex: String(reportNumber),
        $options: "i",
      };
    }

    if (status) {
      filter.status = String(status);
    }

    if (overallResult) {
      filter.overallResult = String(overallResult);
    }

    if (fromDate || toDate) {
      const testDate: Record<string, Date> = {};

      if (fromDate) {
        testDate.$gte = new Date(`${String(fromDate)}T00:00:00.000Z`);
      }

      if (toDate) {
        testDate.$lte = new Date(`${String(toDate)}T23:59:59.999Z`);
      }

      filter.testDate = testDate;
    }

    if (serialNumber) {
      const instruments = await Instrument.find({
        serialNumber: {
          $regex: String(serialNumber),
          $options: "i",
        },
      })
        .select("_id")
        .lean();

      filter.instrument = {
        $in: instruments.map((instrument) => instrument._id),
      };
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [reports, total] = await Promise.all([
      TestReport.find(filter)
        .populate(
          "instrument",
          "instrumentName instrumentType modelNumber serialNumber capacity capacityUnit scaleInterval scaleIntervalUnit accuracyClass",
        )
        .populate("lab", "name code city state")
        .populate("testedBy", "name email role")
        .sort({
          testDate: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      TestReport.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Search test reports error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search test reports",
    });
  }
};

export const getInstrumentTestHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { instrumentId } = req.params;

    const instrument = await Instrument.findById(instrumentId)
      .populate("manufacturer", "name code")
      .populate("lab", "name code city state")
      .lean();

    if (!instrument) {
      res.status(404).json({
        success: false,
        message: "Instrument not found",
      });

      return;
    }

    const reports = await TestReport.find({
      instrument: instrumentId,
    })
      .populate("testedBy", "name email role")
      .sort({
        testDate: -1,
        createdAt: -1,
      })
      .lean();

    const summary = {
      totalReports: reports.length,

      passedReports: reports.filter((report) => report.overallResult === "pass")
        .length,

      failedReports: reports.filter((report) => report.overallResult === "fail")
        .length,

      pendingReports: reports.filter(
        (report) => report.overallResult === "pending",
      ).length,

      latestReport: reports.length > 0 ? reports[0] : null,
    };

    res.status(200).json({
      success: true,
      data: {
        instrument,
        summary,
        reports,
      },
    });
  } catch (error) {
    console.error("Instrument test history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve instrument test history",
    });
  }
};
