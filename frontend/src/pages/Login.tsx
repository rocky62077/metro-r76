import { useEffect, useState } from "react";

import {
  createInstrument,
  getInstruments,
  type CreateInstrumentInput,
  type Instrument,
} from "../api/instruments";

const emptyForm: CreateInstrumentInput = {
  instrumentName: "",
  instrumentType: "Non-Automatic Weighing Instrument",
  manufacturer: "",
  modelNumber: "",
  serialNumber: "",
  capacity: 0,
  capacityUnit: "kg",
  scaleInterval: 0,
  scaleIntervalUnit: "kg",
  accuracyClass: "III",
  numberOfVerificationScaleIntervals: undefined,
  lab: "",
  yearOfManufacture: undefined,
  application: "",
};

export default function Instruments() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateInstrumentInput>(emptyForm);

  async function loadInstruments() {
    try {
      setLoading(true);
      setError("");

      const data = await getInstruments();

      setInstruments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load instruments.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInstruments();
  }, []);

  function updateField(field: keyof CreateInstrumentInput, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setForm(emptyForm);
    setFormError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");

    if (
      !form.instrumentName.trim() ||
      !form.modelNumber.trim() ||
      !form.serialNumber.trim() ||
      !form.manufacturer.trim() ||
      !form.lab.trim()
    ) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (form.capacity <= 0) {
      setFormError("Capacity must be greater than zero.");
      return;
    }

    if (form.scaleInterval <= 0) {
      setFormError("Scale interval must be greater than zero.");
      return;
    }

    try {
      setSaving(true);

      await createInstrument({
        ...form,
        instrumentName: form.instrumentName.trim(),
        modelNumber: form.modelNumber.trim(),
        serialNumber: form.serialNumber.trim(),
      });

      closeForm();

      await loadInstruments();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to create instrument.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Instruments</h1>
          <p>Registered non-automatic weighing instruments</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setForm(emptyForm);
            setFormError("");
            setShowForm(true);
          }}
        >
          + Add Instrument
        </button>
      </div>

      {showForm && (
        <section className="panel form-panel">
          <div className="panel-header">
            <div>
              <h2>Add Instrument</h2>
              <p>Register an instrument for OIML R76 testing.</p>
            </div>

            <button
              className="secondary-button"
              onClick={closeForm}
              type="button"
            >
              Cancel
            </button>
          </div>

          {formError && <div className="form-error">{formError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Instrument Name *</label>
                <input
                  value={form.instrumentName}
                  onChange={(event) =>
                    updateField("instrumentName", event.target.value)
                  }
                  placeholder="Electronic Platform Weighing Scale"
                />
              </div>

              <div className="form-field">
                <label>Instrument Type *</label>
                <input
                  value={form.instrumentType}
                  onChange={(event) =>
                    updateField("instrumentType", event.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Manufacturer ID *</label>
                <input
                  value={form.manufacturer}
                  onChange={(event) =>
                    updateField("manufacturer", event.target.value)
                  }
                  placeholder="MongoDB manufacturer ID"
                />
              </div>

              <div className="form-field">
                <label>Laboratory ID *</label>
                <input
                  value={form.lab}
                  onChange={(event) => updateField("lab", event.target.value)}
                  placeholder="MongoDB laboratory ID"
                />
              </div>

              <div className="form-field">
                <label>Model Number *</label>
                <input
                  value={form.modelNumber}
                  onChange={(event) =>
                    updateField("modelNumber", event.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Serial Number *</label>
                <input
                  value={form.serialNumber}
                  onChange={(event) =>
                    updateField("serialNumber", event.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Capacity *</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.capacity === 0 ? "" : form.capacity}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      capacity: Number(event.target.value),
                    }))
                  }
                  placeholder="1000"
                />
              </div>

              <div className="form-field">
                <label>Capacity Unit *</label>
                <select
                  value={form.capacityUnit}
                  onChange={(event) =>
                    updateField("capacityUnit", event.target.value)
                  }
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="t">t</option>
                </select>
              </div>

              <div className="form-field">
                <label>Scale Interval (e) *</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.scaleInterval === 0 ? "" : form.scaleInterval}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      scaleInterval: Number(event.target.value),
                    }))
                  }
                  placeholder="0.5"
                />
              </div>

              <div className="form-field">
                <label>Scale Interval Unit *</label>
                <select
                  value={form.scaleIntervalUnit}
                  onChange={(event) =>
                    updateField("scaleIntervalUnit", event.target.value)
                  }
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="t">t</option>
                </select>
              </div>

              <div className="form-field">
                <label>Accuracy Class</label>
                <select
                  value={form.accuracyClass}
                  onChange={(event) =>
                    updateField("accuracyClass", event.target.value)
                  }
                >
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IIII">IIII</option>
                </select>
              </div>

              <div className="form-field">
                <label>Verification Scale Intervals</label>
                <input
                  type="number"
                  min="0"
                  value={form.numberOfVerificationScaleIntervals ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      numberOfVerificationScaleIntervals: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>

              <div className="form-field">
                <label>Year of Manufacture</label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={form.yearOfManufacture ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      yearOfManufacture: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>

              <div className="form-field form-field-wide">
                <label>Application</label>
                <input
                  value={form.application ?? ""}
                  onChange={(event) =>
                    updateField("application", event.target.value)
                  }
                  placeholder="Trade, industrial, commercial..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Register Instrument"}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading && (
        <section className="panel">
          <div className="empty-state">
            <div className="empty-icon">◌</div>
            <h3>Loading instruments...</h3>
            <p>Fetching registered instruments from the laboratory system.</p>
          </div>
        </section>
      )}

      {error && !loading && (
        <section className="panel">
          <div className="empty-state">
            <div className="empty-icon">!</div>
            <h3>Unable to load instruments</h3>
            <p>{error}</p>

            <button className="primary-button" onClick={loadInstruments}>
              Try Again
            </button>
          </div>
        </section>
      )}

      {!loading && !error && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Instrument Registry</h2>
              <p>
                {instruments.length} registered instrument
                {instruments.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Model</th>
                  <th>Serial Number</th>
                  <th>Capacity</th>
                  <th>Scale Interval</th>
                  <th>Class</th>
                  <th>Manufacturer</th>
                  <th>Laboratory</th>
                </tr>
              </thead>

              <tbody>
                {instruments.map((instrument) => (
                  <tr key={instrument._id}>
                    <td>
                      <strong>{instrument.instrumentName}</strong>

                      <small>{instrument.instrumentType}</small>
                    </td>

                    <td>{instrument.modelNumber}</td>

                    <td className="report-number">{instrument.serialNumber}</td>

                    <td>
                      {instrument.capacity} {instrument.capacityUnit}
                    </td>

                    <td>
                      {instrument.scaleInterval} {instrument.scaleIntervalUnit}
                    </td>

                    <td>{instrument.accuracyClass || "—"}</td>

                    <td>{instrument.manufacturer?.name || "—"}</td>

                    <td>{instrument.lab?.name || "—"}</td>
                  </tr>
                ))}

                {instruments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-table">
                      No instruments registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
