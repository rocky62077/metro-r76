import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getInstruments, type Instrument } from "../api/instruments";

export default function InstrumentDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [instrument, setInstrument] = useState<Instrument | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInstrument() {
      try {
        setLoading(true);
        setError("");

        const instruments = await getInstruments();

        const found = instruments.find((item) => item._id === id);

        if (!found) {
          setError("Instrument not found.");
          return;
        }

        setInstrument(found);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load instrument.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadInstrument();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="registry-loading">
          <div className="loading-spinner" />
          <span>Loading instrument details...</span>
        </div>
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div className="page">
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/instruments")}
        >
          ← Back to Instruments
        </button>

        <div className="alert-error">
          <strong>Unable to load instrument</strong>

          <span>{error || "Instrument not found."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="page-header">
        <div>
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/instruments")}
          >
            ← Back to Instrument Registry
          </button>

          <div className="eyebrow">INSTRUMENT PROFILE</div>

          <h1>{instrument.instrumentName}</h1>

          <p>
            Technical details and testing information for this registered
            instrument.
          </p>
        </div>

        <span
          className={`status-badge ${
            instrument.status?.toLowerCase() === "active"
              ? "status-active"
              : instrument.status?.toLowerCase().includes("testing")
                ? "status-testing"
                : instrument.status?.toLowerCase() === "approved"
                  ? "status-approved"
                  : "status-neutral"
          }`}
        >
          <i />
          {instrument.status || "Registered"}
        </span>
      </div>

      {/* =====================================================
          IDENTITY
          ===================================================== */}

      <section className="details-card">
        <div className="details-card-header">
          <div className="details-title">
            <div className="large-instrument-avatar">
              {instrument.instrumentName?.charAt(0).toUpperCase() || "I"}
            </div>

            <div>
              <h2>Instrument Identity</h2>

              <p>Basic identification information</p>
            </div>
          </div>
        </div>

        <div className="details-grid">
          <DetailItem
            label="Instrument Name"
            value={instrument.instrumentName}
          />

          <DetailItem
            label="Instrument Type"
            value={instrument.instrumentType}
          />

          <DetailItem
            label="Manufacturer"
            value={instrument.manufacturer?.name}
          />

          <DetailItem
            label="Manufacturer Code"
            value={instrument.manufacturer?.code}
          />

          <DetailItem label="Model Number" value={instrument.modelNumber} />

          <DetailItem label="Serial Number" value={instrument.serialNumber} />

          <DetailItem
            label="Year of Manufacture"
            value={instrument.yearOfManufacture?.toString()}
          />

          <DetailItem label="Application" value={instrument.application} />
        </div>
      </section>

      {/* =====================================================
          TECHNICAL SPECIFICATIONS
          ===================================================== */}

      <section className="details-card">
        <div className="details-card-header">
          <div>
            <h2>Technical Specifications</h2>

            <p>Metrological characteristics of the instrument.</p>
          </div>
        </div>

        <div className="details-grid">
          <DetailItem
            label="Maximum Capacity"
            value={
              instrument.capacity
                ? `${instrument.capacity} ${instrument.capacityUnit || ""}`
                : undefined
            }
          />

          <DetailItem
            label="Scale Interval"
            value={
              instrument.scaleInterval
                ? `${instrument.scaleInterval} ${
                    instrument.scaleIntervalUnit || ""
                  }`
                : undefined
            }
          />

          <DetailItem
            label="Accuracy Class"
            value={
              instrument.accuracyClass
                ? `Class ${instrument.accuracyClass}`
                : undefined
            }
          />

          <DetailItem
            label="Verification Scale Intervals"
            value={instrument.numberOfVerificationScaleIntervals?.toString()}
          />
        </div>
      </section>

      {/* =====================================================
          LABORATORY
          ===================================================== */}

      <section className="details-card">
        <div className="details-card-header">
          <div>
            <h2>Laboratory Information</h2>

            <p>Laboratory associated with this instrument.</p>
          </div>
        </div>

        <div className="details-grid">
          <DetailItem label="Laboratory" value={instrument.lab?.name} />

          <DetailItem label="Laboratory Code" value={instrument.lab?.code} />
        </div>
      </section>

      {/* =====================================================
          TEST HISTORY PLACEHOLDER
          ===================================================== */}

      <section className="details-card">
        <div className="details-card-header">
          <div>
            <h2>Test History</h2>

            <p>OIML R76 test reports associated with this instrument.</p>
          </div>
        </div>

        <div className="history-empty">
          <div className="empty-icon">▤</div>

          <h3>Test history</h3>

          <p>Test reports for this instrument will appear here.</p>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/test-reports")}
          >
            View Test Reports
          </button>
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>

      <strong>{value || "—"}</strong>
    </div>
  );
}
