import { useState } from "react";
// Assuming you have these child components created in your project
import InstrumentDetailsForm from "./InstrumentDetailsForm";
import TestDataEntry from "./TestDataEntry"; // The component we built in the previous step
import ReportReview from "./ReportReview";

export default function NewEvaluationWizard() {
  // 1. Master State: Holds all data for the entire type evaluation
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationData, setEvaluationData] = useState({
    manufacturer: "",
    modelNumber: "",
    accuracyClass: "III",
    maxCapacity: "",
    verificationScaleInterval: "",
    testResults: [], // Populated during Step 2
  });

  // 2. Handlers to move between steps
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // 3. Centralized update function passed to children
  const updateData = (stepData) => {
    setEvaluationData((prev) => ({ ...prev, ...stepData }));
  };

  // 4. Final Submission Handler
  const handleFinalSubmit = async () => {
    try {
      // Example backend POST request
      /* 
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluationData)
      });
      */
      alert("Test Report Successfully Generated & Saved to Repository!");
      // Here you would redirect back to the Dashboard
    } catch (error) {
      console.error("Failed to generate report", error);
    }
  };

  // 5. Conditional Rendering based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <InstrumentDetailsForm
            data={evaluationData}
            updateData={updateData}
          />
        );
      case 2:
        return <TestDataEntry data={evaluationData} updateData={updateData} />;
      case 3:
        return <ReportReview data={evaluationData} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="wizard-container panel">
      {/* --- Progress Indicator --- */}
      <div
        className="wizard-header"
        style={{
          borderBottom: "1px solid #eee",
          paddingBottom: "15px",
          marginBottom: "20px",
        }}
      >
        <h2>New NAWI Type Evaluation</h2>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <span
            style={{
              fontWeight: currentStep === 1 ? "bold" : "normal",
              color: currentStep === 1 ? "#0056b3" : "#666",
            }}
          >
            1. Instrument Specs
          </span>
          <span>→</span>
          <span
            style={{
              fontWeight: currentStep === 2 ? "bold" : "normal",
              color: currentStep === 2 ? "#0056b3" : "#666",
            }}
          >
            2. R-76 Testing
          </span>
          <span>→</span>
          <span
            style={{
              fontWeight: currentStep === 3 ? "bold" : "normal",
              color: currentStep === 3 ? "#0056b3" : "#666",
            }}
          >
            3. Review & Generate PDF
          </span>
        </div>
      </div>

      {/* --- Dynamic Form Content --- */}
      <div className="wizard-body" style={{ minHeight: "400px" }}>
        {renderStep()}
      </div>

      {/* --- Navigation Buttons --- */}
      <div
        className="wizard-footer"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
          paddingTop: "15px",
          borderTop: "1px solid #eee",
        }}
      >
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          style={{
            padding: "8px 16px",
            cursor: currentStep === 1 ? "not-allowed" : "pointer",
          }}
        >
          Back
        </button>

        {currentStep < 3 ? (
          <button
            onClick={nextStep}
            style={{
              padding: "8px 16px",
              background: "#0056b3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={handleFinalSubmit}
            style={{
              padding: "8px 16px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sign & Generate Final Report
          </button>
        )}
      </div>
    </div>
  );
}
