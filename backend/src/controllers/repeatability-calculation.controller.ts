import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { Instrument } from "../models/instrument.model.js";
import { calculateRepeatability } from "../services/repeatability-calculation.service.js";

export const calculateRepeatabilityController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      instrumentId,
      load,
      indicatedValues,
      verificationType = "initial",
    } = req.body;

    if (
      !instrumentId ||
      load === undefined ||
      !Array.isArray(indicatedValues)
    ) {
      res.status(400).json({
        success: false,
        message: "Instrument ID, load and indicated values are required",
      });
      return;
    }

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
        message: "Instrument accuracy class is required",
      });
      return;
    }

    const calculation = calculateRepeatability({
      indicatedValues,
      load: Number(load),
      verificationScaleInterval: instrument.scaleInterval,
      accuracyClass: instrument.accuracyClass as "I" | "II" | "III" | "IIII",
      verificationType,
    });

    res.status(200).json({
      success: true,
      message: "Repeatability calculated successfully",
      data: {
        instrument: {
          id: instrument._id,
          instrumentName: instrument.instrumentName,
          serialNumber: instrument.serialNumber,
          accuracyClass: instrument.accuracyClass,
          scaleInterval: instrument.scaleInterval,
          scaleIntervalUnit: instrument.scaleIntervalUnit,
        },
        calculation,
      },
    });
  } catch (error) {
    console.error("Calculate repeatability error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Repeatability calculation failed",
    });
  }
};
