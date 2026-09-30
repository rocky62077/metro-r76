import { Request, Response } from "express";
import { Lab } from "../models/lab.model.js";

export const createLab = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      code,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      accreditation,
      accreditationNumber,
      reportPrefix,
    } = req.body;

    if (
      !name ||
      !code ||
      !address ||
      !city ||
      !state ||
      !country ||
      !postalCode ||
      !reportPrefix
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, code, address, city, state, country, postalCode and reportPrefix are required",
      });
      return;
    }

    const existingLab = await Lab.findOne({
      code: code.toUpperCase(),
    });

    if (existingLab) {
      res.status(409).json({
        success: false,
        message: "Lab with this code already exists",
      });
      return;
    }

    const lab = await Lab.create({
      name,
      code: code.toUpperCase(),
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      accreditation,
      accreditationNumber,
      reportPrefix: reportPrefix.toUpperCase(),
    });

    res.status(201).json({
      success: true,
      message: "Lab created successfully",
      data: {
        lab,
      },
    });
  } catch (error) {
    console.error("Create lab error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating lab",
    });
  }
};

export const getLabs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const labs = await Lab.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        labs,
      },
    });
  } catch (error) {
    console.error("Get labs error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching labs",
    });
  }
};
