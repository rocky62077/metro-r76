import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { calculateEccentricity } from "../services/eccentricity-calculation.service.js";

export const calculateEccentricityController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { referenceIndication, readings, maximumPermissibleError } = req.body;

    if (
      referenceIndication === undefined ||
      !Array.isArray(readings) ||
      maximumPermissibleError === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "Reference indication, readings and maximum permissible error are required",
      });
      return;
    }

    const calculation = calculateEccentricity({
      referenceIndication: Number(referenceIndication),
      readings,
      maximumPermissibleError: Number(maximumPermissibleError),
    });

    res.status(200).json({
      success: true,
      message: "Eccentricity calculated successfully",
      data: {
        calculation,
      },
    });
  } catch (error) {
    console.error("Calculate eccentricity error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Eccentricity calculation failed",
    });
  }
};
