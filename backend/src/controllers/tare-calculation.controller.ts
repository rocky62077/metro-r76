import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { calculateTare } from "../services/tare-calculation.service.js";

export const calculateTareController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      grossLoad,
      tareValue,
      indicatedNetValue,
      verificationScaleInterval,
      maximumPermissibleError,
    } = req.body;

    if (
      grossLoad === undefined ||
      tareValue === undefined ||
      indicatedNetValue === undefined ||
      verificationScaleInterval === undefined ||
      maximumPermissibleError === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "Gross load, tare value, indicated net value, verification scale interval and maximum permissible error are required",
      });
      return;
    }

    const calculation = calculateTare({
      grossLoad: Number(grossLoad),
      tareValue: Number(tareValue),
      indicatedNetValue: Number(indicatedNetValue),
      verificationScaleInterval: Number(verificationScaleInterval),
      maximumPermissibleError: Number(maximumPermissibleError),
    });

    res.status(200).json({
      success: true,
      message: "Tare calculated successfully",
      data: {
        calculation,
      },
    });
  } catch (error) {
    console.error("Calculate tare error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Tare calculation failed",
    });
  }
};
