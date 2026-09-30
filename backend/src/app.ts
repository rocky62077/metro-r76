import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import apiRouter from "./routes/index.js";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));

// API routes
app.use("/api/v1", apiRouter);

export default app;
