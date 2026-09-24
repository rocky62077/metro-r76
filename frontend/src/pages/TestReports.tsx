import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createTestReport,
  getTestReports,
  type TestReport,
} from "../api/testReports";

import { getInstruments, type Instrument } from "../api/instruments";

import { getLaboratories, type Laboratory } from "../api/catalog";

const emptyForm = {
  reportNumber: "",
  instrument: "",
  lab: "",
  testDate: new Date().toISOString().slice(0, 10),
  remarks: "",
};

function formatDate(value: string) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

export default function TestReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState<TestReport[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [resultFilter, setResultFilter] = useState("All");

  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [reportData, instrumentData, laboratoryData] = await Promise.all([
        getTestReports(),
        getInstruments(),
        getLaboratories(),
      ]);

      setReports(reportData);
      setInstruments(instrumentData);
      setLaboratories(laboratoryData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load test reports.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateForm() {
    setError("");
    setSuccess("");

    setForm({
      ...emptyForm,
      testDate: new Date().toISOString().slice(0, 10),
    });

    setShowForm(true);
  }

  function closeCreateForm() {
    if (saving) return;
    setShowForm(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.reportNumber.trim()) {
      setError("Report number is required.");
      return;
    }

    if (!form.instrument) {
      setError("Please select an instrument.");
      return;
    }

    if (!form.lab) {
      setError("Please select a laboratory.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const report = await createTestReport({
        reportNumber: form.reportNumber.trim(),
        instrument: form.instrument,
        lab: form.lab,
        testDate: form.testDate,
        remarks: form.remarks.trim() || undefined,
      });

      setShowForm(false);

      setForm({
        ...emptyForm,
        testDate: new Date().toISOString().slice(0, 10),
      });

      setSuccess(`Report ${report.reportNumber} created successfully.`);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create test report.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openReport(reportId: string) {
    if (!reportId) {
      setError("This report does not have a valid database ID.");
      return;
    }

    navigate(`/test-reports/${reportId}`);
  }

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        report.reportNumber.toLowerCase().includes(query) ||
        report.instrument?.instrumentName?.toLowerCase().includes(query) ||
        report.instrument?.modelNumber?.toLowerCase().includes(query) ||
        report.instrument?.serialNumber?.toLowerCase().includes(query) ||
        report.lab?.name?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || report.status === statusFilter;

      const matchesResult =
        resultFilter === "All" || report.overallResult === resultFilter;

      return matchesSearch && matchesStatus && matchesResult;
    });
  }, [reports, search, statusFilter, resultFilter]);

  const summary = useMemo(
    () => ({
      total: reports.length,

      pending: reports.filter((report) => report.overallResult === "pending")
        .length,

      passed: reports.filter((report) => report.overallResult === "pass")
        .length,

      failed: reports.filter((report) => report.overallResult === "fail")
        .length,

      inProgress: reports.filter((report) => report.status === "in_progress")
        .length,

      completed: reports.filter((report) => report.status === "completed")
        .length,
    }),
    [reports],
  );

  return (
    <main className="main-content test-reports-page">
      <header className="topbar reports-topbar">
        <div>
          <div className="page-kicker">METRO R76 / TESTING</div>

          <h1>Test Reports</h1>

          <p>
            Manage OIML R76 testing, observations, compliance and report
            history.
          </p>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          System Online
        </div>
      </header>

      <section className="dashboard-content reports-content">
        <div className="reports-hero">
          <div>
            <span className="reports-hero-label">TEST REPORT REGISTRY</span>

            <h2>Laboratory Test Reports</h2>

            <p>
              Create and manage digital test records for non-automatic weighing
              instruments.
            </p>
          </div>

          <button
            type="button"
            className="reports-create-button"
            onClick={openCreateForm}
          >
            <span>+</span>
            New Test Report
          </button>
        </div>

        {error && (
          <div className="reports-alert reports-alert-error">
            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button type="button" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="reports-alert reports-alert-success">
            <div>
              <strong>Report created</strong>
              <p>{success}</p>
            </div>

            <button type="button" onClick={() => setSuccess("")}>
              ×
            </button>
          </div>
        )}

        <section className="report-stat-grid">
          <div className="report-stat-card">
            <div className="report-stat-icon">#</div>

            <div>
              <span>Total Reports</span>
              <strong>{summary.total}</strong>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon">◷</div>

            <div>
              <span>Pending</span>
              <strong>{summary.pending}</strong>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon">✓</div>

            <div>
              <span>Passed</span>
              <strong>{summary.passed}</strong>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon">!</div>

            <div>
              <span>Failed</span>
              <strong>{summary.failed}</strong>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon">→</div>

            <div>
              <span>In Progress</span>
              <strong>{summary.inProgress}</strong>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon">◆</div>

            <div>
              <span>Completed</span>
              <strong>{summary.completed}</strong>
            </div>
          </div>
        </section>

        <section className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <h3>Report Repository</h3>

              <p>
                {filteredReports.length} of {reports.length} reports
              </p>
            </div>

            <div className="repository-standard">
              <span>STANDARD</span>
              <strong>OIML R76</strong>
            </div>
          </div>

          <div className="reports-filter-bar">
            <div className="reports-search">
              <span>⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports, instruments, model or serial..."
              />

              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All statuses</option>

              <option value="draft">Draft</option>

              <option value="in_progress">In Progress</option>

              <option value="submitted">Submitted</option>

              <option value="under_review">Under Review</option>

              <option value="approved">Approved</option>

              <option value="rejected">Rejected</option>

              <option value="completed">Completed</option>
            </select>

            <select
              value={resultFilter}
              onChange={(event) => setResultFilter(event.target.value)}
            >
              <option value="All">All results</option>

              <option value="pending">Pending</option>

              <option value="pass">Pass</option>

              <option value="fail">Fail</option>
            </select>
          </div>

          {loading ? (
            <div className="reports-loading">
              <div className="reports-spinner" />

              <strong>Loading test reports</strong>

              <span>Fetching records from the laboratory system...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="reports-empty">
              <div className="reports-empty-icon">◌</div>

              <h3>No test reports found</h3>

              <p>
                {reports.length === 0
                  ? "Create your first test report to start the OIML R76 testing workflow."
                  : "Try changing the search or filter criteria."}
              </p>

              {reports.length === 0 && (
                <button
                  type="button"
                  className="reports-create-button"
                  onClick={openCreateForm}
                >
                  <span>+</span>
                  Create First Report
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>REPORT</th>
                      <th>INSTRUMENT</th>
                      <th>MODEL / SERIAL</th>
                      <th>LABORATORY</th>
                      <th>TEST DATE</th>
                      <th>STATUS</th>
                      <th>RESULT</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map((report) => (
                      <tr
                        key={report._id}
                        className="report-row"
                        onClick={() => openReport(report._id)}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openReport(report._id);
                          }
                        }}
                      >
                        <td>
                          <div className="report-id-cell">
                            <strong>{report.reportNumber}</strong>

                            <span>OIML R76</span>
                          </div>
                        </td>

                        <td>
                          <div className="report-main-cell">
                            <strong>
                              {report.instrument?.instrumentName || "—"}
                            </strong>

                            <span>
                              {report.instrument?.accuracyClass
                                ? `Accuracy Class ${report.instrument.accuracyClass}`
                                : "Non-Automatic Weighing Instrument"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="report-main-cell">
                            <strong>
                              {report.instrument?.modelNumber || "—"}
                            </strong>

                            <span>
                              SN: {report.instrument?.serialNumber || "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="report-main-cell">
                            <strong>{report.lab?.name || "—"}</strong>

                            <span>{report.lab?.code || ""}</span>
                          </div>
                        </td>

                        <td>
                          <span className="report-date">
                            {formatDate(report.testDate)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`report-status-badge report-status-${report.status}`}
                          >
                            {formatStatus(report.status)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`report-result-badge report-result-${report.overallResult}`}
                          >
                            <i />
                            {formatResult(report.overallResult)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="reports-mobile-list">
                {filteredReports.map((report) => (
                  <article
                    key={report._id}
                    className="mobile-report-card"
                    onClick={() => openReport(report._id)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        openReport(report._id);
                      }
                    }}
                  >
                    <div className="mobile-report-top">
                      <div>
                        <span>REPORT</span>

                        <strong>{report.reportNumber}</strong>
                      </div>

                      <span
                        className={`report-result-badge report-result-${report.overallResult}`}
                      >
                        <i />
                        {formatResult(report.overallResult)}
                      </span>
                    </div>

                    <div className="mobile-report-instrument">
                      <strong>
                        {report.instrument?.instrumentName || "—"}
                      </strong>

                      <span>
                        {report.instrument?.modelNumber} · SN{" "}
                        {report.instrument?.serialNumber}
                      </span>
                    </div>

                    <div className="mobile-report-grid">
                      <div>
                        <span>Laboratory</span>

                        <strong>{report.lab?.name || "—"}</strong>
                      </div>

                      <div>
                        <span>Test Date</span>

                        <strong>{formatDate(report.testDate)}</strong>
                      </div>
                    </div>

                    <div className="mobile-report-bottom">
                      <span
                        className={`report-status-badge report-status-${report.status}`}
                      >
                        {formatStatus(report.status)}
                      </span>

                      <span className="mobile-open-arrow">View →</span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </section>

      {showForm && (
        <div
          className="reports-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateForm();
            }
          }}
        >
          <div className="reports-modal">
            <div className="reports-modal-header">
              <div>
                <span>NEW TEST RECORD</span>

                <h2>Create Test Report</h2>

                <p>Start a new OIML R76 testing record.</p>
              </div>

              <button
                type="button"
                onClick={closeCreateForm}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="reports-form">
              <div className="reports-form-section">
                <div className="reports-form-number">01</div>

                <div className="reports-form-content">
                  <div className="reports-form-heading">
                    <h3>Report information</h3>

                    <p>Basic identification for the test record.</p>
                  </div>

                  <div className="reports-form-grid">
                    <label>
                      <span>
                        Report Number <b>*</b>
                      </span>

                      <input
                        type="text"
                        value={form.reportNumber}
                        onChange={(event) =>
                          updateField("reportNumber", event.target.value)
                        }
                        placeholder="CLMTL-2026-0001"
                        required
                      />
                    </label>

                    <label>
                      <span>
                        Test Date <b>*</b>
                      </span>

                      <input
                        type="date"
                        value={form.testDate}
                        onChange={(event) =>
                          updateField("testDate", event.target.value)
                        }
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="reports-form-section">
                <div className="reports-form-number">02</div>

                <div className="reports-form-content">
                  <div className="reports-form-heading">
                    <h3>Instrument & laboratory</h3>

                    <p>Select the instrument and testing laboratory.</p>
                  </div>

                  <div className="reports-form-grid reports-form-grid-single">
                    <label>
                      <span>
                        Instrument <b>*</b>
                      </span>

                      <select
                        value={form.instrument}
                        onChange={(event) =>
                          updateField("instrument", event.target.value)
                        }
                        required
                      >
                        <option value="">Select instrument</option>

                        {instruments.map((instrument) => (
                          <option key={instrument._id} value={instrument._id}>
                            {instrument.instrumentName} —{" "}
                            {instrument.modelNumber} / SN{" "}
                            {instrument.serialNumber}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>
                        Laboratory <b>*</b>
                      </span>

                      <select
                        value={form.lab}
                        onChange={(event) =>
                          updateField("lab", event.target.value)
                        }
                        required
                      >
                        <option value="">Select laboratory</option>

                        {laboratories.map((laboratory) => (
                          <option key={laboratory._id} value={laboratory._id}>
                            {laboratory.name} — {laboratory.code}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div className="reports-form-section">
                <div className="reports-form-number">03</div>

                <div className="reports-form-content">
                  <div className="reports-form-heading">
                    <h3>Initial remarks</h3>

                    <p>Optional notes for the testing record.</p>
                  </div>

                  <label>
                    <span>Remarks</span>

                    <textarea
                      value={form.remarks}
                      onChange={(event) =>
                        updateField("remarks", event.target.value)
                      }
                      placeholder="Enter initial testing notes..."
                      rows={4}
                    />
                  </label>
                </div>
              </div>

              <div className="reports-form-footer">
                <span>* Required fields</span>

                <div>
                  <button
                    type="button"
                    className="reports-cancel-button"
                    onClick={closeCreateForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="reports-submit-button"
                    disabled={saving}
                  >
                    {saving ? "Creating..." : "Create Test Report"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
