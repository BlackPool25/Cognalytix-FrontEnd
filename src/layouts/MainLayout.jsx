import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.jsx";
import { getT } from "../theme.js";

export function MainLayout() {
  const [dark, setDark] = useState(() => localStorage.getItem("cognalytix_dark") !== "false");
  const [navCollapsed, setNavCollapsed] = useState(() => localStorage.getItem("cognalytix_nav_collapsed") === "true");
  const t = getT(dark);

  useEffect(() => {
    localStorage.setItem("cognalytix_dark", String(dark));
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("cognalytix_nav_collapsed", String(navCollapsed));
  }, [navCollapsed]);

  return (
    <div
      className="app-shell"
      style={{
        display: "flex",
        minHeight: "100vh",
        height: "100vh",
        overflow: "hidden",
        background: t.bg,
        color: t.ink,
        fontFamily: "var(--font-ui)",
        transition: "background 0.3s,color 0.3s",
        position: "relative",
      }}
    >
      <style>{`
        .app-shell::before{
          content:"";
          pointer-events:none;
          position:fixed;
          inset:0;
          z-index:0;
          opacity:${dark ? 0.04 : 0.028};
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
        }
        *{box-sizing:border-box;margin:0;padding:0}
        textarea,input{color-scheme:${dark ? "dark" : "light"}}
        textarea::placeholder,input::placeholder{color:${t.inkDim}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:6px}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
      <Sidebar
        dark={dark}
        setDark={setDark}
        t={t}
        collapsed={navCollapsed}
        onToggleCollapsed={() => setNavCollapsed((c) => !c)}
      />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "clamp(20px,3vw,40px) clamp(18px,4vw,52px)",
          background: "transparent",
          transition: "background 0.3s",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Outlet context={{ t }} />
      </main>
    </div>
  );
}
