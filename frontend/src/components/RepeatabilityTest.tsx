import React, { useState, useEffect } from "react";

interface RepeatabilityTestProps {
  evaluationData: any;
  setEvaluationData: React.Dispatch<React.SetStateAction<any>>;
}

export default function RepeatabilityTest({
  evaluationData,
  setEvaluationData,
}: RepeatabilityTestProps) {
  const e = evaluationData.verificationScaleInterval
    ? parseFloat(evaluationData.verificationScaleInterval)
    : 0.05;
  const maxCap = evaluationData.maxCapacity
    ? parseFloat(evaluationData.maxCapacity)
    : 15;

  // R-76 often tests repeatability at ~50% and ~100% of Max Capacity. We will default to 50%.
  const [testLoad, setTestLoad] = useState<number>(maxCap / 2);

  // Usually 3 weighings for Class III/IIII, or 6 for Class I/II. We'll provide 3 rows by default.
  const [readings, setReadings] = useState([
    { id: 1, indication: "" },
    { id: 2, indication: "" },
    { id: 3, indication: "" },
  ]);

  const [results, setResults] = useState({
    maxDifference: null as number | null,
    mpe: 0,
    pass: null as boolean | null,
  });

  const calculateMPE = (load: number) => {
    const loadInE = load / e;
    if (loadInE >= 0 && loadInE <= 500) return 0.5 * e;
    if (loadInE > 500 && loadInE <= 2000) return 1.0 * e;
    return 1.5 * e;
  };

  const mpe = calculateMPE(testLoad);

  const handleIndicationChange = (index: number, value: string) => {
    const newReadings = [...readings];
    newReadings[index].indication = value;
    setReadings(newReadings);

    // Calculate Max Difference if all fields have numbers
    const numericValues = newReadings
      .map((r) => parseFloat(r.indication))
      .filter((val) => !isNaN(val));

    if (numericValues.length > 0) {
      const maxReading = Math.max(...numericValues);
      const minReading = Math.min(...numericValues);
      const maxDiff = maxReading - minReading;
      const pass = maxDiff <= mpe;

      setResults({ maxDifference: maxDiff, mpe, pass });

      // Update parent state
      setEvaluationData((prev: any) => ({
        ...prev,
        repeatabilityResults: {
          load: testLoad,
          readings: newReadings,
          maxDifference: maxDiff,
          mpe,
          pass,
        },
      }));
    } else {
      setResults({ maxDifference: null, mpe, pass: null });
    }
  };

  // Update MPE if load changes
  useEffect(() => {
    setResults((prev) => ({ ...prev, mpe: calculateMPE(testLoad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testLoad, e]);

  return (
    <div
      className="panel"
      style={{
        marginTop: "20px",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "#111827" }}>Repeatability Test</h3>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
          Apply the same load multiple times. The difference between Max and Min
          readings must be $\le$ MPE.
        </p>
      </div>

      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
        {/* Left: Input Table */}
        <div style={{ flex: "1", minWidth: "250px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", marginRight: "10px" }}>
              Test Load (kg):
            </label>
            <input
              type="number"
              value={testLoad}
              onChange={(e) => setTestLoad(parseFloat(e.target.value) || 0)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "120px",
              }}
            />
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                <th
                  style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}
                >
                  Weighing #
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}
                >
                  Indication (kg)
                </th>
              </tr>
            </thead>
            <tbody>
              {readings.map((row, index) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      color: "#475569",
                    }}
                  >
                    Weighing {row.id}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <input
                      type="number"
                      step="0.001"
                      value={row.indication}
                      onChange={(e) =>
                        handleIndicationChange(index, e.target.value)
                      }
                      style={{
                        padding: "8px",
                        width: "100%",
                        borderRadius: "4px",
                        border: "1px solid #94a3b8",
                      }}
                      placeholder="0.000"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Live Calculation Summary Box */}
        <div
          style={{
            flex: "1",
            minWidth: "250px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor:
                results.pass === true
                  ? "#f0fdf4"
                  : results.pass === false
                    ? "#fef2f2"
                    : "#f8fafc",
              border: `2px solid ${results.pass === true ? "#86efac" : results.pass === false ? "#fca5a5" : "#e2e8f0"}`,
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <h4
              style={{
                margin: "0 0 15px 0",
                borderBottom: "1px solid #ccc",
                paddingBottom: "10px",
              }}
            >
              Test Summary
            </h4>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span>Max Difference:</span>
              <strong>
                {results.maxDifference !== null
                  ? `${results.maxDifference.toFixed(3)} kg`
                  : "--"}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <span>Allowed MPE Limit:</span>
              <strong style={{ color: "#475569" }}>
                ±{results.mpe.toFixed(3)} kg
              </strong>
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "1px solid #ccc",
              }}
            >
              <span style={{ fontSize: "14px", color: "#666" }}>Status</span>
              <br />
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color:
                    results.pass === true
                      ? "#15803d"
                      : results.pass === false
                        ? "#b91c1c"
                        : "#94a3b8",
                }}
              >
                {results.pass === true
                  ? "PASS"
                  : results.pass === false
                    ? "FAIL"
                    : "PENDING"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
