import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDFReport = (evaluationData: any) => {
  const doc = new jsPDF();

  // --- Header ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("DEPARTMENT OF CONSUMER AFFAIRS", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Legal Metrology - OIML R-76 Test Report", 105, 28, {
    align: "center",
  });
  doc.line(14, 32, 196, 32);

  // --- 1. Instrument Specifications ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. Instrument Specifications", 14, 42);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Manufacturer: ${evaluationData.manufacturer || "N/A"}`, 14, 50);
  doc.text(`Model: ${evaluationData.modelNumber || "N/A"}`, 14, 58);
  doc.text(`Class: ${evaluationData.accuracyClass || "III"}`, 14, 66);
  doc.text(`Max Capacity: ${evaluationData.maxCapacity || "-"} kg`, 120, 50);
  doc.text(
    `Scale Interval (e): ${evaluationData.verificationScaleInterval || "-"} kg`,
    120,
    58,
  );

  // --- 2. Eccentricity Test (New Section!) ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2. Eccentricity Test (Corner Load)", 14, 80);

  let finalY = 85;

  if (evaluationData.eccentricityResults) {
    const eccData = evaluationData.eccentricityResults;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Applied Test Load: ${eccData.load} kg`, 14, finalY);
    doc.text(`MPE Limit: ±${eccData.mpe} kg`, 120, finalY);

    const eccRows = [
      [
        "1 - Center",
        eccData.readings.center.indication || "-",
        eccData.readings.center.error ?? "-",
        eccData.readings.center.pass ? "PASS" : "FAIL",
      ],
      [
        "2 - Front Left",
        eccData.readings.topLeft.indication || "-",
        eccData.readings.topLeft.error ?? "-",
        eccData.readings.topLeft.pass ? "PASS" : "FAIL",
      ],
      [
        "3 - Back Left",
        eccData.readings.bottomLeft.indication || "-",
        eccData.readings.bottomLeft.error ?? "-",
        eccData.readings.bottomLeft.pass ? "PASS" : "FAIL",
      ],
      [
        "4 - Back Right",
        eccData.readings.bottomRight.indication || "-",
        eccData.readings.bottomRight.error ?? "-",
        eccData.readings.bottomRight.pass ? "PASS" : "FAIL",
      ],
      [
        "5 - Front Right",
        eccData.readings.topRight.indication || "-",
        eccData.readings.topRight.error ?? "-",
        eccData.readings.topRight.pass ? "PASS" : "FAIL",
      ],
    ];

    autoTable(doc, {
      startY: finalY + 5,
      head: [["Position", "Indication (kg)", "Error (kg)", "Status"]],
      body: eccRows,
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105] }, // Dark gray header
    });
    finalY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("No eccentricity data recorded.", 14, finalY);
    finalY += 15;
  }

  // --- 3. Weighing Performance Table ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("3. Weighing Performance Test Results", 14, finalY);

  const tableRows = (evaluationData.testResults || []).map((test: any) => [
    test.load,
    test.indication,
    test.error || "--",
    test.mpe ? `±${test.mpe}` : "--",
    test.pass === true ? "PASS" : test.pass === false ? "FAIL" : "PENDING",
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Load (kg)", "Indication (kg)", "Error", "MPE Limit", "Status"]],
    body: tableRows.length ? tableRows : [["-", "-", "-", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [0, 86, 179] }, // Blue header
  });

  // --- Footer & Signatures ---
  finalY = (doc as any).lastAutoTable.finalY || finalY + 20;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("__________________________", 14, finalY + 30);
  doc.text("Testing Technician Sign", 14, finalY + 36);

  doc.text("__________________________", 130, finalY + 30);
  doc.text("Approving Authority Sign", 130, finalY + 36);

  doc.save(
    `OIML_Report_${evaluationData.modelNumber || "Draft"}_${new Date().getTime()}.pdf`,
  );
};
