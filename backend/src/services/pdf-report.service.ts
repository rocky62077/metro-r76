import PDFDocument from "pdfkit";
import { TestReport } from "../models/test-report.model.js";
import { Instrument } from "../models/instrument.model.js";
import { Lab } from "../models/lab.model.js";
import { Manufacturer } from "../models/manufacturer.model.js";
import { TestObservation } from "../models/test-observation.model.js";

const PAGE_LEFT = 50;
const PAGE_RIGHT = 545;
const PAGE_WIDTH = PAGE_RIGHT - PAGE_LEFT;

const CONTENT_TOP = 50;
const CONTENT_BOTTOM = 745;

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("en-IN");
};

const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null) {
    return "-";
  }

  return String(value);
};

const resetPosition = (doc: PDFKit.PDFDocument): void => {
  doc.x = PAGE_LEFT;
};

const drawSectionTitle = (doc: PDFKit.PDFDocument, title: string): void => {
  resetPosition(doc);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#111827")
    .text(title, PAGE_LEFT);

  const lineY = doc.y + 5;

  doc
    .moveTo(PAGE_LEFT, lineY)
    .lineTo(PAGE_RIGHT, lineY)
    .strokeColor("#9ca3af")
    .lineWidth(0.6)
    .stroke();

  doc.y = lineY + 9;
};

const drawField = (
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  x: number = PAGE_LEFT,
  width: number = PAGE_WIDTH,
): void => {
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor("#374151")
    .text(`${label}:`, x, doc.y, {
      continued: true,
      width,
    })
    .font("Helvetica")
    .fillColor("#111827")
    .text(` ${value}`, {
      width,
    });

  doc.moveDown(0.15);
};

const drawTwoColumnField = (
  doc: PDFKit.PDFDocument,
  leftLabel: string,
  leftValue: string,
  rightLabel: string,
  rightValue: string,
): void => {
  const gap = 20;
  const columnWidth = (PAGE_WIDTH - gap) / 2;

  const startY = doc.y;

  drawField(doc, leftLabel, leftValue, PAGE_LEFT, columnWidth);

  const leftEndY = doc.y;

  doc.y = startY;

  drawField(
    doc,
    rightLabel,
    rightValue,
    PAGE_LEFT + columnWidth + gap,
    columnWidth,
  );

  const rightEndY = doc.y;

  doc.y = Math.max(leftEndY, rightEndY);
};

const drawInfoBox = (
  doc: PDFKit.PDFDocument,
  title: string,
  fields: Array<[string, string]>,
): void => {
  const startY = doc.y;

  const boxHeight = 30 + fields.length * 17 + 12;

  doc.roundedRect(PAGE_LEFT, startY, PAGE_WIDTH, boxHeight, 4).fill("#f9fafb");

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#111827")
    .text(title, PAGE_LEFT + 12, startY + 10);

  let y = startY + 29;

  fields.forEach(([label, value]) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(7.8)
      .fillColor("#4b5563")
      .text(`${label}:`, PAGE_LEFT + 12, y, {
        width: 105,
      });

    doc
      .font("Helvetica")
      .fontSize(7.8)
      .fillColor("#111827")
      .text(value, PAGE_LEFT + 115, y, {
        width: PAGE_WIDTH - 130,
      });

    y += 17;
  });

  doc.y = startY + boxHeight + 10;
};

const drawTableHeader = (doc: PDFKit.PDFDocument, y: number): number => {
  const columns = [
    {
      title: "Test",
      width: 145,
    },
    {
      title: "Input",
      width: 65,
    },
    {
      title: "Indicated",
      width: 75,
    },
    {
      title: "Error",
      width: 65,
    },
    {
      title: "MPE",
      width: 65,
    },
    {
      title: "Result",
      width: 80,
    },
  ];

  const headerHeight = 30;

  doc.rect(PAGE_LEFT, y, PAGE_WIDTH, headerHeight).fill("#e5e7eb");

  let x = PAGE_LEFT;

  columns.forEach((column) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#111827")
      .text(column.title, x + 3, y + 10, {
        width: column.width - 6,
        align: "center",
      });

    x += column.width;
  });

  return y + headerHeight;
};

const drawTestResultRow = (
  doc: PDFKit.PDFDocument,
  y: number,
  values: string[],
  rowIndex: number,
): number => {
  const columns = [
    {
      width: 145,
      align: "left" as const,
    },
    {
      width: 65,
      align: "center" as const,
    },
    {
      width: 75,
      align: "center" as const,
    },
    {
      width: 65,
      align: "center" as const,
    },
    {
      width: 65,
      align: "center" as const,
    },
    {
      width: 80,
      align: "center" as const,
    },
  ];

  const rowHeight = 34;

  if (rowIndex % 2 === 0) {
    doc.rect(PAGE_LEFT, y, PAGE_WIDTH, rowHeight).fill("#f9fafb");
  }

  doc
    .rect(PAGE_LEFT, y, PAGE_WIDTH, rowHeight)
    .lineWidth(0.5)
    .strokeColor("#d1d5db")
    .stroke();

  let x = PAGE_LEFT;

  values.forEach((value, index) => {
    const column = columns[index];

    doc
      .font(index === 5 ? "Helvetica-Bold" : "Helvetica")
      .fontSize(7.8)
      .fillColor("#111827")
      .text(value, x + 4, y + 11, {
        width: column.width - 8,
        height: 18,
        align: column.align,
      });

    x += column.width;
  });

  return y + rowHeight;
};

const drawPageFooter = (
  doc: PDFKit.PDFDocument,
  reportNumber: string,
  pageNumber: number,
  totalPages: number,
): void => {
  doc.font("Helvetica").fontSize(7.5).fillColor("#6b7280");

  doc.text(`METRO-R76 | ${reportNumber}`, PAGE_LEFT, 770, {
    width: 250,
    align: "left",
  });

  doc.text(`Page ${pageNumber} of ${totalPages}`, 395, 770, {
    width: 150,
    align: "right",
  });

  doc
    .moveTo(PAGE_LEFT, 763)
    .lineTo(PAGE_RIGHT, 763)
    .strokeColor("#d1d5db")
    .lineWidth(0.5)
    .stroke();
};

const drawReportHeader = (doc: PDFKit.PDFDocument): void => {
  resetPosition(doc);

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#111827")
    .text("METRO-R76", {
      align: "center",
    });

  doc.fontSize(13).text("NON-AUTOMATIC WEIGHING INSTRUMENT", {
    align: "center",
  });

  doc.fontSize(12).text("DIGITAL TEST REPORT", {
    align: "center",
  });

  doc.moveDown(0.8);
};

const drawReportSummary = (
  doc: PDFKit.PDFDocument,
  report: {
    reportNumber: string;
    testDate: Date;
    status: string;
    overallResult: string;
  },
): void => {
  const startY = doc.y;
  const boxHeight = 72;

  doc.roundedRect(PAGE_LEFT, startY, PAGE_WIDTH, boxHeight, 5).fill("#f3f4f6");

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#6b7280")
    .text("REPORT NUMBER", PAGE_LEFT + 15, startY + 11);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#111827")
    .text(report.reportNumber, PAGE_LEFT + 15, startY + 27);

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#6b7280")
    .text("TEST DATE", PAGE_LEFT + 190, startY + 11);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#111827")
    .text(formatDate(report.testDate), PAGE_LEFT + 190, startY + 27);

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#6b7280")
    .text("WORKFLOW STATUS", PAGE_LEFT + 315, startY + 11);

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#111827")
    .text(report.status.toUpperCase(), PAGE_LEFT + 315, startY + 27, {
      width: 160,
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#6b7280")
    .text("OVERALL RESULT", PAGE_LEFT + 15, startY + 49);

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#111827")
    .text(report.overallResult.toUpperCase(), PAGE_LEFT + 105, startY + 48);

  doc.y = startY + boxHeight + 15;
};

export const generatePdfReport = async (reportId: string): Promise<Buffer> => {
  const report = await TestReport.findById(reportId).lean();

  if (!report) {
    throw new Error("Test report not found");
  }

  const instrument = await Instrument.findById(report.instrument).lean();

  if (!instrument) {
    throw new Error("Instrument not found");
  }

  const lab = await Lab.findById(report.lab).lean();

  if (!lab) {
    throw new Error("Laboratory not found");
  }

  const manufacturer = await Manufacturer.findById(
    instrument.manufacturer,
  ).lean();

  if (!manufacturer) {
    throw new Error("Manufacturer not found");
  }

  const observations = await TestObservation.find({
    testReport: report._id,
  })
    .populate("testDefinition")
    .sort({
      observationNumber: 1,
    })
    .lean();

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      info: {
        Title: `OIML R76 Test Report ${report.reportNumber}`,
        Author: lab.name,
        Subject: "Digital Test Report for Non-Automatic Weighing Instrument",
      },
    });

    const chunks: Buffer[] = [];

    /*
     * IMPORTANT:
     * Collect PDF chunks and resolve the Promise
     * when PDFKit emits "end".
     */
    doc.on("data", (chunk: Buffer) => {
      chunks.push(Buffer.from(chunk));
    });

    doc.on("end", () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);

        resolve(pdfBuffer);
      } catch (error) {
        reject(error);
      }
    });

    doc.on("error", (error: Error) => {
      reject(error);
    });

    // ==================================================
    // PAGE 1
    // REPORT INFORMATION
    // ==================================================

    drawReportHeader(doc);

    drawReportSummary(doc, {
      reportNumber: report.reportNumber,
      testDate: report.testDate,
      status: report.status,
      overallResult: report.overallResult,
    });

    // ==================================================
    // 1. LABORATORY
    // ==================================================

    drawSectionTitle(doc, "1. Laboratory Information");

    drawInfoBox(doc, "Laboratory", [
      ["Name", lab.name],
      ["Code", lab.code],
      ["Address", lab.address],
      ["City / State", `${lab.city}, ${lab.state}`],
      ["Country", lab.country],
      ["Postal Code", lab.postalCode],
      ...(lab.accreditation
        ? [["Accreditation", lab.accreditation] as [string, string]]
        : []),
      ...(lab.accreditationNumber
        ? [["Accreditation No.", lab.accreditationNumber] as [string, string]]
        : []),
    ]);

    // ==================================================
    // 2. MANUFACTURER
    // ==================================================

    drawSectionTitle(doc, "2. Manufacturer Information");

    drawInfoBox(doc, "Manufacturer", [
      ["Name", manufacturer.name],
      ["Code", manufacturer.code],
      ["Address", manufacturer.address],
      ["City / State", `${manufacturer.city}, ${manufacturer.state}`],
      ["Country", manufacturer.country],
      ["Postal Code", manufacturer.postalCode],
      ...(manufacturer.contactPerson
        ? [["Contact", manufacturer.contactPerson] as [string, string]]
        : []),
    ]);

    // ==================================================
    // 3. INSTRUMENT
    // ==================================================

    drawSectionTitle(doc, "3. Instrument Information");

    const instrumentStartY = doc.y;

    const instrumentBoxHeight = 125;

    doc
      .roundedRect(
        PAGE_LEFT,
        instrumentStartY,
        PAGE_WIDTH,
        instrumentBoxHeight,
        4,
      )
      .fill("#f9fafb");

    const leftX = PAGE_LEFT + 12;
    const rightX = PAGE_LEFT + 270;

    let leftY = instrumentStartY + 12;
    let rightY = instrumentStartY + 12;

    const drawBoxField = (
      label: string,
      value: string,
      x: number,
      y: number,
    ): number => {
      doc
        .font("Helvetica-Bold")
        .fontSize(7.8)
        .fillColor("#4b5563")
        .text(label, x, y);

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor("#111827")
        .text(value, x, y + 11, {
          width: 245,
        });

      return y + 31;
    };

    leftY = drawBoxField(
      "Instrument Name",
      instrument.instrumentName,
      leftX,
      leftY,
    );

    leftY = drawBoxField(
      "Instrument Type",
      instrument.instrumentType,
      leftX,
      leftY,
    );

    leftY = drawBoxField("Model Number", instrument.modelNumber, leftX, leftY);

    leftY = drawBoxField(
      "Serial Number",
      instrument.serialNumber,
      leftX,
      leftY,
    );

    rightY = drawBoxField(
      "Capacity",
      `${instrument.capacity} ${instrument.capacityUnit}`,
      rightX,
      rightY,
    );

    rightY = drawBoxField(
      "Scale Interval",
      `${instrument.scaleInterval} ${instrument.scaleIntervalUnit}`,
      rightX,
      rightY,
    );

    rightY = drawBoxField(
      "Accuracy Class",
      instrument.accuracyClass || "-",
      rightX,
      rightY,
    );

    rightY = drawBoxField(
      "Verification Scale Intervals",
      instrument.numberOfVerificationScaleIntervals
        ? String(instrument.numberOfVerificationScaleIntervals)
        : "-",
      rightX,
      rightY,
    );

    doc.y = instrumentStartY + instrumentBoxHeight + 12;

    // ==================================================
    // 4. TEST REQUIREMENTS
    // ==================================================

    drawSectionTitle(doc, "4. Test Requirements");

    drawTwoColumnField(
      doc,
      "Applicable Standard",
      "OIML R76-1:2006",
      "Instrument Category",
      "Non-Automatic Weighing Instrument",
    );

    drawTwoColumnField(
      doc,
      "Test Report Format",
      "METRO-R76 Digital Format",
      "Report Version",
      "1.0",
    );

    doc.moveDown(0.5);

    // ==================================================
    // PAGE 2
    // TEST RESULTS
    // ==================================================

    doc.addPage();

    drawSectionTitle(doc, "5. Test Results");

    resetPosition(doc);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "Recorded observations and automatically calculated compliance results.",
        PAGE_LEFT,
        doc.y,
      );

    doc.moveDown(1);

    let tableY = doc.y;

    tableY = drawTableHeader(doc, tableY);

    if (observations.length === 0) {
      resetPosition(doc);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#374151")
        .text("No test observations recorded.", PAGE_LEFT, tableY + 12);

      tableY += 45;
    } else {
      for (let index = 0; index < observations.length; index++) {
        const observation = observations[index];

        const rowHeight = 34;

        if (tableY + rowHeight > CONTENT_BOTTOM) {
          doc.addPage();

          drawSectionTitle(doc, "5. Test Results — Continued");

          resetPosition(doc);

          tableY = doc.y;

          tableY = drawTableHeader(doc, tableY);
        }

        const definition = observation.testDefinition as unknown as {
          code?: string;
          name?: string;
        };

        const testName =
          definition?.name || definition?.code || `Observation ${index + 1}`;

        const input =
          observation.inputValue !== undefined
            ? String(observation.inputValue)
            : "-";

        const indicated =
          observation.indicatedValue !== undefined
            ? String(observation.indicatedValue)
            : "-";

        const error = formatNumber(observation.errorValue);

        const mpe = formatNumber(observation.toleranceValue);

        const result = observation.result.toUpperCase();

        tableY = drawTestResultRow(
          doc,
          tableY,
          [testName, input, indicated, error, mpe, result],
          index,
        );
      }

      doc.y = tableY + 18;
    }

    // ==================================================
    // 6. OVERALL COMPLIANCE
    // ==================================================

    if (doc.y + 125 > CONTENT_BOTTOM) {
      doc.addPage();
    }

    drawSectionTitle(doc, "6. Overall Compliance");

    const resultText =
      report.overallResult === "pass"
        ? "PASS"
        : report.overallResult === "fail"
          ? "FAIL"
          : "PENDING";

    const resultY = doc.y;

    doc.roundedRect(PAGE_LEFT, resultY, PAGE_WIDTH, 58, 4).fill("#f3f4f6");

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#6b7280")
      .text("FINAL COMPLIANCE RESULT", PAGE_LEFT + 14, resultY + 11);

    doc
      .font("Helvetica-Bold")
      .fontSize(17)
      .fillColor("#111827")
      .text(resultText, PAGE_LEFT + 14, resultY + 27);

    doc.y = resultY + 72;

    if (report.remarks) {
      drawField(doc, "Remarks", report.remarks, PAGE_LEFT, PAGE_WIDTH);
    }

    doc.moveDown(1);

    // ==================================================
    // 7. AUTHORIZATION
    // ==================================================

    drawSectionTitle(doc, "7. Authorization");

    const signatureY = doc.y;

    const signatureWidth = 225;

    const rightSignatureX = PAGE_LEFT + signatureWidth + 45;

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#374151")
      .text("Tested By", PAGE_LEFT, signatureY);

    doc
      .moveTo(PAGE_LEFT, signatureY + 30)
      .lineTo(PAGE_LEFT + signatureWidth, signatureY + 30)
      .strokeColor("#6b7280")
      .lineWidth(0.7)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#6b7280")
      .text("Signature / Name", PAGE_LEFT, signatureY + 35);

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#374151")
      .text("Reviewed By", rightSignatureX, signatureY);

    doc
      .moveTo(rightSignatureX, signatureY + 30)
      .lineTo(PAGE_RIGHT, signatureY + 30)
      .strokeColor("#6b7280")
      .lineWidth(0.7)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#6b7280")
      .text("Signature / Name", rightSignatureX, signatureY + 35);

    const secondRowY = signatureY + 75;

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#374151")
      .text("Approved By", PAGE_LEFT, secondRowY);

    doc
      .moveTo(PAGE_LEFT, secondRowY + 30)
      .lineTo(PAGE_LEFT + signatureWidth, secondRowY + 30)
      .strokeColor("#6b7280")
      .lineWidth(0.7)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#6b7280")
      .text("Signature / Name", PAGE_LEFT, secondRowY + 35);

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#374151")
      .text("Date", rightSignatureX, secondRowY);

    doc
      .moveTo(rightSignatureX, secondRowY + 30)
      .lineTo(PAGE_RIGHT, secondRowY + 30)
      .strokeColor("#6b7280")
      .lineWidth(0.7)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#6b7280")
      .text("Date", rightSignatureX, secondRowY + 35);

    doc.y = secondRowY + 60;

    // ==================================================
    // DISCLAIMER
    // ==================================================

    doc.moveDown(1);

    resetPosition(doc);

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor("#6b7280")
      .text(
        "Generated by METRO-R76 Digital Test Reporting System. " +
          "This report documents recorded test data and calculated results. " +
          "It is not itself an OIML-issued certificate.",
        PAGE_LEFT,
        doc.y,
        {
          width: PAGE_WIDTH,
          align: "center",
        },
      );

    // ==================================================
    // PAGE FOOTERS
    // ==================================================

    const pageRange = doc.bufferedPageRange();

    const totalPages = pageRange.count;

    for (
      let index = pageRange.start;
      index < pageRange.start + pageRange.count;
      index++
    ) {
      doc.switchToPage(index);

      drawPageFooter(doc, report.reportNumber, index + 1, totalPages);
    }

    // Finalize PDF.
    // The "end" event above will resolve
    // the Promise with the complete Buffer.
    doc.end();
  });
};
