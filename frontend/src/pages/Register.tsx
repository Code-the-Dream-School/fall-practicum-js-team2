import "./Register.css";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "vango_token";

type RegisterResponse = {
  token?: string;
  error?: string;
};

// Official multicolor Google "G" mark, drawn inline so the button
// matches the real Google sign-in button. Same mark as the Login page.
function GoogleIcon() {
  return (
    <svg
      className="register-google-icon"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [googleNotice, setGoogleNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    let valid = true;
    if (!name.trim()) {
      setNameError("Name is required.");
      valid = false;
    } else if (name.trim().length > 30) {
      setNameError("Name must be 30 characters or fewer.");
      valid = false;
    } else {
      setNameError("");
    }
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
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
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
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as RegisterResponse;
      if (!res.ok || !data.token) {
        setFormError(data.error ?? "Registration failed. Please try again.");
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
    <div className="register-page">
      <div className="register-logo">
        <h1>
          Van<span className="register-logo-go">Go</span>
        </h1>
      </div>

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className="register-form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="register-field">
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            aria-label="Name"
            placeholder="Name"
            maxLength={30}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {nameError && <p className="register-field-error">{nameError}</p>}
        </div>

        <div className="register-field">
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-label="Email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {emailError && <p className="register-field-error">{emailError}</p>}
        </div>

        <div className="register-field">
          <div className="register-password-wrap">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-label="Password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="register-password-toggle"
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeSlashIcon size={22} /> : <EyeIcon size={22} />}
            </button>
          </div>
          {passwordError && (
            <p className="register-field-error">{passwordError}</p>
          )}
        </div>

        <button className="register-submit" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>

        <div className="register-divider">
          <span>- Or -</span>
        </div>

        <button
          className="register-google"
          type="button"
          onClick={() => setGoogleNotice(true)}
        >
          <GoogleIcon />
          Sign up with Google
        </button>
        {googleNotice && (
          <p className="register-note">
            Google sign-in is coming soon - please use your email for now.
          </p>
        )}

        <div className="register-login-footer">
          <p className="register-login-question">Already have an account?</p>
          <button
            className="register-login"
            type="button"
            onClick={() => navigate("/login")}
          >
            Sign <span className="register-login-word">in</span>
          </button>
        </div>
      </form>
    </div>
  );
}
