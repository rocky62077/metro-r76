import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import labRoutes from "./lab.routes.js";
import manufacturerRoutes from "./manufacturer.routes.js";
import instrumentRoutes from "./instrument.routes.js";
import testReportRoutes from "./test-report.routes.js";
import testDefinitionRoutes from "./test-definition.routes.js";
import testObservationRoutes from "./test-observation.routes.js";
import calculationRuleRoutes from "./calculation-rule.routes.js";
import observationCalculationRoutes from "./observation-calculation.routes.js";
import reportComplianceRoutes from "./report-compliance.routes.js";
import repeatabilityCalculationRoutes from "./repeatability-calculation.routes.js";
import eccentricityCalculationRoutes from "./eccentricity-calculation.routes.js";
import zeroSettingCalculationRoutes from "./zero-setting-calculation.routes.js";
import tareCalculationRoutes from "./tare-calculation.routes.js";
import oimlTestEngineRoutes from "./oiml-test-engine.routes.js";
import testReportWorkflowRoutes from "./test-report-workflow.routes.js";
import pdfReportRoutes from "./pdf-report.routes.js";
import testReportRepositoryRoutes from "./test-report-repository.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

// Health
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "METRO-R76 API is running",
    timestamp: new Date().toISOString(),
  });
});

// Authentication
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/labs", labRoutes);
router.use("/manufacturers", manufacturerRoutes);
router.use("/instruments", instrumentRoutes);
router.use("/test-reports", testReportRoutes);
router.use("/test-definitions", testDefinitionRoutes);
router.use("/test-observations", testObservationRoutes);
router.use("/calculation-rules", calculationRuleRoutes);
router.use("/observation-calculations", observationCalculationRoutes);
router.use("/report-compliance", reportComplianceRoutes);
router.use("/repeatability-calculations", repeatabilityCalculationRoutes);
router.use("/eccentricity-calculations", eccentricityCalculationRoutes);
router.use("/zero-setting-calculations", zeroSettingCalculationRoutes);
router.use("/tare-calculations", tareCalculationRoutes);
router.use("/oiml-tests", oimlTestEngineRoutes);
router.use("/test-report-workflow", testReportWorkflowRoutes);
router.use("/pdf-reports", pdfReportRoutes);
router.use("/test-report-repository", testReportRepositoryRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
