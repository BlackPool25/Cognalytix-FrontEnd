import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { listJournals } from "../api/journalsApi.js";
import { computeCurrentStreak } from "../utils/journalStats.js";

const NAV = [
  { icon: "⌂", label: "Home", path: "/home" },
  { icon: "✎", label: "Write", path: "/write" },
  { icon: "≡", label: "Journal", path: "/journal" },
  { icon: "◈", label: "Insights", path: "/insights" },
];

export function Sidebar({ dark, setDark, t }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [hov, setHov] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let cancel = false;
    listJournals({ page: 0, size: 200 })
      .then((page) => {
        if (!cancel) setStreak(computeCurrentStreak(page.content || []));
      })
      .catch(() => {
        if (!cancel) setStreak(0);
      });
    return () => {
      cancel = true;
    };
  }, [location.pathname]);

  const initial = (user?.name || "?").trim().slice(0, 1).toUpperCase();
  const roleLabel = user?.role === "ADMIN" ? "Admin" : "User";

  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        height: "100vh",
        background: t.surface,
        boxShadow: dark ? "1px 0 0 rgba(255,255,255,0.04)" : "1px 0 0 rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        transition: "background 0.3s",
        zIndex: 10,
      }}
    >
      <div style={{ padding: "28px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: t.emberSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            ◈
          </div>
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: t.ink,
                letterSpacing: "0.01em",
                fontFamily: "sans-serif",
              }}
            >
              Cognalytix
            </div>
            <div style={{ fontSize: "10px", color: t.inkDim, fontFamily: "sans-serif" }}>self-discovery mirror</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "4px 10px" }}>
        {NAV.map((n) => {
          const active = location.pathname === n.path;
          return (
            <button
              key={n.path}
              type="button"
              onClick={() => navigate(n.path)}
              onMouseEnter={() => setHov(n.path)}
              onMouseLeave={() => setHov(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "11px 14px",
                marginBottom: "2px",
                background: active ? t.emberSoft : hov === n.path ? t.surfaceEl : "transparent",
                border: "none",
                borderRadius: "12px",
                color: active ? t.ember : t.inkMid,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "sans-serif",
                fontSize: "13px",
                fontWeight: active ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "16px", width: "22px", textAlign: "center" }}>{n.icon}</span>
              {n.label}
              {active && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: t.ember,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "0 10px 12px" }}>
        <div
          style={{
            padding: "16px",
            background: t.surfaceEl,
            borderRadius: "14px",
            boxShadow: t.shadowSm,
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: t.inkDim,
              fontFamily: "sans-serif",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Writing Streak
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px", margin: "6px 0 10px" }}>
            <span
              style={{
                fontSize: "30px",
                color: t.ember,
                fontWeight: 700,
                fontFamily: "sans-serif",
                lineHeight: 1,
              }}
            >
              {streak}
            </span>
            <span style={{ fontSize: "12px", color: t.inkMid, fontFamily: "sans-serif" }}>days</span>
          </div>
          <div style={{ height: "4px", background: t.surfaceHi, borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, streak * 8)}%`,
                borderRadius: "4px",
                background: `linear-gradient(90deg,${t.ember}80,${t.ember})`,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "12px 16px 20px",
          borderTop: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: t.emberSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: t.ember,
              fontWeight: 700,
              fontFamily: "sans-serif",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "12px",
                fontFamily: "sans-serif",
                color: t.ink,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "Signed in"}
            </div>
            <div style={{ fontSize: "10px", color: t.inkDim, fontFamily: "sans-serif" }}>{roleLabel}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            title="Sign out"
            onClick={() => logout()}
            style={{
              padding: "6px 8px",
              borderRadius: "8px",
              background: t.surfaceEl,
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              color: t.inkMid,
              fontFamily: "sans-serif",
            }}
          >
            Out
          </button>
          <button
            type="button"
            onClick={() => setDark(!dark)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: t.surfaceEl,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              transition: "all 0.2s",
              color: t.inkMid,
            }}
          >
            {dark ? "☀" : "☽"}
          </button>
        </div>
      </div>
    </aside>
  );
}
