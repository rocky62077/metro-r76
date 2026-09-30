import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { Instrument } from "../models/instrument.model.js";
import { calculateZeroSetting } from "../services/zero-setting-calculation.service.js";

export const calculateZeroSettingController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { instrumentId, zeroIndication } = req.body;

    if (!instrumentId || zeroIndication === undefined) {
      res.status(400).json({
        success: false,
        message: "Instrument ID and zero indication are required",
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

    const calculation = calculateZeroSetting({
      zeroIndication: Number(zeroIndication),
      verificationScaleInterval: instrument.scaleInterval,
    });

    res.status(200).json({
      success: true,
      message: "Zero-setting calculated successfully",
      data: {
        instrument: {
          id: instrument._id,
          instrumentName: instrument.instrumentName,
          serialNumber: instrument.serialNumber,
          scaleInterval: instrument.scaleInterval,
          scaleIntervalUnit: instrument.scaleIntervalUnit,
        },
        calculation,
      },
    });
  } catch (error) {
    console.error("Calculate zero-setting error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Zero-setting calculation failed",
    });
  }
};
