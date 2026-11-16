import "./Login.css";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [googleNotice, setGoogleNotice] = useState(false);
  const [forgotNotice, setForgotNotice] = useState(false);
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
      <div className="login-logo">
        <h1>
          Van<span className="login-logo-go">Go</span>
        </h1>
      </div>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className="login-form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="login-field">
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-label="Username or Email"
            placeholder="Username or Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {emailError && <p className="login-field-error">{emailError}</p>}
        </div>

        <div className="login-field">
          <div className="login-password-wrap">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-label="Password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="login-password-toggle"
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeSlashIcon size={22} /> : <EyeIcon size={22} />}
            </button>
          </div>
          {passwordError && <p className="login-field-error">{passwordError}</p>}
        </div>

        <button className="login-submit" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <button
          className="login-signup"
          type="button"
          onClick={() => navigate("/register")}
        >
          Sign up
        </button>

        <div className="login-forgot-row">
          <a
            className="login-forgot"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              setForgotNotice(true);
            }}
          >
            Forgot Username or Password?
          </a>
        </div>
        {forgotNotice && (
          <p className="login-note">
            Password reset is not available yet - it arrives with a follow-up
            ticket.
          </p>
        )}

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

        <div className="login-guest-footer">
          <p className="login-guest-question">Don&apos;t have an account?</p>
          <button
            className="login-guest"
            type="button"
            onClick={() => navigate("/home")}
          >
            Continue as <span className="login-guest-word">Guest</span>
          </button>
        </div>
      </form>
    </div>
  );
}
