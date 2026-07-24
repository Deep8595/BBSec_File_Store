import { useMemo, useState } from "react";
import { loginUser, signupUser } from "../services/api";

export default function AuthPanel({
  currentUser,
  onLogin,
  onLogout,
  onOpenAuth,
}) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const subtitle = useMemo(() => {
    return currentUser
      ? `Signed in as ${currentUser.name}`
      : "Secure access for blockchain-backed file workflows";
  }, [currentUser]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password || (mode === "signup" && !form.name)) {
      setError(
        mode === "signup"
          ? "Name, email, and password are required."
          : "Email and password are required.",
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        mode === "signup"
          ? await signupUser({
              name: form.name,
              email: form.email,
              password: form.password,
            })
          : await loginUser({ email: form.email, password: form.password });

      onLogin(response);
      setSuccess(
        response.message ||
          (mode === "signup" ? "Account created successfully" : "Welcome back"),
      );
      setForm({ name: "", email: "", password: "" });
      if (onOpenAuth) {
        onOpenAuth(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Authentication failed",
      );
    } finally {
      setLoading(false);
    }
  }

  if (currentUser) {
    return (
      <div className="card auth-card">
        <div className="card-header">
          <h3>Blockchain access</h3>
          <span className="chip">Signed in</span>
        </div>
        <p className="hero-text" style={{ marginTop: 0 }}>
          {subtitle}
        </p>
        <div className="detail-list">
          <div className="detail-item">
            <span className="field-label">Email</span>
            <strong>{currentUser.email}</strong>
          </div>
          <div className="detail-item">
            <span className="field-label">Wallet</span>
            <strong>{currentUser.wallet}</strong>
          </div>
        </div>
        <div className="action-row">
          <button className="secondary-btn" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card auth-card">
      <div className="card-header">
        <h3>
          {mode === "signup"
            ? "Create blockchain account"
            : "Sign in to workspace"}
        </h3>
        <span className="chip">Secure</span>
      </div>
      <p className="hero-text" style={{ marginTop: 0 }}>
        {subtitle}
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <label className="field-label">
            Full name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alex Morgan"
            />
          </label>
        )}

        <label className="field-label">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="user@example.com"
          />
        </label>

        <label className="field-label">
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p className="field-label" style={{ color: "#ffb3b3" }}>
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="field-label" style={{ color: "#8cf0c8" }}>
            {success}
          </p>
        ) : null}

        <div className="action-row">
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading
              ? "Working..."
              : mode === "signup"
                ? "Create account"
                : "Login"}
          </button>
          <button
            className="secondary-btn"
            type="button"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          >
            {mode === "signup" ? "Already have an account?" : "Create account"}
          </button>
        </div>
      </form>
    </div>
  );
}
