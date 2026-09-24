import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await register(name, email, password);

      localStorage.setItem("metro_r76_token", response.data.token);

      localStorage.setItem(
        "metro_r76_user",
        JSON.stringify(response.data.user),
      );

      navigate("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        {/* LEFT PANEL */}

        <section className="register-info">
          <div>
            <div className="register-brand">
              <div className="register-logo">M</div>

              <div>
                <div className="register-brand-name">METRO-R76</div>

                <div className="register-brand-subtitle">
                  Legal Metrology Testing System
                </div>
              </div>
            </div>

            <div className="register-info-main">
              <div className="register-oiml">OIML R76</div>

              <h2>
                Create your
                <br />
                testing account
              </h2>

              <p>
                Register to manage weighing instruments, OIML R76 tests,
                observations and compliance reports.
              </p>
            </div>

            <div className="register-feature-list">
              <div className="register-feature">
                <span>✓</span>
                <div>
                  <strong>Instrument Management</strong>
                  <small>Register and manage weighing instruments.</small>
                </div>
              </div>

              <div className="register-feature">
                <span>✓</span>
                <div>
                  <strong>Testing Workflow</strong>
                  <small>Perform and record OIML R76 tests.</small>
                </div>
              </div>

              <div className="register-feature">
                <span>✓</span>
                <div>
                  <strong>Compliance Records</strong>
                  <small>Maintain complete test history.</small>
                </div>
              </div>
            </div>
          </div>

          <div className="register-info-footer">
            METRO-R76 • OIML R76 • Legal Metrology
          </div>
        </section>

        {/* FORM PANEL */}

        <section className="register-form-side">
          <div className="register-form-container">
            <div className="register-mobile-brand">
              <div className="register-logo-small">M</div>

              <div>
                <strong>METRO-R76</strong>
                <span>Legal Metrology</span>
              </div>
            </div>

            <div className="register-heading">
              <div className="register-welcome">New user</div>

              <h1>Create an account</h1>

              <p>Enter your details to create your METRO-R76 account.</p>
            </div>

            {error && (
              <div className="register-error" role="alert">
                <span>!</span>
                <div>{error}</div>
              </div>
            )}

            <form className="register-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="register-name">Full name</label>

                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  disabled={loading}
                  minLength={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email">Email address</label>

                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password">Password</label>

                <div className="register-password-wrapper">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    minLength={8}
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-confirm">Confirm password</label>

                <div className="register-password-wrapper">
                  <input
                    id="register-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    minLength={8}
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    disabled={loading}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="register-login-link">
              <span>Already have an account?</span>

              <Link to="/login">Sign in</Link>
            </div>

            <div className="register-status">
              <span className="status-dot" />
              <span>METRO-R76 System Online</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
