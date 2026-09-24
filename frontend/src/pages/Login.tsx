import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(email.trim(), password);

      if (!response.success || !response.data?.token) {
        throw new Error(response.message || "Unable to sign in.");
      }

      localStorage.setItem("metro_r76_token", response.data.token);

      localStorage.setItem(
        "metro_r76_user",
        JSON.stringify(response.data.user),
      );

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-background-grid" />

      <div className="login-container">
        {/* LEFT BRAND PANEL */}
        <section className="login-brand-panel">
          <div className="login-brand-top">
            <div className="metro-logo">
              <div className="metro-logo-mark">M</div>

              <div>
                <div className="metro-logo-title">METRO-R76</div>

                <div className="metro-logo-subtitle">LEGAL METROLOGY</div>
              </div>
            </div>

            <div className="standard-badge">OIML R76</div>
          </div>

          <div className="login-brand-content">
            <div className="brand-kicker">
              NON-AUTOMATIC WEIGHING INSTRUMENTS
            </div>

            <h1>
              Precision.
              <br />
              Compliance.
              <br />
              <span>Confidence.</span>
            </h1>

            <p>
              A centralized laboratory platform for instrument registration,
              OIML R76 testing, observations, calculations and test report
              management.
            </p>

            <div className="brand-features">
              <div className="brand-feature">
                <div className="feature-icon">01</div>

                <div>
                  <strong>Instrument Registry</strong>
                  <span>
                    Manage registered weighing instruments and technical
                    specifications.
                  </span>
                </div>
              </div>

              <div className="brand-feature">
                <div className="feature-icon">02</div>

                <div>
                  <strong>OIML R76 Testing</strong>
                  <span>
                    Perform structured metrology tests with calculation support.
                  </span>
                </div>
              </div>

              <div className="brand-feature">
                <div className="feature-icon">03</div>

                <div>
                  <strong>Test Reports</strong>
                  <span>
                    Record observations and manage laboratory test reports.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="login-brand-footer">
            <span>METRO-R76</span>
            <span>•</span>
            <span>LEGAL METROLOGY LABORATORY SYSTEM</span>
          </div>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="login-form-panel">
          <div className="login-card">
            <div className="login-card-header">
              <div className="portal-label">LABORATORY PORTAL</div>

              <h2>Welcome back</h2>

              <p>Sign in to continue to the METRO-R76 testing system.</p>
            </div>

            {error && (
              <div className="login-error">
                <div className="login-error-icon">!</div>

                <div>{error}</div>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">Email address</label>

                <div className="login-input-wrapper">
                  <span className="input-icon">@</span>

                  <input
                    id="email"
                    type="email"
                    placeholder="name@laboratory.gov.in"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="password-label-row">
                  <label htmlFor="password">Password</label>
                </div>

                <div className="login-input-wrapper">
                  <span className="input-icon">•••</span>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="login-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span />
              <small>AUTHORIZED ACCESS</small>
              <span />
            </div>

            <div className="login-register">
              <span>New to METRO-R76?</span>

              <Link to="/register">
                Create an account
                <span>→</span>
              </Link>
            </div>

            <div className="login-security">
              <span className="security-lock">✓</span>

              <span>Secure authenticated laboratory access</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
