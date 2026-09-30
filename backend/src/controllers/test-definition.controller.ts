import { Request, Response } from "express";
import { TestDefinition } from "../models/test-definition.model.js";

export const createTestDefinition = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      code,
      name,
      description,
      category,
      standardReference,
      version,
      sequence,
    } = req.body;

    if (
      !code ||
      !name ||
      !category ||
      !standardReference ||
      !version ||
      sequence === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "Code, name, category, standardReference, version and sequence are required",
      });
      return;
    }

    const existingDefinition = await TestDefinition.findOne({
      code: code.toUpperCase(),
    });

    if (existingDefinition) {
      res.status(409).json({
        success: false,
        message: "Test definition with this code already exists",
      });
      return;
    }

    const testDefinition = await TestDefinition.create({
      code: code.toUpperCase(),
      name,
      description,
      category,
      standardReference,
      version,
      sequence,
    });

    res.status(201).json({
      success: true,
      message: "Test definition created successfully",
      data: {
        testDefinition,
      },
    });
  } catch (error) {
    console.error("Create test definition error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating test definition",
    });
  }
};

export const getTestDefinitions = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const testDefinitions = await TestDefinition.find().sort({ sequence: 1 });

    res.status(200).json({
      success: true,
      data: {
        testDefinitions,
      },
    });
  } catch (error) {
    console.error("Get test definitions error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching test definitions",
    });
  }
};
