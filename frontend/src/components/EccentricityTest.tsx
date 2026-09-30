import React, { useState } from "react";

interface EccentricityTestProps {
  evaluationData: any;
  setEvaluationData: React.Dispatch<React.SetStateAction<any>>;
}

export default function EccentricityTest({
  evaluationData,
  setEvaluationData,
}: EccentricityTestProps) {
  // Extract values from Step 1 (fallback to defaults if missing)
  const e = evaluationData.verificationScaleInterval
    ? parseFloat(evaluationData.verificationScaleInterval)
    : 0.05;
  const maxCap = evaluationData.maxCapacity
    ? parseFloat(evaluationData.maxCapacity)
    : 15;

  // OIML R-76 suggests test load for eccentricity is typically 1/3 of Max Capacity
  const suggestedLoad = (maxCap / 3).toFixed(2);

  const [testLoad, setTestLoad] = useState<number>(parseFloat(suggestedLoad));
  const [activeZone, setActiveZone] = useState<string | null>(null);

  // State for the 5 positions on the pan
  const [readings, setReadings] = useState({
    center: {
      indication: "",
      error: null as number | null,
      pass: null as boolean | null,
    },
    topLeft: {
      indication: "",
      error: null as number | null,
      pass: null as boolean | null,
    },
    bottomLeft: {
      indication: "",
      error: null as number | null,
      pass: null as boolean | null,
    },
    bottomRight: {
      indication: "",
      error: null as number | null,
      pass: null as boolean | null,
    },
    topRight: {
      indication: "",
      error: null as number | null,
      pass: null as boolean | null,
    },
  });

  // Calculate MPE based on the applied test load
  const calculateMPE = (load: number) => {
    const loadInE = load / e;
    if (loadInE >= 0 && loadInE <= 500) return 0.5 * e;
    if (loadInE > 500 && loadInE <= 2000) return 1.0 * e;
    return 1.5 * e; // Eccentricity load rarely exceeds 2000e
  };

  const mpe = calculateMPE(testLoad);

  const handleInputChange = (zone: keyof typeof readings, value: string) => {
    const numericValue = parseFloat(value);
    const newReadings = { ...readings };

    newReadings[zone].indication = value;

    if (!isNaN(numericValue)) {
      const error = numericValue - testLoad;
      newReadings[zone].error = error;
      newReadings[zone].pass = Math.abs(error) <= mpe;
    } else {
      newReadings[zone].error = null;
      newReadings[zone].pass = null;
    }

    setReadings(newReadings);

    // Push to parent state
    setEvaluationData((prev: any) => ({
      ...prev,
      eccentricityResults: { load: testLoad, readings: newReadings, mpe },
    }));
  };

  // Helper to determine the color of the visual circles
  const getZoneColor = (pass: boolean | null) => {
    if (pass === true) return "#22c55e"; // Green
    if (pass === false) return "#ef4444"; // Red
    return "#e2e8f0"; // Gray (Empty)
  };

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
        <h3 style={{ margin: 0, color: "#111827" }}>
          Eccentricity Test (Corner Load)
        </h3>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
          Test Load should be approx 1/3 of Max Capacity ({maxCap} kg). MPE for{" "}
          {testLoad} kg is <strong>±{mpe.toFixed(3)} kg</strong>.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>
          Applied Test Load (kg):
        </label>
        <input
          type="number"
          value={testLoad}
          onChange={(e) => setTestLoad(parseFloat(e.target.value) || 0)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {/* LEFT SIDE: Visual Weighing Pan Diagram */}
        <div
          style={{
            flex: "1",
            minWidth: "300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "250px",
              height: "250px",
              backgroundColor: "#f8fafc",
              border: "4px solid #cbd5e1",
              borderRadius: "12px",
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            {/* The 5 Position Indicators */}
            {[
              { key: "topLeft", top: "15%", left: "15%", label: "2" },
              { key: "topRight", top: "15%", right: "15%", label: "5" },
              {
                key: "center",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                label: "1",
              },
              { key: "bottomLeft", bottom: "15%", left: "15%", label: "3" },
              { key: "bottomRight", bottom: "15%", right: "15%", label: "4" },
            ].map((zone) => (
              <div
                key={zone.key}
                style={{
                  position: "absolute",
                  top: zone.top,
                  left: zone.left,
                  right: zone.right,
                  bottom: zone.bottom,
                  transform: zone.transform,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: getZoneColor(
                    readings[zone.key as keyof typeof readings].pass,
                  ),
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color:
                    readings[zone.key as keyof typeof readings].pass !== null
                      ? "white"
                      : "#64748b",
                  fontWeight: "bold",
                  fontSize: "18px",
                  boxShadow:
                    activeZone === zone.key
                      ? "0 0 0 4px rgba(59, 130, 246, 0.5)"
                      : "0 2px 5px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                }}
              >
                {zone.label}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Data Entry Table */}
        <div style={{ flex: "2", minWidth: "300px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                <th
                  style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}
                >
                  Position
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}
                >
                  Indication (kg)
                </th>
                <th
                  style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}
                >
                  Error
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: "center", label: "1 - Center" },
                { key: "topLeft", label: "2 - Front Left" },
                { key: "bottomLeft", label: "3 - Back Left" },
                { key: "bottomRight", label: "4 - Back Right" },
                { key: "topRight", label: "5 - Front Right" },
              ].map((row) => (
                <tr
                  key={row.key}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor:
                      activeZone === row.key ? "#eff6ff" : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      color: "#475569",
                    }}
                  >
                    {row.label}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <input
                      type="number"
                      step="0.001"
                      value={
                        readings[row.key as keyof typeof readings].indication
                      }
                      onFocus={() => setActiveZone(row.key)}
                      onBlur={() => setActiveZone(null)}
                      onChange={(e) =>
                        handleInputChange(
                          row.key as keyof typeof readings,
                          e.target.value,
                        )
                      }
                      style={{
                        padding: "8px",
                        width: "120px",
                        borderRadius: "4px",
                        border: "1px solid #94a3b8",
                      }}
                      placeholder="0.000"
                    />
                  </td>
                  <td style={{ padding: "12px" }}>
                    {readings[row.key as keyof typeof readings].error !==
                    null ? (
                      <span
                        style={{
                          color: readings[row.key as keyof typeof readings].pass
                            ? "#15803d"
                            : "#b91c1c",
                          fontWeight: "bold",
                        }}
                      >
                        {readings[row.key as keyof typeof readings].error! > 0
                          ? "+"
                          : ""}
                        {readings[
                          row.key as keyof typeof readings
                        ].error!.toFixed(3)}{" "}
                        kg
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
