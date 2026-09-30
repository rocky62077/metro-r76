import { Request, Response } from "express";
import { Instrument } from "../models/instrument.model.js";
import { Manufacturer } from "../models/manufacturer.model.js";
import { Lab } from "../models/lab.model.js";

export const createInstrument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      instrumentName,
      instrumentType,
      manufacturer,
      modelNumber,
      serialNumber,
      capacity,
      capacityUnit,
      scaleInterval,
      scaleIntervalUnit,
      accuracyClass,
      numberOfVerificationScaleIntervals,
      lab,
      yearOfManufacture,
      application,
    } = req.body;

    if (
      !instrumentName ||
      !instrumentType ||
      !manufacturer ||
      !modelNumber ||
      !serialNumber ||
      capacity === undefined ||
      scaleInterval === undefined ||
      !lab
    ) {
      res.status(400).json({
        success: false,
        message:
          "Instrument name, type, manufacturer, model number, serial number, capacity, scale interval and lab are required",
      });
      return;
    }

    const existingInstrument = await Instrument.findOne({
      serialNumber,
    });

    if (existingInstrument) {
      res.status(409).json({
        success: false,
        message: "Instrument with this serial number already exists",
      });
      return;
    }

    const manufacturerExists = await Manufacturer.findById(manufacturer);

    if (!manufacturerExists) {
      res.status(404).json({
        success: false,
        message: "Manufacturer not found",
      });
      return;
    }

    if (!manufacturerExists.isActive) {
      res.status(400).json({
        success: false,
        message: "Manufacturer is inactive",
      });
      return;
    }

    const labExists = await Lab.findById(lab);

    if (!labExists) {
      res.status(404).json({
        success: false,
        message: "Lab not found",
      });
      return;
    }

    if (!labExists.isActive) {
      res.status(400).json({
        success: false,
        message: "Lab is inactive",
      });
      return;
    }

    if (Number(capacity) <= 0) {
      res.status(400).json({
        success: false,
        message: "Capacity must be greater than zero",
      });
      return;
    }

    if (Number(scaleInterval) <= 0) {
      res.status(400).json({
        success: false,
        message: "Scale interval must be greater than zero",
      });
      return;
    }

    const instrument = await Instrument.create({
      instrumentName,
      instrumentType,
      manufacturer,
      modelNumber,
      serialNumber,
      capacity,
      capacityUnit: capacityUnit || "kg",
      scaleInterval,
      scaleIntervalUnit: scaleIntervalUnit || "kg",
      accuracyClass,
      numberOfVerificationScaleIntervals,
      lab,
      yearOfManufacture,
      application,
    });

    const populatedInstrument = await Instrument.findById(instrument._id)
      .populate("manufacturer", "name code")
      .populate("lab", "name code");

    res.status(201).json({
      success: true,
      message: "Instrument created successfully",
      data: {
        instrument: populatedInstrument,
      },
    });
  } catch (error) {
    console.error("Create instrument error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating instrument",
    });
  }
};

export const getInstruments = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const instruments = await Instrument.find()
      .populate("manufacturer", "name code")
      .populate("lab", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        instruments,
      },
    });
  } catch (error) {
    console.error("Get instruments error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching instruments",
    });
  }
};
