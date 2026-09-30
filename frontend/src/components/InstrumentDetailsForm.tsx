import React from "react";

interface InstrumentDetailsProps {
  evaluationData: any;
  setEvaluationData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
}

export default function InstrumentDetailsForm({
  evaluationData,
  setEvaluationData,
  onNext,
}: InstrumentDetailsProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEvaluationData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="form-container"
      style={{ maxWidth: "800px", margin: "0 auto" }}
    >
      <h2
        style={{
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        1. General & Technical Specifications
      </h2>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* General Info Column */}
        <div
          className="panel"
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#333" }}>
            General Info
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Manufacturer / Applicant Name
            </label>
            <input
              name="manufacturer"
              value={evaluationData.manufacturer || ""}
              onChange={handleChange}
              placeholder="e.g. Acme Scales Ltd."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Model Number
            </label>
            <input
              name="modelNumber"
              value={evaluationData.modelNumber || ""}
              onChange={handleChange}
              placeholder="e.g. TX-5000"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Application / Reference No.
            </label>
            <input
              name="applicationNo"
              value={evaluationData.applicationNo || ""}
              onChange={handleChange}
              placeholder="e.g. LM/2026/099"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </div>

        {/* Metrological Specs Column */}
        <div
          className="panel"
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#333" }}>
            Metrological Data (OIML R-76)
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Accuracy Class
            </label>
            <select
              name="accuracyClass"
              value={evaluationData.accuracyClass || "III"}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "white",
              }}
            >
              <option value="I">Special (I)</option>
              <option value="II">High (II)</option>
              <option value="III">Medium (III)</option>
              <option value="IIII">Ordinary (IIII)</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Max Capacity (kg)
              </label>
              <input
                name="maxCapacity"
                type="number"
                value={evaluationData.maxCapacity || ""}
                onChange={handleChange}
                placeholder="e.g. 50"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Min Capacity (kg)
              </label>
              <input
                name="minCapacity"
                type="number"
                value={evaluationData.minCapacity || ""}
                onChange={handleChange}
                placeholder="e.g. 0.1"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Scale Interval 'e' (kg)
              </label>
              <input
                name="verificationScaleInterval"
                type="number"
                step="0.001"
                value={evaluationData.verificationScaleInterval || ""}
                onChange={handleChange}
                placeholder="e.g. 0.05"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Actual Scale Interval 'd'
              </label>
              <input
                name="actualScaleInterval"
                type="number"
                step="0.001"
                value={evaluationData.actualScaleInterval || ""}
                onChange={handleChange}
                placeholder="e.g. 0.05"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <button
          onClick={onNext}
          disabled={
            !evaluationData.verificationScaleInterval ||
            !evaluationData.manufacturer
          }
          style={{
            padding: "12px 24px",
            background:
              !evaluationData.verificationScaleInterval ||
              !evaluationData.manufacturer
                ? "#ccc"
                : "#0056b3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              !evaluationData.verificationScaleInterval ||
              !evaluationData.manufacturer
                ? "not-allowed"
                : "pointer",
            fontWeight: "bold",
          }}
        >
          Proceed to Testing →
        </button>
      </div>
    </div>
  );
}
