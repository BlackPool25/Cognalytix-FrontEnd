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

const RAIL_EXPANDED = 220;
const RAIL_COLLAPSED = 64;

function LogoutIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden style={{ display: "block" }}>
      <path
        d="M10 7V5a2 2 0 012-2h7a2 2 0 012 2v14a2 2 0 01-2 2h-7a2 2 0 01-2-2v-2M15 12H3m0 0 3.5-3.5M3 12l3.5 3.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sidebar({ dark, setDark, t, collapsed, onToggleCollapsed }) {
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
  const w = collapsed ? RAIL_COLLAPSED : RAIL_EXPANDED;

  return (
    <aside
      style={{
        width: `${w}px`,
        minWidth: `${w}px`,
        maxWidth: `${w}px`,
        height: "100vh",
        maxHeight: "100vh",
        background: t.navBg,
        boxShadow: `1px 0 0 ${t.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.22s ease, min-width 0.22s ease, max-width 0.22s ease, background 0.3s",
        zIndex: 20,
        overflow: "hidden",
      }}
    >
        {/* Top: collapse (brand is top-right on each page via BrandLockup) */}
      <div
        style={{
          padding: collapsed ? "16px 10px 12px" : "18px 14px 12px",
          flexShrink: 0,
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            width: "40px",
            height: "36px",
            borderRadius: "10px",
            border: `1px solid ${t.border}`,
            background: t.surfaceEl,
            color: t.inkMid,
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {collapsed ? "☰" : "«"}
        </button>
      </div>

      <nav
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          padding: collapsed ? "4px 8px" : "4px 10px",
        }}
      >
        {NAV.map((n) => {
          const active = location.pathname === n.path;
          return (
            <button
              key={n.path}
              type="button"
              onClick={() => navigate(n.path)}
              onMouseEnter={() => setHov(n.path)}
              onMouseLeave={() => setHov(null)}
              title={collapsed ? n.label : undefined}
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: collapsed ? 0 : "12px",
                width: "100%",
                padding: collapsed ? "12px 8px" : "11px 14px",
                marginBottom: "2px",
                background: active ? t.emberSoft : hov === n.path ? t.hover : "transparent",
                border: "none",
                borderRadius: "12px",
                color: active ? t.ember : t.inkMid,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "var(--font-ui)",
                fontSize: "13px",
                fontWeight: active ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "16px", width: collapsed ? "auto" : "22px", textAlign: "center", flexShrink: 0 }}>
                {n.icon}
              </span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.label}</span>
                  {active && (
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: t.ember,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: collapsed ? "6px 8px 8px" : "0 10px 12px", flexShrink: 0 }}>
        {collapsed ? (
          <div
            title={`Writing streak: ${streak} day${streak === 1 ? "" : "s"}`}
            style={{
              width: "44px",
              height: "44px",
              margin: "0 auto",
              borderRadius: "50%",
              background: t.surface,
              border: `1px solid ${t.border}`,
              boxShadow: t.shadowSm,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: t.ember,
                fontFamily: "var(--font-ui)",
                lineHeight: 1,
              }}
            >
              {streak}
            </span>
          </div>
        ) : (
          <div
            style={{
              padding: "16px",
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "14px",
              boxShadow: t.shadowSm,
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: t.inkDim,
                fontFamily: "var(--font-ui)",
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
                  fontFamily: "var(--font-ui)",
                  lineHeight: 1,
                }}
              >
                {streak}
              </span>
              <span style={{ fontSize: "12px", color: t.inkMid, fontFamily: "var(--font-ui)" }}>days</span>
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
        )}
      </div>

      <div
        style={{
          padding: collapsed ? "12px 8px 16px" : "12px 14px 18px",
          borderTop: `1px solid ${t.border}`,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          flexShrink: 0,
          background: t.navBg,
        }}
      >
        {!collapsed && (
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
                fontFamily: "var(--font-ui)",
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-ui)",
                  color: t.ink,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name || "Signed in"}
              </div>
              <div style={{ fontSize: "10px", color: t.inkDim, fontFamily: "var(--font-ui)" }}>{roleLabel}</div>
            </div>
          </div>
        )}

        {collapsed && (
          <div style={{ display: "flex", justifyContent: "center" }}>
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
                fontFamily: "var(--font-ui)",
              }}
              title={user?.name || "Signed in"}
            >
              {initial}
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: collapsed ? "column" : "row",
            alignItems: "stretch",
            gap: "8px",
          }}
        >
          <button
            type="button"
            onClick={() => logout()}
            aria-label="Sign out"
            title="Sign out"
            style={{
              padding: collapsed ? "0" : "10px 12px",
              width: collapsed ? "40px" : undefined,
              height: collapsed ? "40px" : undefined,
              minWidth: collapsed ? "40px" : 0,
              borderRadius: "10px",
              background: t.surfaceEl,
              border: `1px solid ${t.border}`,
              cursor: "pointer",
              fontSize: "12px",
              lineHeight: 1.2,
              color: t.inkMid,
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              flex: collapsed ? undefined : 1,
              whiteSpace: "nowrap",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {collapsed ? <LogoutIcon color={t.inkMid} /> : "Sign out"}
          </button>
          <button
            type="button"
            onClick={() => setDark(!dark)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: collapsed ? "100%" : "40px",
              minWidth: collapsed ? undefined : "40px",
              height: "40px",
              borderRadius: "10px",
              background: t.surfaceEl,
              border: `1px solid ${t.border}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              transition: "all 0.2s",
              color: t.inkMid,
              flexShrink: 0,
            }}
          >
            {dark ? "☀" : "☽"}
          </button>
        </div>
      </div>
    </aside>
  );
}
