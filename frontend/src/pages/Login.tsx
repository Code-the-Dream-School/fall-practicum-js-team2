import "./Login.css";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/common/PageHeader";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "vango_token";

type LoginResponse = {
  token?: string;
  error?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [googleNotice, setGoogleNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    let valid = true;
    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }
    return valid;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json().catch(() => ({}))) as LoginResponse;
      if (!res.ok || !data.token) {
        setFormError(data.error ?? "Login failed. Please try again.");
        return;
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      navigate("/home");
    } catch {
      setFormError("Can't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-header-logo">
        <h2>VanGo</h2>
      </div>
      <PageHeader title="Welcome back" subtitle="Get Outside. Get Creative." />

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className="login-form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="login-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {emailError && <p className="login-field-error">{emailError}</p>}
        </div>

        <div className="login-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {passwordError && <p className="login-field-error">{passwordError}</p>}
        </div>

        <button className="login-submit" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button
          className="login-google"
          type="button"
          onClick={() => setGoogleNotice(true)}
        >
          Continue with Google
        </button>
        {googleNotice && (
          <p className="login-google-note">
            Google sign-in is coming soon - please use your email for now.
          </p>
        )}
      </form>

      <p className="login-signup-note">
        New to VanGo? Sign-up arrives with the onboarding flow.
      </p>
    </div>
  );
}
