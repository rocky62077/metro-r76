import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTestReports, type TestReport } from "../api/testReports";

import { getInstruments, type Instrument } from "../api/instruments";

import {
  calculateTestObservation,
  createTestObservation,
  getTestObservations,
  type TestObservation,
} from "../api/testObservations";

import {
  getTestDefinitions,
  type TestDefinition,
} from "../api/testDefinitions";

type WorkspaceTest = {
  key: string;
  name: string;
  description: string;
  icon: string;
  categories: string[];
  keywords: string[];
};

const WORKSPACE_TESTS: WorkspaceTest[] = [
  {
    key: "accuracy",
    name: "Accuracy",
    description:
      "Verification of indication error against maximum permissible error.",
    icon: "A",
    categories: ["accuracy", "metrological"],
    keywords: ["accuracy", "indication", "error"],
  },
  {
    key: "repeatability",
    name: "Repeatability",
    description:
      "Verification of repeated weighing results under the same conditions.",
    icon: "R",
    categories: ["repeatability"],
    keywords: ["repeatability", "repeat", "repeated"],
  },
  {
    key: "eccentricity",
    name: "Eccentricity",
    description:
      "Verification of indication error for different load positions.",
    icon: "E",
    categories: ["eccentricity"],
    keywords: ["eccentricity", "eccentric", "position"],
  },
  {
    key: "zero",
    name: "Zero-setting",
    description:
      "Verification of zero indication and zero-setting performance.",
    icon: "Z",
    categories: ["zero", "zero_setting"],
    keywords: ["zero", "zero-setting", "zero setting"],
  },
  {
    key: "tare",
    name: "Tare",
    description: "Verification of tare operation and weighing indication.",
    icon: "T",
    categories: ["tare"],
    keywords: ["tare"],
  },
];

type AccuracyForm = {
  testLoad: string;
  indicatedValue: string;
  remarks: string;
};

type RepeatabilityForm = {
  testLoad: string;
  readings: string[];
  remarks: string;
};

type EccentricityForm = {
  testLoad: string;
  center: string;
  front: string;
  back: string;
  left: string;
  right: string;
  remarks: string;
};

type ZeroForm = {
  initialZero: string;
  zeroSettingResult: string;
  afterZero: string;
  returnToZero: string;
  remarks: string;
};

type TareForm = {
  grossLoad: string;
  tareLoad: string;
  tareIndication: string;
  netIndication: string;
  remarks: string;
};

const EMPTY_ACCURACY: AccuracyForm = {
  testLoad: "",
  indicatedValue: "",
  remarks: "",
};

const EMPTY_REPEATABILITY: RepeatabilityForm = {
  testLoad: "",
  readings: ["", "", "", "", ""],
  remarks: "",
};

const EMPTY_ECCENTRICITY: EccentricityForm = {
  testLoad: "",
  center: "",
  front: "",
  back: "",
  left: "",
  right: "",
  remarks: "",
};

const EMPTY_ZERO: ZeroForm = {
  initialZero: "",
  zeroSettingResult: "",
  afterZero: "",
  returnToZero: "",
  remarks: "",
};

const EMPTY_TARE: TareForm = {
  grossLoad: "",
  tareLoad: "",
  tareIndication: "",
  netIndication: "",
  remarks: "",
};

function normalize(value?: string): string {
  return (
    value?.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ") ||
    ""
  );
}

function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function getDefinitionCode(
  definition: TestObservation["testDefinition"],
): string {
  if (typeof definition === "string") {
    return definition;
  }

  return definition?.code || "";
}

function getResultClass(result?: string): string {
  if (result === "pass") return "result-pass";
  if (result === "fail") return "result-fail";

  return "result-pending";
}

function getResultLabel(result?: string): string {
  if (!result) return "Pending";

  return result.charAt(0).toUpperCase() + result.slice(1);
}

function definitionMatchesTest(
  definition: TestDefinition,
  test: WorkspaceTest,
): boolean {
  const category = normalize(definition.category);
  const name = normalize(definition.name);
  const code = normalize(definition.code);

  if (test.categories.some((item) => normalize(item) === category)) {
    return true;
  }

  return test.keywords.some(
    (keyword) =>
      name.includes(normalize(keyword)) || code.includes(normalize(keyword)),
  );
}

function formatDate(value?: string): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TestWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<TestReport | null>(null);
  const [instrument, setInstrument] = useState<Instrument | null>(null);

  const [observations, setObservations] = useState<TestObservation[]>([]);

  const [definitions, setDefinitions] = useState<TestDefinition[]>([]);

  const [selectedTest, setSelectedTest] = useState<WorkspaceTest>(
    WORKSPACE_TESTS[0],
  );

  const [accuracy, setAccuracy] = useState<AccuracyForm>({
    ...EMPTY_ACCURACY,
  });

  const [repeatability, setRepeatability] = useState<RepeatabilityForm>({
    ...EMPTY_REPEATABILITY,
    readings: [...EMPTY_REPEATABILITY.readings],
  });

  const [eccentricity, setEccentricity] = useState<EccentricityForm>({
    ...EMPTY_ECCENTRICITY,
  });

  const [zeroSetting, setZeroSetting] = useState<ZeroForm>({
    ...EMPTY_ZERO,
  });

  const [tare, setTare] = useState<TareForm>({
    ...EMPTY_TARE,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * ---------------------------------------------------------
   * FIND THE BACKEND TEST DEFINITION
   * ---------------------------------------------------------
   *
   * We DO NOT assume codes like R76-ACCURACY.
   *
   * We match using:
   * - category
   * - test name
   * - code
   *
   * This allows your existing backend definitions to work.
   */

  const selectedDefinition = useMemo(() => {
    return definitions.find((definition) =>
      definitionMatchesTest(definition, selectedTest),
    );
  }, [definitions, selectedTest]);

  /*
   * ---------------------------------------------------------
   * SELECTED TEST OBSERVATIONS
   * ---------------------------------------------------------
   */

  const selectedObservations = useMemo(() => {
    if (!selectedDefinition) {
      return [];
    }

    return observations.filter((observation) => {
      const definitionCode = normalize(
        getDefinitionCode(observation.testDefinition),
      );

      const selectedCode = normalize(selectedDefinition.code);

      return (
        definitionCode === selectedCode ||
        definitionCode.includes(selectedCode) ||
        selectedCode.includes(definitionCode)
      );
    });
  }, [observations, selectedDefinition]);

  /*
   * ---------------------------------------------------------
   * COUNTERS
   * ---------------------------------------------------------
   */

  const passedCount = observations.filter(
    (item) => item.result === "pass",
  ).length;

  const failedCount = observations.filter(
    (item) => item.result === "fail",
  ).length;

  const pendingCount = observations.filter(
    (item) => item.result === "pending",
  ).length;

  /*
   * ---------------------------------------------------------
   * INSTRUMENT INFORMATION
   * ---------------------------------------------------------
   */

  const instrumentData = instrument || report?.instrument;

  const capacity = instrumentData?.capacity;

  const capacityUnit = instrumentData?.capacityUnit || "kg";

  const scaleInterval = instrumentData?.scaleInterval;

  const scaleIntervalUnit = instrumentData?.scaleIntervalUnit || capacityUnit;

  const accuracyClass = instrumentData?.accuracyClass;

  /*
   * ---------------------------------------------------------
   * LOAD EVERYTHING
   * ---------------------------------------------------------
   */

  async function loadWorkspace() {
    if (!id) {
      setError("Test report ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [reports, reportObservations, testDefinitions, instruments] =
        await Promise.all([
          getTestReports(),
          getTestObservations(id),
          getTestDefinitions(),
          getInstruments(),
        ]);

      const currentReport = reports.find((item) => item._id === id);

      if (!currentReport) {
        throw new Error("Test report could not be found.");
      }

      setReport(currentReport);
      setObservations(reportObservations);
      setDefinitions(testDefinitions);

      /*
       * The report contains instrument._id.
       * Fetch the full instrument record so capacity,
       * scale interval and class are available.
       */

      const reportInstrumentId = currentReport.instrument?._id;

      if (reportInstrumentId) {
        const fullInstrument = instruments.find(
          (item) => item._id === reportInstrumentId,
        );

        if (fullInstrument) {
          setInstrument(fullInstrument);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load test workspace.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkspace();
  }, [id]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function resetSelectedForm() {
    if (selectedTest.key === "accuracy") {
      setAccuracy({
        ...EMPTY_ACCURACY,
      });
    }

    if (selectedTest.key === "repeatability") {
      setRepeatability({
        ...EMPTY_REPEATABILITY,
        readings: [...EMPTY_REPEATABILITY.readings],
      });
    }

    if (selectedTest.key === "eccentricity") {
      setEccentricity({
        ...EMPTY_ECCENTRICITY,
      });
    }

    if (selectedTest.key === "zero") {
      setZeroSetting({
        ...EMPTY_ZERO,
      });
    }

    if (selectedTest.key === "tare") {
      setTare({
        ...EMPTY_TARE,
      });
    }

    clearMessages();
  }

  /*
   * ---------------------------------------------------------
   * OBSERVATION NUMBER
   * ---------------------------------------------------------
   */

  function getNextObservationNumber(): number {
    if (observations.length === 0) {
      return 1;
    }

    return (
      Math.max(...observations.map((item) => item.observationNumber || 0)) + 1
    );
  }

  /*
   * ---------------------------------------------------------
   * SAVE OBSERVATION
   * ---------------------------------------------------------
   */

  async function saveObservation(
    inputValue: number | undefined,
    indicatedValue: number | undefined,
    rawData: Record<string, unknown>,
    remarks?: string,
  ) {
    if (!id) {
      throw new Error("Test report ID is missing.");
    }

    if (!selectedDefinition) {
      throw new Error(
        `No backend test definition was found for ${selectedTest.name}.`,
      );
    }

    const observation = await createTestObservation({
      testReport: id,
      testDefinition: selectedDefinition._id,
      observationNumber: getNextObservationNumber(),
      inputValue,
      inputUnit: capacityUnit,
      indicatedValue,
      indicatedUnit: capacityUnit,
      remarks: remarks?.trim() || undefined,
      rawData,
    });

    setObservations((current) => [...current, observation]);

    return observation;
  }

  /*
   * ---------------------------------------------------------
   * ACCURACY
   * ---------------------------------------------------------
   */

  async function handleAccuracySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearMessages();

    if (!selectedDefinition) {
      setError("No Accuracy test definition is available in the backend.");
      return;
    }

    const load = numberOrNull(accuracy.testLoad);

    const indicated = numberOrNull(accuracy.indicatedValue);

    if (load === null || indicated === null) {
      setError("Enter both test load and indicated value.");
      return;
    }

    try {
      setSaving(true);

      const observation = await saveObservation(
        load,
        indicated,
        {
          testType: "accuracy",
          testLoad: load,
          indicatedValue: indicated,
        },
        accuracy.remarks,
      );

      /*
       * Your existing backend has the generic
       * observation calculation endpoint.
       */

      try {
        setCalculating(true);

        const calculation = await calculateTestObservation(observation._id);

        setObservations((current) =>
          current.map((item) =>
            item._id === observation._id ? calculation.observation : item,
          ),
        );

        setSuccess(
          `Accuracy calculation completed: ${calculation.calculation.result.toUpperCase()}.`,
        );
      } catch {
        setSuccess("Accuracy observation saved. Calculation is pending.");
      }

      setAccuracy({
        ...EMPTY_ACCURACY,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save Accuracy test.",
      );
    } finally {
      setSaving(false);
      setCalculating(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * REPEATABILITY
   * ---------------------------------------------------------
   */

  async function handleRepeatabilitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearMessages();

    if (!selectedDefinition) {
      setError("No Repeatability test definition is available.");
      return;
    }

    const load = numberOrNull(repeatability.testLoad);

    const readings = repeatability.readings
      .map(numberOrNull)
      .filter((value): value is number => value !== null);

    if (load === null) {
      setError("Enter the repeatability test load.");
      return;
    }

    if (readings.length < 2) {
      setError("Enter at least two repeatability readings.");
      return;
    }

    try {
      setSaving(true);

      await saveObservation(
        load,
        readings[0],
        {
          testType: "repeatability",
          testLoad: load,
          readings,
          readingCount: readings.length,
        },
        repeatability.remarks,
      );

      setSuccess("Repeatability test data recorded successfully.");

      setRepeatability({
        ...EMPTY_REPEATABILITY,
        readings: [...EMPTY_REPEATABILITY.readings],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save Repeatability test.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * ECCENTRICITY
   * ---------------------------------------------------------
   */

  async function handleEccentricitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearMessages();

    if (!selectedDefinition) {
      setError("No Eccentricity test definition is available.");
      return;
    }

    const load = numberOrNull(eccentricity.testLoad);

    const positions = {
      center: numberOrNull(eccentricity.center),
      front: numberOrNull(eccentricity.front),
      back: numberOrNull(eccentricity.back),
      left: numberOrNull(eccentricity.left),
      right: numberOrNull(eccentricity.right),
    };

    if (load === null) {
      setError("Enter the eccentricity test load.");
      return;
    }

    if (Object.values(positions).some((value) => value === null)) {
      setError("Enter an indication for every position.");
      return;
    }

    try {
      setSaving(true);

      await saveObservation(
        load,
        positions.center ?? undefined,
        {
          testType: "eccentricity",
          testLoad: load,
          positions,
        },
        eccentricity.remarks,
      );

      setSuccess("Eccentricity test data recorded successfully.");

      setEccentricity({
        ...EMPTY_ECCENTRICITY,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save Eccentricity test.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * ZERO SETTING
   * ---------------------------------------------------------
   */

  async function handleZeroSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearMessages();

    if (!selectedDefinition) {
      setError("No Zero-setting test definition is available.");
      return;
    }

    const initialZero = numberOrNull(zeroSetting.initialZero);

    const zeroResult = numberOrNull(zeroSetting.zeroSettingResult);

    const afterZero = numberOrNull(zeroSetting.afterZero);

    const returnToZero = numberOrNull(zeroSetting.returnToZero);

    if (
      initialZero === null ||
      zeroResult === null ||
      afterZero === null ||
      returnToZero === null
    ) {
      setError("Complete all zero-setting measurements.");
      return;
    }

    try {
      setSaving(true);

      await saveObservation(
        initialZero,
        afterZero,
        {
          testType: "zero-setting",
          initialZero,
          zeroSettingResult: zeroResult,
          afterZero,
          returnToZero,
        },
        zeroSetting.remarks,
      );

      setSuccess("Zero-setting test data recorded successfully.");

      setZeroSetting({
        ...EMPTY_ZERO,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save Zero-setting test.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * TARE
   * ---------------------------------------------------------
   */

  async function handleTareSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearMessages();

    if (!selectedDefinition) {
      setError("No Tare test definition is available.");
      return;
    }

    const grossLoad = numberOrNull(tare.grossLoad);

    const tareLoad = numberOrNull(tare.tareLoad);

    const tareIndication = numberOrNull(tare.tareIndication);

    const netIndication = numberOrNull(tare.netIndication);

    if (
      grossLoad === null ||
      tareLoad === null ||
      tareIndication === null ||
      netIndication === null
    ) {
      setError("Complete all tare measurements.");
      return;
    }

    try {
      setSaving(true);

      await saveObservation(
        grossLoad,
        netIndication,
        {
          testType: "tare",
          grossLoad,
          tareLoad,
          tareIndication,
          netIndication,
        },
        tare.remarks,
      );

      setSuccess("Tare test data recorded successfully.");

      setTare({
        ...EMPTY_TARE,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save Tare test.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * MANUAL CALCULATION
   * ---------------------------------------------------------
   */

  async function handleCalculate(observationId: string) {
    try {
      setCalculating(true);
      clearMessages();

      const result = await calculateTestObservation(observationId);

      setObservations((current) =>
        current.map((item) =>
          item._id === observationId ? result.observation : item,
        ),
      );

      setSuccess(
        `Calculation completed: ${result.calculation.result.toUpperCase()}.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to calculate observation.",
      );
    } finally {
      setCalculating(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * FORM COMPONENTS
   * ---------------------------------------------------------
   */

  function renderAccuracyForm() {
    return (
      <form className="special-test-form" onSubmit={handleAccuracySubmit}>
        <div className="special-form-grid">
          <MeasurementField
            label="Test Load"
            value={accuracy.testLoad}
            onChange={(value) =>
              setAccuracy((current) => ({
                ...current,
                testLoad: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Indicated Value"
            value={accuracy.indicatedValue}
            onChange={(value) =>
              setAccuracy((current) => ({
                ...current,
                indicatedValue: value,
              }))
            }
            unit={capacityUnit}
          />

          <RemarksField
            value={accuracy.remarks}
            onChange={(value) =>
              setAccuracy((current) => ({
                ...current,
                remarks: value,
              }))
            }
          />
        </div>

        <FormActions
          saving={saving}
          onClear={resetSelectedForm}
          submitLabel="Record & Calculate Accuracy"
        />
      </form>
    );
  }

  function renderRepeatabilityForm() {
    return (
      <form className="special-test-form" onSubmit={handleRepeatabilitySubmit}>
        <div className="special-form-grid">
          <MeasurementField
            label="Test Load"
            value={repeatability.testLoad}
            onChange={(value) =>
              setRepeatability((current) => ({
                ...current,
                testLoad: value,
              }))
            }
            unit={capacityUnit}
          />

          {repeatability.readings.map((reading, index) => (
            <MeasurementField
              key={index}
              label={`Reading ${index + 1}`}
              value={reading}
              onChange={(value) =>
                setRepeatability((current) => ({
                  ...current,
                  readings: current.readings.map((item, itemIndex) =>
                    itemIndex === index ? value : item,
                  ),
                }))
              }
              unit={capacityUnit}
            />
          ))}

          <RemarksField
            value={repeatability.remarks}
            onChange={(value) =>
              setRepeatability((current) => ({
                ...current,
                remarks: value,
              }))
            }
          />
        </div>

        <FormActions
          saving={saving}
          onClear={resetSelectedForm}
          submitLabel="Record Repeatability Test"
        />
      </form>
    );
  }

  function renderEccentricityForm() {
    return (
      <form className="special-test-form" onSubmit={handleEccentricitySubmit}>
        <div className="special-form-grid">
          <MeasurementField
            label="Test Load"
            value={eccentricity.testLoad}
            onChange={(value) =>
              setEccentricity((current) => ({
                ...current,
                testLoad: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Center Position"
            value={eccentricity.center}
            onChange={(value) =>
              setEccentricity((current) => ({
                ...current,
                center: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Front Position"
            value={eccentricity.front}
            onChange={(value) =>
              setEccentricity((current) => ({
                ...current,
                front: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Back Position"
            value={eccentricity.back}
            onChange={(value) =>
              setEccentricity((current) => ({
                ...current,
                back: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Left Position"
            value={eccentricity.left}
            onChange={(value) =>
              setEccentricity((current) => ({
                ...current,
                left: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Right Position"
            value={eccentricity.right}
            onChange={(value) =>
              setEccentricity((current) => ({
                ...current,
                right: value,
              }))
            }
            unit={capacityUnit}
          />

          <RemarksField
            value={eccentricity.remarks}
            onChange={(value) =>
              setEccentricity((current) => ({
                ...current,
                remarks: value,
              }))
            }
          />
        </div>

        <FormActions
          saving={saving}
          onClear={resetSelectedForm}
          submitLabel="Record Eccentricity Test"
        />
      </form>
    );
  }

  function renderZeroForm() {
    return (
      <form className="special-test-form" onSubmit={handleZeroSubmit}>
        <div className="special-form-grid">
          <MeasurementField
            label="Initial Zero Indication"
            value={zeroSetting.initialZero}
            onChange={(value) =>
              setZeroSetting((current) => ({
                ...current,
                initialZero: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Zero-setting Operation Result"
            value={zeroSetting.zeroSettingResult}
            onChange={(value) =>
              setZeroSetting((current) => ({
                ...current,
                zeroSettingResult: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Indication After Zero-setting"
            value={zeroSetting.afterZero}
            onChange={(value) =>
              setZeroSetting((current) => ({
                ...current,
                afterZero: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Return-to-zero Indication"
            value={zeroSetting.returnToZero}
            onChange={(value) =>
              setZeroSetting((current) => ({
                ...current,
                returnToZero: value,
              }))
            }
            unit={capacityUnit}
          />

          <RemarksField
            value={zeroSetting.remarks}
            onChange={(value) =>
              setZeroSetting((current) => ({
                ...current,
                remarks: value,
              }))
            }
          />
        </div>

        <FormActions
          saving={saving}
          onClear={resetSelectedForm}
          submitLabel="Record Zero-setting Test"
        />
      </form>
    );
  }

  function renderTareForm() {
    return (
      <form className="special-test-form" onSubmit={handleTareSubmit}>
        <div className="special-form-grid">
          <MeasurementField
            label="Gross Load"
            value={tare.grossLoad}
            onChange={(value) =>
              setTare((current) => ({
                ...current,
                grossLoad: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Tare Load"
            value={tare.tareLoad}
            onChange={(value) =>
              setTare((current) => ({
                ...current,
                tareLoad: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Tare Indication"
            value={tare.tareIndication}
            onChange={(value) =>
              setTare((current) => ({
                ...current,
                tareIndication: value,
              }))
            }
            unit={capacityUnit}
          />

          <MeasurementField
            label="Net Indication"
            value={tare.netIndication}
            onChange={(value) =>
              setTare((current) => ({
                ...current,
                netIndication: value,
              }))
            }
            unit={capacityUnit}
          />

          <RemarksField
            value={tare.remarks}
            onChange={(value) =>
              setTare((current) => ({
                ...current,
                remarks: value,
              }))
            }
          />
        </div>

        <FormActions
          saving={saving}
          onClear={resetSelectedForm}
          submitLabel="Record Tare Test"
        />
      </form>
    );
  }

  function renderSelectedForm() {
    switch (selectedTest.key) {
      case "accuracy":
        return renderAccuracyForm();

      case "repeatability":
        return renderRepeatabilityForm();

      case "eccentricity":
        return renderEccentricityForm();

      case "zero":
        return renderZeroForm();

      case "tare":
        return renderTareForm();

      default:
        return null;
    }
  }

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="workspace-page">
        <div className="workspace-loading">
          <div className="workspace-spinner" />
          <p>Loading OIML R76 test workspace...</p>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * REPORT NOT FOUND
   * ---------------------------------------------------------
   */

  if (!report) {
    return (
      <main className="workspace-page">
        <div className="workspace-error-card">
          <div className="workspace-error-icon">!</div>

          <h2>Test report not found</h2>

          <p>The requested test report could not be loaded.</p>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/test-reports")}
          >
            Back to Test Reports
          </button>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN UI
   * ---------------------------------------------------------
   */

  return (
    <main className="workspace-page">
      <div className="workspace-shell">
        {/* HEADER */}

        <header className="workspace-header">
          <div>
            <button
              type="button"
              className="back-button"
              onClick={() => navigate(`/test-reports/${report._id}`)}
            >
              ← Back to Report
            </button>

            <div className="workspace-kicker">METRO R76 / TEST WORKSPACE</div>

            <h1>OIML R76 Test Workspace</h1>

            <p>
              Record test-specific observations and maintain the digital test
              record for this instrument.
            </p>
          </div>

          <div className="workspace-report-chip">
            <span>Report</span>

            <strong>{report.reportNumber}</strong>
          </div>
        </header>

        {/* INSTRUMENT SUMMARY */}

        <section className="workspace-summary">
          <div className="summary-main">
            <div className="summary-icon">R76</div>

            <div>
              <span className="summary-label">Instrument</span>

              <h2>{instrumentData?.instrumentName || "Unnamed Instrument"}</h2>

              <p>
                {instrumentData?.modelNumber || "—"} · Serial{" "}
                {instrumentData?.serialNumber || "—"}
              </p>
            </div>
          </div>

          <div className="summary-spec">
            <span>Capacity</span>

            <strong>
              {capacity ?? "—"} {capacity !== undefined ? capacityUnit : ""}
            </strong>
          </div>

          <div className="summary-spec">
            <span>Scale Interval</span>

            <strong>
              {scaleInterval ?? "—"}{" "}
              {scaleInterval !== undefined ? scaleIntervalUnit : ""}
            </strong>
          </div>

          <div className="summary-spec">
            <span>Accuracy Class</span>

            <strong>{accuracyClass || "—"}</strong>
          </div>
        </section>

        {/* ALERTS */}

        {error && (
          <div className="workspace-alert workspace-alert-error">
            <strong>Error</strong>

            <span>{error}</span>

            <button type="button" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="workspace-alert workspace-alert-success">
            <strong>Success</strong>

            <span>{success}</span>

            <button type="button" onClick={() => setSuccess("")}>
              ×
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <section className="workspace-stats">
          <div className="workspace-stat">
            <span>Total observations</span>

            <strong>{observations.length}</strong>
          </div>

          <div className="workspace-stat">
            <span>Passed</span>

            <strong className="stat-pass">{passedCount}</strong>
          </div>

          <div className="workspace-stat">
            <span>Failed</span>

            <strong className="stat-fail">{failedCount}</strong>
          </div>

          <div className="workspace-stat">
            <span>Pending</span>

            <strong>{pendingCount}</strong>
          </div>
        </section>

        {/* TEST SELECTOR */}

        <section className="test-selector-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">APPLICABLE TESTS</span>

              <h2>OIML R76 verification</h2>
            </div>

            <span className="test-count">{WORKSPACE_TESTS.length} tests</span>
          </div>

          <div className="test-selector-grid">
            {WORKSPACE_TESTS.map((test) => {
              const definition = definitions.find((item) =>
                definitionMatchesTest(item, test),
              );

              const count = definition
                ? observations.filter(
                    (observation) =>
                      normalize(
                        getDefinitionCode(observation.testDefinition),
                      ) === normalize(definition.code),
                  ).length
                : 0;

              const selected = selectedTest.key === test.key;

              return (
                <button
                  key={test.key}
                  type="button"
                  className={`test-card ${selected ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedTest(test);
                    clearMessages();
                  }}
                >
                  <div className="test-card-top">
                    <div className="test-card-icon">{test.icon}</div>

                    {count > 0 && (
                      <span className="test-card-count">{count}</span>
                    )}
                  </div>

                  <h3>{test.name}</h3>

                  <p>{test.description}</p>

                  <div className="test-card-footer">
                    <span>{test.key}</span>

                    <span
                      className={
                        definition
                          ? "definition-configured"
                          : "definition-missing"
                      }
                    >
                      {definition ? "Configured" : "Not configured"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ACTIVE TEST */}

        <section className="active-test-section">
          <div className="active-test-header">
            <div>
              <span className="section-kicker">ACTIVE TEST</span>

              <h2>{selectedTest.name}</h2>

              <p>{selectedTest.description}</p>
            </div>

            <div className="active-test-code">
              {selectedDefinition?.code || selectedTest.key.toUpperCase()}
            </div>
          </div>

          {!selectedDefinition ? (
            <div className="definition-warning">
              <div className="definition-warning-icon">!</div>

              <div>
                <h3>No matching backend test definition found</h3>

                <p>
                  The frontend form is ready, but the backend did not return a
                  TestDefinition matching this test.
                </p>

                <p>
                  Loaded definitions: <strong>{definitions.length}</strong>
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="test-definition-banner">
                <div>
                  <span>BACKEND DEFINITION</span>

                  <strong>{selectedDefinition.name}</strong>
                </div>

                <div>
                  <span>STANDARD</span>

                  <strong>{selectedDefinition.standardReference}</strong>
                </div>

                <div>
                  <span>VERSION</span>

                  <strong>{selectedDefinition.version}</strong>
                </div>
              </div>

              {renderSelectedForm()}

              <div className="observations-card">
                <div className="observations-header">
                  <div>
                    <h3>Recorded {selectedTest.name} Results</h3>

                    <p>
                      {selectedObservations.length} observation
                      {selectedObservations.length === 1 ? "" : "s"} recorded.
                    </p>
                  </div>
                </div>

                {selectedObservations.length === 0 ? (
                  <div className="empty-observations">
                    <div className="empty-icon">+</div>

                    <h3>No results recorded yet</h3>

                    <p>
                      Enter the test measurements above to create the first
                      record.
                    </p>
                  </div>
                ) : (
                  <div className="observations-table-wrap">
                    <table className="observations-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Input</th>
                          <th>Indicated</th>
                          <th>Error</th>
                          <th>Tolerance</th>
                          <th>Result</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedObservations.map((observation) => (
                          <tr key={observation._id}>
                            <td>
                              <strong>{observation.observationNumber}</strong>
                            </td>

                            <td>
                              {observation.inputValue ?? "—"}{" "}
                              {observation.inputValue !== undefined
                                ? observation.inputUnit || capacityUnit
                                : ""}
                            </td>

                            <td>
                              {observation.indicatedValue ?? "—"}{" "}
                              {observation.indicatedValue !== undefined
                                ? observation.indicatedUnit || capacityUnit
                                : ""}
                            </td>

                            <td>
                              {observation.errorValue ?? "—"}{" "}
                              {observation.errorValue !== undefined
                                ? observation.errorUnit || capacityUnit
                                : ""}
                            </td>

                            <td>
                              {observation.toleranceValue ?? "—"}{" "}
                              {observation.toleranceValue !== undefined
                                ? observation.toleranceUnit || capacityUnit
                                : ""}
                            </td>

                            <td>
                              <span
                                className={`result-badge ${getResultClass(
                                  observation.result,
                                )}`}
                              >
                                {getResultLabel(observation.result)}
                              </span>
                            </td>

                            <td>
                              {observation.result === "pending" && (
                                <button
                                  type="button"
                                  className="calculate-button"
                                  disabled={calculating}
                                  onClick={() =>
                                    handleCalculate(observation._id)
                                  }
                                >
                                  {calculating ? "Calculating..." : "Calculate"}
                                </button>
                              )}

                              {observation.result !== "pending" && (
                                <span className="calculated-label">
                                  Calculated
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* FOOTER */}

        <footer className="workspace-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(`/test-reports/${report._id}`)}
          >
            ← Back to Report
          </button>

          <div className="workspace-footer-info">
            <span>OIML R76 digital test record</span>

            <span>•</span>

            <span>{report.reportNumber}</span>

            <span>•</span>

            <span>Tested {formatDate(report.testDate)}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

/*
 * =========================================================
 * REUSABLE FORM COMPONENTS
 * =========================================================
 */

function FormActions({
  saving,
  onClear,
  submitLabel,
}: {
  saving: boolean;
  onClear: () => void;
  submitLabel: string;
}) {
  return (
    <div className="form-actions">
      <button
        type="button"
        className="secondary-button"
        onClick={onClear}
        disabled={saving}
      >
        Clear
      </button>

      <button type="submit" className="primary-button" disabled={saving}>
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}

function MeasurementField({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <div className="input-with-unit">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter value"
        />

        <span>{unit}</span>
      </div>
    </label>
  );
}

function RemarksField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field field-wide">
      <span>Remarks</span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Optional remarks"
      />
    </label>
  );
}
