import { Request, Response } from "express";
import { CalculationRule } from "../models/calculation-rule.model.js";

export const createCalculationRule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      code,
      name,
      standardReference,
      version,
      testCategory,
      accuracyClass,
      minLoad,
      maxLoad,
      formulaType,
      parameters,
    } = req.body;

    if (
      !code ||
      !name ||
      !standardReference ||
      !version ||
      !testCategory ||
      !formulaType
    ) {
      res.status(400).json({
        success: false,
        message:
          "Code, name, standardReference, version, testCategory and formulaType are required",
      });
      return;
    }

    const existingRule = await CalculationRule.findOne({
      code: code.toUpperCase(),
    });

    if (existingRule) {
      res.status(409).json({
        success: false,
        message: "Calculation rule with this code already exists",
      });
      return;
    }

    if (
      minLoad !== undefined &&
      maxLoad !== undefined &&
      Number(minLoad) > Number(maxLoad)
    ) {
      res.status(400).json({
        success: false,
        message: "Minimum load cannot be greater than maximum load",
      });
      return;
    }

    const calculationRule = await CalculationRule.create({
      code: code.toUpperCase(),
      name,
      standardReference,
      version,
      testCategory,
      accuracyClass,
      minLoad,
      maxLoad,
      formulaType,
      parameters: parameters || {},
    });

    res.status(201).json({
      success: true,
      message: "Calculation rule created successfully",
      data: {
        calculationRule,
      },
    });
  } catch (error) {
    console.error("Create calculation rule error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating calculation rule",
    });
  }
};

export const getCalculationRules = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const calculationRules = await CalculationRule.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: {
        calculationRules,
      },
    });
  } catch (error) {
    console.error("Get calculation rules error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching calculation rules",
    });
  }
};
