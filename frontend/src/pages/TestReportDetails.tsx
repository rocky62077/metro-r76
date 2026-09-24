import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTestReports, type TestReport } from "../api/testReports";

function formatDate(value?: string) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    in_progress: "In Progress",
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
  };

  return labels[status] || status;
}

function formatResult(result: string) {
  if (result === "pass") return "PASS";
  if (result === "fail") return "FAIL";
  return "PENDING";
}

function getWorkflowIndex(status: string) {
  const workflow = [
    "draft",
    "in_progress",
    "submitted",
    "under_review",
    "approved",
    "completed",
  ];

  const index = workflow.indexOf(status);

  return index === -1 ? 0 : index;
}

export default function TestReportDetails() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [report, setReport] = useState<TestReport | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReport() {
      if (!id) {
        setError("Test report ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const reports = await getTestReports();

        const foundReport = reports.find((item) => item._id === id);

        if (!foundReport) {
          setError("Test report could not be found.");
          return;
        }

        setReport(foundReport);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load test report.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [id]);

  if (loading) {
    return (
      <main className="main-content report-details-page">
        <div className="report-details-loading">
          <div className="report-details-spinner" />

          <strong>Loading test report</strong>

          <span>Fetching report information...</span>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="main-content report-details-page">
        <div className="report-details-error">
          <div className="report-error-icon">!</div>

          <h2>Report unavailable</h2>

          <p>{error || "The requested test report could not be found."}</p>

          <button
            type="button"
            className="report-primary-button"
            onClick={() => navigate("/test-reports")}
          >
            ← Back to Test Reports
          </button>
        </div>
      </main>
    );
  }

  const workflowSteps = [
    {
      key: "draft",
      label: "Draft",
    },
    {
      key: "in_progress",
      label: "Testing",
    },
    {
      key: "submitted",
      label: "Submitted",
    },
    {
      key: "under_review",
      label: "Review",
    },
    {
      key: "approved",
      label: "Approved",
    },
    {
      key: "completed",
      label: "Completed",
    },
  ];

  const workflowIndex = getWorkflowIndex(report.status);

  const resultIsFail = report.overallResult === "fail";

  const resultIsPass = report.overallResult === "pass";

  return (
    <main className="main-content report-details-page">
      <header className="topbar report-details-topbar">
        <div>
          <div className="page-kicker">METRO R76 / TEST REPORT</div>

          <h1>Test Report Details</h1>

          <p>Review instrument testing, compliance and report workflow.</p>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          System Online
        </div>
      </header>

      <section className="dashboard-content report-details-content">
        <button
          type="button"
          className="report-back-link"
          onClick={() => navigate("/test-reports")}
        >
          ← All Test Reports
        </button>

        {/* Report hero */}
        <section className="report-detail-hero">
          <div className="report-detail-hero-main">
            <div className="report-document-icon">R76</div>

            <div>
              <div className="report-detail-eyebrow">OIML R76 TEST REPORT</div>

              <h2>{report.reportNumber}</h2>

              <p>
                Digital test report for a{" "}
                <strong>
                  {report.instrument?.instrumentName ||
                    "Non-Automatic Weighing Instrument"}
                </strong>
                .
              </p>
            </div>
          </div>

          <div className="report-detail-hero-status">
            <span className={`detail-status-pill status-${report.status}`}>
              {formatStatus(report.status)}
            </span>

            <span
              className={`detail-result-pill result-${report.overallResult}`}
            >
              <i />
              {formatResult(report.overallResult)}
            </span>
          </div>
        </section>

        {/* Quick information */}
        <section className="report-quick-grid">
          <div className="report-quick-card">
            <span>REPORT NUMBER</span>
            <strong>{report.reportNumber}</strong>
          </div>

          <div className="report-quick-card">
            <span>TEST DATE</span>
            <strong>{formatDate(report.testDate)}</strong>
          </div>

          <div className="report-quick-card">
            <span>WORKFLOW STATUS</span>
            <strong>{formatStatus(report.status)}</strong>
          </div>

          <div className="report-quick-card">
            <span>OVERALL RESULT</span>
            <strong
              className={
                resultIsFail
                  ? "text-danger"
                  : resultIsPass
                    ? "text-success"
                    : ""
              }
            >
              {formatResult(report.overallResult)}
            </strong>
          </div>
        </section>

        {/* Workflow */}
        <section className="report-section-card">
          <div className="report-section-header">
            <div>
              <span className="report-section-kicker">WORKFLOW</span>

              <h3>Report Progress</h3>

              <p>Current position in the test-report workflow.</p>
            </div>

            <div className="workflow-progress-value">
              {Math.round((workflowIndex / (workflowSteps.length - 1)) * 100)}%
            </div>
          </div>

          <div className="workflow-container">
            <div className="workflow-line">
              <div
                className="workflow-line-fill"
                style={{
                  width: `${
                    (workflowIndex / (workflowSteps.length - 1)) * 100
                  }%`,
                }}
              />
            </div>

            <div className="workflow-steps">
              {workflowSteps.map((step, index) => {
                const completed = index <= workflowIndex;

                const current = index === workflowIndex;

                return (
                  <div
                    key={step.key}
                    className={`workflow-step ${
                      completed ? "workflow-step-completed" : ""
                    } ${current ? "workflow-step-current" : ""}`}
                  >
                    <div className="workflow-node">
                      {completed ? "✓" : index + 1}
                    </div>

                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Report information */}
        <section className="report-section-card">
          <div className="report-section-header">
            <div>
              <span className="report-section-kicker">SECTION 01</span>

              <h3>Report Information</h3>

              <p>Identification and audit information for this report.</p>
            </div>
          </div>

          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span>Report Number</span>
              <strong>{report.reportNumber}</strong>
            </div>

            <div className="detail-info-item">
              <span>Test Date</span>
              <strong>{formatDate(report.testDate)}</strong>
            </div>

            <div className="detail-info-item">
              <span>Workflow Status</span>
              <strong>{formatStatus(report.status)}</strong>
            </div>

            <div className="detail-info-item">
              <span>Overall Result</span>
              <strong
                className={
                  resultIsFail
                    ? "text-danger"
                    : resultIsPass
                      ? "text-success"
                      : ""
                }
              >
                {formatResult(report.overallResult)}
              </strong>
            </div>

            <div className="detail-info-item">
              <span>Created</span>
              <strong>{formatDateTime(report.createdAt)}</strong>
            </div>

            <div className="detail-info-item">
              <span>Last Updated</span>
              <strong>{formatDateTime(report.updatedAt)}</strong>
            </div>

            <div className="detail-info-item">
              <span>Tested By</span>
              <strong>{report.testedBy?.name || "—"}</strong>
            </div>

            <div className="detail-info-item">
              <span>Tester Role</span>
              <strong>{report.testedBy?.role || "—"}</strong>
            </div>
          </div>
        </section>

        {/* Instrument */}
        <section className="report-section-card">
          <div className="report-section-header instrument-section-heading">
            <div>
              <span className="report-section-kicker">SECTION 02</span>

              <h3>Instrument Information</h3>

              <p>Instrument associated with this test report.</p>
            </div>

            <button
              type="button"
              className="report-outline-button"
              onClick={() => navigate(`/instruments/${report.instrument?._id}`)}
            >
              View Instrument →
            </button>
          </div>

          <div className="instrument-detail-layout">
            <div className="instrument-identity">
              <div className="instrument-large-icon">⚖</div>

              <div>
                <span>INSTRUMENT</span>

                <h3>{report.instrument?.instrumentName || "—"}</h3>

                <p>
                  {report.instrument?.instrumentType ||
                    "Non-Automatic Weighing Instrument"}
                </p>
              </div>
            </div>

            <div className="instrument-spec-grid">
              <div>
                <span>Model Number</span>
                <strong>{report.instrument?.modelNumber || "—"}</strong>
              </div>

              <div>
                <span>Serial Number</span>
                <strong>{report.instrument?.serialNumber || "—"}</strong>
              </div>

              <div>
                <span>Capacity</span>
                <strong>
                  {report.instrument?.capacity
                    ? `${report.instrument.capacity} ${
                        report.instrument.capacityUnit || ""
                      }`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Scale Interval</span>
                <strong>
                  {report.instrument?.scaleInterval
                    ? `${report.instrument.scaleInterval} ${
                        report.instrument.scaleIntervalUnit || ""
                      }`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Accuracy Class</span>
                <strong>
                  {report.instrument?.accuracyClass
                    ? `Class ${report.instrument.accuracyClass}`
                    : "—"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Laboratory */}
        <section className="report-section-card">
          <div className="report-section-header">
            <div>
              <span className="report-section-kicker">SECTION 03</span>

              <h3>Laboratory Information</h3>

              <p>Laboratory associated with this evaluation.</p>
            </div>
          </div>

          <div className="laboratory-card">
            <div className="laboratory-icon">L</div>

            <div className="laboratory-main">
              <span>LABORATORY</span>

              <strong>{report.lab?.name || "—"}</strong>

              <small>{report.lab?.code || "No code"}</small>
            </div>

            <div className="laboratory-details">
              <div>
                <span>City</span>
                <strong>{report.lab?.city || "—"}</strong>
              </div>

              <div>
                <span>State</span>
                <strong>{report.lab?.state || "—"}</strong>
              </div>
            </div>
          </div>

          <div className="environment-notice">
            <div className="environment-notice-icon">i</div>

            <div>
              <strong>Laboratory & Environmental Conditions</strong>

              <p>
                Environmental condition recording is part of the SIH
                requirements. The current report API does not expose dedicated
                environmental fields, so no values are being fabricated here.
              </p>
            </div>
          </div>
        </section>

        {/* Test workspace */}
        <section className="report-section-card workspace-section">
          <div className="workspace-header">
            <div>
              <span className="report-section-kicker">SECTION 04</span>

              <h3>OIML R76 Test Workspace</h3>

              <p>
                Enter observations and perform automatic compliance
                calculations.
              </p>
            </div>

            <div className="standard-badge">
              <span>STANDARD</span>
              <strong>OIML R76-1:2006</strong>
            </div>
          </div>

          <div className="workspace-card">
            <div className="workspace-icon">✓</div>

            <div className="workspace-copy">
              <h4>Continue instrument testing</h4>

              <p>
                Record OIML R76 observations, calculate permissible errors and
                evaluate compliance.
              </p>
            </div>

            <button
              type="button"
              className="report-primary-button"
              onClick={() => navigate(`/test-reports/${report._id}/tests`)}
            >
              Open Test Workspace →
            </button>
          </div>
        </section>

        {/* Compliance */}
        <section className="compliance-result-card">
          <div>
            <span>OVERALL COMPLIANCE RESULT</span>

            <strong
              className={
                resultIsFail
                  ? "compliance-fail"
                  : resultIsPass
                    ? "compliance-pass"
                    : "compliance-pending"
              }
            >
              {formatResult(report.overallResult)}
            </strong>
          </div>

          <div>
            <span>REPORT STATUS</span>

            <strong>{formatStatus(report.status)}</strong>
          </div>

          <div>
            <span>STANDARD</span>

            <strong>OIML R76-1:2006</strong>
          </div>
        </section>

        {/* Remarks */}
        <section className="report-section-card">
          <div className="report-section-header">
            <div>
              <span className="report-section-kicker">REMARKS</span>

              <h3>Test Report Remarks</h3>
            </div>
          </div>

          <div className="remarks-content">
            {report.remarks?.trim() ? (
              <p>{report.remarks}</p>
            ) : (
              <p className="remarks-empty">
                No remarks have been added to this report.
              </p>
            )}
          </div>
        </section>

        {/* Footer actions */}
        <div className="report-detail-actions">
          <button
            type="button"
            className="report-secondary-button"
            onClick={() => navigate("/test-reports")}
          >
            ← All Test Reports
          </button>

          <div>
            <button
              type="button"
              className="report-outline-button"
              onClick={() => navigate(`/instruments/${report.instrument?._id}`)}
            >
              View Instrument
            </button>

            <button
              type="button"
              className="report-primary-button"
              onClick={() => navigate(`/test-reports/${report._id}/tests`)}
            >
              Continue OIML Testing →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
