import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.jsx";
import { getT } from "../theme.js";

export function MainLayout() {
  const [dark, setDark] = useState(() => localStorage.getItem("cognalytix_dark") !== "false");
  const t = getT(dark);

  useEffect(() => {
    localStorage.setItem("cognalytix_dark", String(dark));
  }, [dark]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        overflow: "hidden",
        background: t.bg,
        color: t.ink,
        transition: "background 0.3s,color 0.3s",
      }}
    >
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        textarea,input{color-scheme:${dark ? "dark" : "light"}}
        textarea::placeholder,input::placeholder{color:${t.inkDim}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${t.surfaceHi};border-radius:4px}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
      <Sidebar dark={dark} setDark={setDark} t={t} />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "clamp(24px,4vw,52px) clamp(20px,5vw,60px)",
          background: t.bg,
          transition: "background 0.3s",
        }}
      >
        <Outlet context={{ t }} />
      </main>
    </div>
  );
}
