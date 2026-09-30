import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { TestObservation } from "../models/test-observation.model.js";
import { Instrument } from "../models/instrument.model.js";
import { calculateObservationResult } from "../services/observation-calculation.service.js";

export const calculateObservation = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { observationId } = req.params;

    const observation = await TestObservation.findById(observationId);

    if (!observation) {
      res.status(404).json({
        success: false,
        message: "Test observation not found",
      });
      return;
    }

    if (
      observation.inputValue === undefined ||
      observation.indicatedValue === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "Input value and indicated value are required before calculation",
      });
      return;
    }

    const report = await observation.populate("testReport");

    const testReport = report.testReport as {
      instrument?: unknown;
    };

    if (!testReport || !testReport.instrument) {
      res.status(400).json({
        success: false,
        message: "Instrument information is missing from test report",
      });
      return;
    }

    const instrumentId = testReport.instrument;

    const instrument = await Instrument.findById(instrumentId);

    if (!instrument) {
      res.status(404).json({
        success: false,
        message: "Instrument not found",
      });
      return;
    }

    if (!instrument.accuracyClass) {
      res.status(400).json({
        success: false,
        message: "Instrument accuracy class is required before calculation",
      });
      return;
    }

    const calculation = calculateObservationResult({
      inputValue: observation.inputValue,
      indicatedValue: observation.indicatedValue,
      verificationScaleInterval: instrument.scaleInterval,
      accuracyClass: instrument.accuracyClass as "I" | "II" | "III" | "IIII",
      verificationType: "initial",
    });

    observation.errorValue = calculation.actualError;
    observation.errorUnit =
      observation.inputUnit || instrument.scaleIntervalUnit;

    observation.toleranceValue = calculation.maximumPermissibleError;

    observation.toleranceUnit =
      observation.inputUnit || instrument.scaleIntervalUnit;

    observation.result = calculation.result;
    observation.calculatedAt = new Date();

    await observation.save();

    const updatedObservation = await TestObservation.findById(observation._id)
      .populate(
        "testReport",
        "reportNumber instrument lab status overallResult",
      )
      .populate(
        "testDefinition",
        "code name category standardReference version",
      )
      .populate("enteredBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Observation calculated successfully",
      data: {
        observation: updatedObservation,
        calculation: {
          actualError: calculation.actualError,
          maximumPermissibleError: calculation.maximumPermissibleError,
          lowerLimit: calculation.lowerLimit,
          upperLimit: calculation.upperLimit,
          verificationIntervals: calculation.verificationIntervals,
          result: calculation.result,
        },
      },
    });
  } catch (error) {
    console.error("Calculate observation error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while calculating observation",
    });
  }
};
