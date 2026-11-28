import "./ResetPassword.css";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

type ResetResponse = {
  message?: string;
  error?: string;
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // The reset link carries the token in the query string:
  // /reset-password?token=...
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    let valid = true;
    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (!confirmPassword) {
      setConfirmError("Please enter your new password again.");
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmError("Passwords do not match.");
      valid = false;
    } else {
      setConfirmError("");
    }
    return valid;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = (await res.json().catch(() => ({}))) as ResetResponse;
      if (!res.ok) {
        setFormError(data.error ?? "Reset failed. Please try again.");
        return;
      }
      navigate("/login");
    } catch {
      setFormError("Can't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="reset-page">
      <div className="reset-logo">
        <h1>
          Van<span className="reset-logo-go">Go</span>
        </h1>
      </div>

      {!token ? (
        <div className="reset-form">
          <h2 className="reset-heading">This reset link doesn&apos;t look right</h2>
          <p className="reset-text">
            This page only works from the full link in a password reset email.
            If the link was cut off, or you opened this page directly, request
            a fresh link and try again.
          </p>
          <button
            className="reset-submit"
            type="button"
            onClick={() => navigate("/forgot-password")}
          >
            Request a new link
          </button>
          <div className="reset-back-row">
            <Link className="reset-back" to="/login">
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form className="reset-form" onSubmit={handleSubmit} noValidate>
          <h2 className="reset-heading">Set a new password</h2>
          <p className="reset-text">
            Pick a new password for your account - at least 8 characters.
          </p>

          {formError && (
            <p className="reset-form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="reset-field">
            <div className="reset-password-wrap">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-label="New password"
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className="reset-password-toggle"
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlashIcon size={22} /> : <EyeIcon size={22} />}
              </button>
            </div>
            {passwordError && <p className="reset-field-error">{passwordError}</p>}
          </div>

          <div className="reset-field">
            <input
              id="reset-confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-label="Confirm new password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {confirmError && <p className="reset-field-error">{confirmError}</p>}
          </div>

          <button className="reset-submit" type="submit" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset password"}
          </button>

          <div className="reset-back-row">
            <Link className="reset-back" to="/login">
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
