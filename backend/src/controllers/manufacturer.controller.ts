import { Request, Response } from "express";
import { Manufacturer } from "../models/manufacturer.model.js";

export const createManufacturer = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
      website,
      contactPerson,
    } = req.body;

    if (
      !name ||
      !code ||
      !address ||
      !city ||
      !state ||
      !country ||
      !postalCode
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, code, address, city, state, country and postalCode are required",
      });
      return;
    }

    const existingManufacturer = await Manufacturer.findOne({
      code: code.toUpperCase(),
    });

    if (existingManufacturer) {
      res.status(409).json({
        success: false,
        message: "Manufacturer with this code already exists",
      });
      return;
    }

    const manufacturer = await Manufacturer.create({
      name,
      code: code.toUpperCase(),
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      contactPerson,
    });

    res.status(201).json({
      success: true,
      message: "Manufacturer created successfully",
      data: {
        manufacturer,
      },
    });
  } catch (error) {
    console.error("Create manufacturer error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating manufacturer",
    });
  }
};

export const getManufacturers = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const manufacturers = await Manufacturer.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: {
        manufacturers,
      },
    });
  } catch (error) {
    console.error("Get manufacturers error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching manufacturers",
    });
  }
};
