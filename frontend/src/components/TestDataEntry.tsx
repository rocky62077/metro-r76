import React, { useState, useEffect } from "react";

// Define the shape of our test row data
export interface TestResult {
  id: number;
  load: number;
  indication: string;
  error: string | null;
  mpe: number;
  pass: boolean | null;
}

interface TestDataEntryProps {
  evaluationData: any;
  setEvaluationData: React.Dispatch<React.SetStateAction<any>>;
}
export default function TestDataEntry({
  setEvaluationData,
}: TestDataEntryProps) {
  // Hardcoded 'e' (Verification scale interval) for the prototype.
  // In a full build, this would come from Step 1 (Instrument Details).
  const e = 0.05;

  // Initialize with some standard load test points (e.g., Min, Medium, Max capacity)
  const [testRows, setTestRows] = useState<TestResult[]>([
    { id: 1, load: 0, indication: "", error: null, mpe: 0, pass: null },
    { id: 2, load: 10, indication: "", error: null, mpe: 0, pass: null },
    { id: 3, load: 25, indication: "", error: null, mpe: 0, pass: null },
    { id: 4, load: 50, indication: "", error: null, mpe: 0, pass: null },
  ]);

  // Simplified OIML R-76 MPE Logic (Class III)
  const calculateMPE = (load: number) => {
    const loadInE = load / e;
    if (loadInE >= 0 && loadInE <= 500) return 0.5 * e;
    if (loadInE > 500 && loadInE <= 2000) return 1.0 * e;
    if (loadInE > 2000 && loadInE <= 10000) return 1.5 * e;
    return 2.0 * e;
  };

  const handleIndicationChange = (index: number, value: string) => {
    const numericValue = parseFloat(value);
    const newRows = [...testRows];

    newRows[index].indication = value;

    if (!isNaN(numericValue)) {
      // 1. Calculate Error
      const error = numericValue - newRows[index].load;
      newRows[index].error = error.toFixed(3);

      // 2. Calculate MPE
      const mpe = calculateMPE(newRows[index].load);
      newRows[index].mpe = mpe;

      // 3. Determine Compliance
      newRows[index].pass = Math.abs(error) <= mpe;
    } else {
      newRows[index].error = null;
      newRows[index].pass = null;
    }

    setTestRows(newRows);

    // Send data up to the parent Wizard state instantly
    setEvaluationData((prev: any) => ({
      ...prev,
      testResults: newRows,
    }));
  };

  // Run MPE calculation once on mount to set initial MPE limits on the UI
  useEffect(() => {
    const initializedRows = testRows.map((row) => ({
      ...row,
      mpe: calculateMPE(row.load),
    }));
    setTestRows(initializedRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ marginTop: "20px" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: "2px solid #dee2e6",
            }}
          >
            <th style={{ padding: "12px" }}>Applied Load (kg)</th>
            <th style={{ padding: "12px" }}>Indication (kg)</th>
            <th style={{ padding: "12px" }}>Calculated Error</th>
            <th style={{ padding: "12px" }}>MPE Limit</th>
            <th style={{ padding: "12px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {testRows.map((row, index) => (
            <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "12px" }}>
                <strong>{row.load} kg</strong>
              </td>
              <td style={{ padding: "12px" }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={row.indication}
                  onChange={(e) =>
                    handleIndicationChange(index, e.target.value)
                  }
                  style={{
                    padding: "8px",
                    width: "100px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </td>
              <td style={{ padding: "12px" }}>
                {row.error !== null ? (
                  <span
                    style={{
                      color: parseFloat(row.error) === 0 ? "#666" : "#000",
                    }}
                  >
                    {parseFloat(row.error) > 0 ? "+" : ""}
                    {row.error} kg
                  </span>
                ) : (
                  <span style={{ color: "#aaa" }}>--</span>
                )}
              </td>
              <td style={{ padding: "12px", color: "#666" }}>
                ±{row.mpe.toFixed(3)} kg
              </td>
              <td style={{ padding: "12px" }}>
                {row.pass === true && (
                  <span
                    style={{
                      color: "#15803d",
                      fontWeight: "bold",
                      backgroundColor: "#dcfce7",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    PASS
                  </span>
                )}
                {row.pass === false && (
                  <span
                    style={{
                      color: "#b91c1c",
                      fontWeight: "bold",
                      backgroundColor: "#fee2e2",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    FAIL
                  </span>
                )}
                {row.pass === null && (
                  <span style={{ color: "#94a3b8" }}>Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
