import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { TestObservation } from "../models/test-observation.model.js";
import { TestReport } from "../models/test-report.model.js";
import { TestDefinition } from "../models/test-definition.model.js";

export const createTestObservation = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      testReport,
      testDefinition,
      observationNumber,
      inputValue,
      inputUnit,
      indicatedValue,
      indicatedUnit,
      remarks,
      rawData,
    } = req.body;

    if (!testReport || !testDefinition || observationNumber === undefined) {
      res.status(400).json({
        success: false,
        message:
          "Test report, test definition and observation number are required",
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

    if (Number(observationNumber) < 1) {
      res.status(400).json({
        success: false,
        message: "Observation number must be at least 1",
      });
      return;
    }

    const reportExists = await TestReport.findById(testReport);

    if (!reportExists) {
      res.status(404).json({
        success: false,
        message: "Test report not found",
      });
      return;
    }

    if (
      reportExists.status === "approved" ||
      reportExists.status === "completed"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Observations cannot be added to an approved or completed report",
      });
      return;
    }

    const definitionExists = await TestDefinition.findById(testDefinition);

    if (!definitionExists) {
      res.status(404).json({
        success: false,
        message: "Test definition not found",
      });
      return;
    }

    if (!definitionExists.isActive) {
      res.status(400).json({
        success: false,
        message: "Test definition is inactive",
      });
      return;
    }

    const existingObservation = await TestObservation.findOne({
      testReport,
      testDefinition,
      observationNumber,
    });

    if (existingObservation) {
      res.status(409).json({
        success: false,
        message: "Observation with this number already exists for this test",
      });
      return;
    }

    const observation = await TestObservation.create({
      testReport,
      testDefinition,
      observationNumber,
      inputValue,
      inputUnit,
      indicatedValue,
      indicatedUnit,
      remarks,
      rawData,
      enteredBy: req.user.id,
      result: "pending",
    });

    const populatedObservation = await TestObservation.findById(observation._id)
      .populate(
        "testReport",
        "reportNumber instrument lab status overallResult",
      )
      .populate(
        "testDefinition",
        "code name category standardReference version",
      )
      .populate("enteredBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Test observation created successfully",
      data: {
        observation: populatedObservation,
      },
    });
  } catch (error) {
    console.error("Create test observation error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating test observation",
    });
  }
};

export const getTestObservations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { testReport } = req.query;

    const filter: Record<string, unknown> = {};

    if (testReport) {
      filter.testReport = testReport;
    }

    const observations = await TestObservation.find(filter)
      .populate(
        "testReport",
        "reportNumber instrument lab status overallResult",
      )
      .populate(
        "testDefinition",
        "code name category standardReference version",
      )
      .populate("enteredBy", "name email role")
      .sort({
        testReport: 1,
        observationNumber: 1,
      });

    res.status(200).json({
      success: true,
      data: {
        observations,
      },
    });
  } catch (error) {
    console.error("Get test observations error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching test observations",
    });
  }
};
