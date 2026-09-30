import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getOimlTestDefinitions,
  getOimlTestDefinition,
} from "../services/oiml-test-engine.service.js";

export const getOimlTests = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const tests = getOimlTestDefinitions();

    res.status(200).json({
      success: true,
      data: {
        tests,
      },
    });
  } catch (error) {
    console.error("Get OIML tests error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch OIML tests",
    });
  }
};

export const getOimlTest = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { code } = req.params;

    if (typeof code !== "string") {
      res.status(400).json({
        success: false,
        message: "Test code is required",
      });
      return;
    }

    const test = getOimlTestDefinition(code.toUpperCase());

    if (!test) {
      res.status(404).json({
        success: false,
        message: "OIML test definition not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        test,
      },
    });
  } catch (error) {
    console.error("Get OIML test error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch OIML test",
    });
  }
};
