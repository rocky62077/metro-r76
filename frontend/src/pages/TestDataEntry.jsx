import { useState } from "react";

export default function TestDataEntry() {
  // Hardcoded for the prototype, but these would come from the instrument specs step
  const e = 0.05; // Verification scale interval

  // State to hold multiple test readings
  const [testRows, setTestRows] = useState([
    { id: 1, load: 0, indication: "", error: null, pass: null },
    { id: 2, load: 10, indication: "", error: null, pass: null },
    { id: 3, load: 50, indication: "", error: null, pass: null },
  ]);

  // Simulated OIML R-76 Maximum Permissible Error (MPE) Logic
  // (Simplified for Class III instruments)
  const calculateMPE = (load) => {
    const loadInE = load / e;
    if (loadInE >= 0 && loadInE <= 500) return 0.5 * e;
    if (loadInE > 500 && loadInE <= 2000) return 1.0 * e;
    if (loadInE > 2000 && loadInE <= 10000) return 1.5 * e;
    return 2.0 * e; // Default fallback
  };

  const handleIndicationChange = (index, value) => {
    const numericValue = parseFloat(value);
    const newRows = [...testRows];

    // Update the input value
    newRows[index].indication = value;

    if (!isNaN(numericValue)) {
      // 1. Calculate Error (Indication - Load)
      const error = numericValue - newRows[index].load;
      newRows[index].error = error.toFixed(3); // Keep to 3 decimal places

      // 2. Calculate MPE based on OIML R-76
      const mpe = calculateMPE(newRows[index].load);

      // 3. Auto-determine Compliance (Pass/Fail)
      newRows[index].pass = Math.abs(error) <= mpe;
    } else {
      newRows[index].error = null;
      newRows[index].pass = null;
    }

    setTestRows(newRows);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Weighing Performance Test (OIML R-76)</h2>
        <p>Enter instrument indications to auto-calculate errors.</p>
      </div>

      <table style={{ width: "100%", textAlign: "left", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Applied Load (kg)</th>
            <th>Indication (kg)</th>
            <th>Calculated Error</th>
            <th>MPE Limit</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {testRows.map((row, index) => (
            <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>
                <strong>{row.load} kg</strong>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter reading..."
                  value={row.indication}
                  onChange={(e) =>
                    handleIndicationChange(index, e.target.value)
                  }
                  style={{ padding: "8px", width: "120px" }}
                />
              </td>
              <td>
                {row.error !== null ? (
                  <span>{row.error} kg</span>
                ) : (
                  <span style={{ color: "#aaa" }}>--</span>
                )}
              </td>
              <td>±{calculateMPE(row.load)} kg</td>
              <td>
                {row.pass === true && (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    PASS
                  </span>
                )}
                {row.pass === false && (
                  <span style={{ color: "red", fontWeight: "bold" }}>FAIL</span>
                )}
                {row.pass === null && (
                  <span style={{ color: "#aaa" }}>Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            padding: "10px 20px",
            background: "#0056b3",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Save Test Results
        </button>
      </div>
    </div>
  );
}
