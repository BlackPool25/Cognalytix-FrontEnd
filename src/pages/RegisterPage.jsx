import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getT } from "../theme.js";

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();

  const [dark, setDark] = useState(() => localStorage.getItem("cognalytix_dark") !== "false");
  const t = getT(dark);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      const violations = err.body?.fieldViolations;
      if (Array.isArray(violations)) {
        const fe = {};
        for (const v of violations) {
          if (v.field) fe[v.field] = v.message;
        }
        setFieldErrors(fe);
      }
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(20px,4vw,48px)",
        transition: "background 0.3s,color 0.3s",
      }}
    >
      <style>{`
        *{box-sizing:border-box}
        input::placeholder{color:${t.inkDim}}
      `}</style>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 14px",
              borderRadius: "14px",
              background: t.emberSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            ◈
          </div>
          <div style={{ fontSize: "22px", fontFamily: "Georgia,serif", fontWeight: 400 }}>Begin your mirror</div>
          <div style={{ fontSize: "12px", color: t.inkDim, marginTop: "8px", fontFamily: "sans-serif" }}>
            Create a Cognalytix account
          </div>
        </div>

        <div
          style={{
            background: t.surface,
            borderRadius: "18px",
            padding: "28px",
            boxShadow: t.shadowSm,
          }}
        >
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: "14px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.12em", color: t.inkDim, textTransform: "uppercase" }}>Name</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                style={{
                  marginTop: "6px",
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: `1px solid ${fieldErrors.name ? t.caution : t.surfaceHi}`,
                  background: t.surfaceEl,
                  color: t.ink,
                  fontSize: "14px",
                  outline: "none",
                  caretColor: t.ember,
                }}
              />
              {fieldErrors.name && (
                <span style={{ fontSize: "11px", color: t.caution, marginTop: "4px", display: "block" }}>{fieldErrors.name}</span>
              )}
            </label>
            <label style={{ display: "block", marginBottom: "14px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.12em", color: t.inkDim, textTransform: "uppercase" }}>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  marginTop: "6px",
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: `1px solid ${fieldErrors.email ? t.caution : t.surfaceHi}`,
                  background: t.surfaceEl,
                  color: t.ink,
                  fontSize: "14px",
                  outline: "none",
                  caretColor: t.ember,
                }}
              />
              {fieldErrors.email && (
                <span style={{ fontSize: "11px", color: t.caution, marginTop: "4px", display: "block" }}>{fieldErrors.email}</span>
              )}
            </label>
            <label style={{ display: "block", marginBottom: "20px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.12em", color: t.inkDim, textTransform: "uppercase" }}>
                Password (min 8 characters)
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                maxLength={128}
                style={{
                  marginTop: "6px",
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: `1px solid ${fieldErrors.password ? t.caution : t.surfaceHi}`,
                  background: t.surfaceEl,
                  color: t.ink,
                  fontSize: "14px",
                  outline: "none",
                  caretColor: t.ember,
                }}
              />
              {fieldErrors.password && (
                <span style={{ fontSize: "11px", color: t.caution, marginTop: "4px", display: "block" }}>{fieldErrors.password}</span>
              )}
            </label>

            {error && (
              <div
                style={{
                  marginBottom: "14px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: t.cautionSoft,
                  color: t.caution,
                  fontSize: "13px",
                  fontFamily: "sans-serif",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "12px",
                background: submitting ? t.surfaceHi : t.ember,
                color: "#fff",
                fontSize: "14px",
                fontFamily: "sans-serif",
                fontWeight: 600,
                cursor: submitting ? "default" : "pointer",
                boxShadow: submitting ? "none" : `0 4px 16px ${t.ember}40`,
              }}
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: t.inkMid, fontFamily: "sans-serif" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: t.ember, fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
          <button
            type="button"
            onClick={() => {
              const next = !dark;
              setDark(next);
              localStorage.setItem("cognalytix_dark", String(next));
            }}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: t.surfaceEl,
              border: "none",
              cursor: "pointer",
              color: t.inkMid,
              fontSize: "16px",
            }}
          >
            {dark ? "☀" : "☽"}
          </button>
        </div>
      </div>
    </div>
  );
}
