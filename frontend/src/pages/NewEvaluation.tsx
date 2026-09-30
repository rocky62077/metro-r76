import { useState } from "react";
import { generatePDFReport } from "../utils/generateReport";
import TestDataEntry from "../components/TestDataEntry";
// 1. IMPORT THE NEW FORM
import EccentricityTest from "../components/EccentricityTest";
import InstrumentDetailsForm from "../components/InstrumentDetailsForm";
import RepeatabilityTest from "../components/RepeatabilityTest";
export default function NewEvaluation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationData, setEvaluationData] = useState({
    manufacturer: "",
    modelNumber: "",
    accuracyClass: "III",
    verificationScaleInterval: "", // This is crucial for the test logic!
    testResults: [],
  });

  const handleFinalSubmit = async () => {
    generatePDFReport(evaluationData);

    // TODO: Since your backend is done, this is where you will call:
    // await api.post('/test-reports', evaluationData);

    alert("Report Generated!");
  };

  return (
    <div>
      <div className="page-header">
        <h1>New OIML R-76 Evaluation</h1>
        <p>Step {currentStep} of 2</p>
      </div>

      <section className="panel" style={{ padding: "20px", marginTop: "20px" }}>
        {/* 2. REPLACE STEP 1 WITH THE NEW COMPONENT */}
        {currentStep === 1 && (
          <InstrumentDetailsForm
            evaluationData={evaluationData}
            setEvaluationData={setEvaluationData}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <div>
            <h2>2. Weighing Performance Test (OIML R-76)</h2>
            <p style={{ color: "#666" }}>
              Testing for:{" "}
              <strong>
                {evaluationData.manufacturer || "Unknown"}{" "}
                {evaluationData.modelNumber}
              </strong>
            </p>
            {/* 1. The Interactive Visual Corner Load Test */}
            <EccentricityTest
              evaluationData={evaluationData}
              setEvaluationData={setEvaluationData}
            />
            <hr style={{ margin: "40px 0", borderTop: "1px solid #ccc" }} />
            <RepeatabilityTest
              evaluationData={evaluationData}
              setEvaluationData={setEvaluationData}
            />
            {/* 2. The Linearity/Weighing Performance Grid we built earlier */}

            <TestDataEntry
              evaluationData={evaluationData}
              setEvaluationData={setEvaluationData}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
                borderTop: "1px solid #eee",
                paddingTop: "20px",
              }}
            >
              <button
                onClick={() => setCurrentStep(1)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ccc",
                  background: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ← Back to Specifications
              </button>
              <button
                onClick={handleFinalSubmit}
                style={{
                  padding: "10px 20px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Sign & Generate PDF Report
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
