import "./ForgotPassword.css";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

type ForgotResponse = {
  message?: string;
  error?: string;
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as ForgotResponse;
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      // The API answers the same way whether or not the email is
      // registered, so this screen never reveals which emails have
      // accounts.
      setSent(true);
    } catch {
      setFormError("Can't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="forgot-page">
      <div className="forgot-logo">
        <h1>
          Van<span className="forgot-logo-go">Go</span>
        </h1>
      </div>

      {sent ? (
        <div className="forgot-form">
          <h2 className="forgot-heading">Check your email</h2>
          <p className="forgot-text">
            If an account with that email exists, a password reset link is on
            its way. The link works for 30 minutes.
          </p>
          <button
            className="forgot-submit"
            type="button"
            onClick={() => navigate("/login")}
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form className="forgot-form" onSubmit={handleSubmit} noValidate>
          <h2 className="forgot-heading">Forgot your password?</h2>
          <p className="forgot-text">
            Enter the email you signed up with and we&apos;ll send you a link
            to reset your password.
          </p>

          {formError && (
            <p className="forgot-form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="forgot-field">
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              aria-label="Email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError && <p className="forgot-field-error">{emailError}</p>}
          </div>

          <button className="forgot-submit" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset link"}
          </button>

          <div className="forgot-back-row">
            <Link className="forgot-back" to="/login">
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
