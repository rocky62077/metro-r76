import { useEffect, useState } from "react";
import { getDashboard, type DashboardData } from "../api/dashboard";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboard();
        setDashboard(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const overview = dashboard?.overview;

  const getInstrumentStatusCount = (status: string) => {
    return (
      dashboard?.instrumentStatus.find(
        (item) => item._id?.toLowerCase() === status.toLowerCase(),
      )?.count ?? 0
    );
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>OIML R76 Testing & Compliance Overview</p>
          </div>
        </div>

        <div className="empty-state">
          <h3>Loading dashboard...</h3>
          <p>Fetching the latest laboratory testing data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div
          className="page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>Dashboard</h1>
            <p>OIML R76 Testing & Compliance Overview</p>
          </div>

          {/* THIS IS THE NEW BUTTON */}
          <Link
            to="/test-reports/new"
            style={{
              padding: "10px 20px",
              background: "#0056b3",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            + New Test Report
          </Link>
        </div>

        <section className="panel">
          <div className="empty-state">
            <h3>Unable to load dashboard</h3>
            <p>{error}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>OIML R76 Testing & Compliance Overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Instruments</span>
          <strong>{overview?.totalInstruments ?? 0}</strong>
          <span className="stat-detail">Registered instruments</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Test Reports</span>
          <strong>{overview?.totalReports ?? 0}</strong>
          <span className="stat-detail">Total reports</span>
        </div>

        <div className="stat-card success">
          <span className="stat-label">Passed</span>
          <strong>{overview?.passedReports ?? 0}</strong>
          <span className="stat-detail">Compliant reports</span>
        </div>

        <div className="stat-card danger">
          <span className="stat-label">Failed</span>
          <strong>{overview?.failedReports ?? 0}</strong>
          <span className="stat-detail">Requires attention</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Report Workflow</h2>
              <p>Current status of test reports</p>
            </div>
          </div>

          <div className="workflow-list">
            <div className="workflow-row">
              <span>Draft</span>
              <strong>{dashboard?.workflow.draft ?? 0}</strong>
            </div>

            <div className="workflow-row">
              <span>Submitted</span>
              <strong>{dashboard?.workflow.submitted ?? 0}</strong>
            </div>

            <div className="workflow-row">
              <span>Under Review</span>
              <strong>{dashboard?.workflow.underReview ?? 0}</strong>
            </div>

            <div className="workflow-row">
              <span>Approved</span>
              <strong>{dashboard?.workflow.approved ?? 0}</strong>
            </div>

            <div className="workflow-row">
              <span>Completed</span>
              <strong>{dashboard?.workflow.completed ?? 0}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Instrument Status</h2>
              <p>Current instrument status</p>
            </div>
          </div>

          <div className="status-list">
            <div className="status-row">
              <span>Active</span>
              <strong>{getInstrumentStatusCount("active")}</strong>
            </div>

            <div className="status-row">
              <span>Under Testing</span>
              <strong>{getInstrumentStatusCount("under_testing")}</strong>
            </div>

            <div className="status-row">
              <span>Approved</span>
              <strong>{getInstrumentStatusCount("approved")}</strong>
            </div>

            <div className="status-row">
              <span>Rejected</span>
              <strong>{getInstrumentStatusCount("rejected")}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Recent Test Reports</h2>
            <p>Latest OIML R76 testing activity</p>
          </div>
        </div>

        {dashboard?.recentReports?.length ? (
          <div className="report-list">
            {dashboard.recentReports.map((report) => (
              <div className="workflow-row" key={report._id}>
                <div>
                  <strong>{report.reportNumber}</strong>
                  <div className="stat-detail">
                    {report.instrument?.instrumentName ?? "Instrument"} ·{" "}
                    {report.instrument?.serialNumber ?? "No serial"}
                  </div>
                </div>

                <div>
                  <strong>
                    {report.overallResult?.toUpperCase() ?? "PENDING"}
                  </strong>
                  <div className="stat-detail">
                    {report.status?.replace(/_/g, " ") ?? "Unknown status"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">▤</div>

            <h3>No test reports yet</h3>

            <p>Test reports will appear here when testing activity begins.</p>
          </div>
        )}
      </section>
    </div>
  );
}
