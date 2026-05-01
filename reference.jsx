import { useState } from "react";

const getT = (dark) => ({
  bg:          dark ? "#0F0D0B" : "#F5EFE3",
  surface:     dark ? "#181410" : "#FFFDF7",
  surfaceEl:   dark ? "#201C17" : "#F0E8D8",
  surfaceHi:   dark ? "#2A241E" : "#E6DCC8",
  ink:         dark ? "#EDE0CF" : "#1C1208",
  inkMid:      dark ? "#9A8E7E" : "#5A4A32",
  inkDim:      dark ? "#5A5048" : "#9A8A70",
  ember:       dark ? "#C4854A" : "#A06828",
  emberSoft:   dark ? "rgba(196,133,74,0.13)" : "rgba(160,104,40,0.11)",
  emberLine:   dark ? "rgba(196,133,74,0.4)" : "rgba(160,104,40,0.35)",
  growth:      dark ? "#7A9E7E" : "#4A7A52",
  growthSoft:  dark ? "rgba(122,158,126,0.14)" : "rgba(74,122,82,0.11)",
  caution:     dark ? "#B87C5A" : "#8A4E2A",
  cautionSoft: dark ? "rgba(184,124,90,0.14)" : "rgba(138,78,42,0.11)",
  shadow:      dark ? "0 4px 28px rgba(0,0,0,0.45)" : "0 4px 28px rgba(0,0,0,0.09)",
  shadowSm:    dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.06)",
  shadowLg:    dark ? "0 12px 48px rgba(0,0,0,0.6)" : "0 12px 48px rgba(0,0,0,0.14)",
  overlay:     dark ? "rgba(10,8,6,0.82)" : "rgba(240,232,218,0.85)",
});

const ENTRIES = [
  { id:1, date:"May 2, 2026",  title:"The deadline kept moving",  mood:"work stress", intensity:5,
    content:"The deadline kept moving. I kept adjusting. At some point I stopped noticing I was anxious and just started performing anxious. There's a difference. Performing anxious is almost comfortable — it's familiar, it has a shape. The real anxiety is shapeless. It doesn't have a schedule or a deliverable. It just sits there.",
    sections:[{topic:"work stress",emotion:"anxiety",intensity:5},{topic:"self-awareness",emotion:"acceptance",intensity:3}] },
  { id:2, date:"May 1, 2026",  title:"Long walk",                  mood:"acceptance",  intensity:2,
    content:"Long walk. Didn't think about anything in particular. Strange how rest feels guilty sometimes. Like I need to justify stillness with productivity. But the walk was just the walk. No podcast, no destination.",
    sections:[{topic:"rest",emotion:"acceptance",intensity:2},{topic:"guilt",emotion:"self-doubt",intensity:3}] },
  { id:3, date:"Apr 29, 2026", title:"Old code",                   mood:"self-doubt",  intensity:3,
    content:"Reviewed my old code from six months ago. Mixed feelings — it was worse than I remembered, but I fixed it faster than I expected. Maybe that's growth. Or maybe I've just lowered my standards for what counts as fixed.",
    sections:[{topic:"coding",emotion:"self-doubt",intensity:3},{topic:"growth",emotion:"curiosity",intensity:2}] },
  { id:4, date:"Apr 28, 2026", title:"Call with family",           mood:"warmth",      intensity:2,
    content:"Good call with family. Nothing important was said but everything important was communicated. That's the thing about people who know you — they can read the pauses.",
    sections:[{topic:"relationships",emotion:"warmth",intensity:2}] },
  { id:5, date:"Apr 26, 2026", title:"Couldn't sleep",             mood:"anxiety",     intensity:4,
    content:"Couldn't sleep. Kept running through the meeting in my head — what I should have said, what I did say, the gap between those two things. The 3am version of me is a harsh editor.",
    sections:[{topic:"work stress",emotion:"anxiety",intensity:4},{topic:"self-criticism",emotion:"self-doubt",intensity:4}] },
];

const DAYS = [
  { d:"M", date:28, wrote:true,  intensity:4 },
  { d:"T", date:29, wrote:true,  intensity:3 },
  { d:"W", date:30, wrote:false, intensity:0 },
  { d:"T", date:1,  wrote:true,  intensity:5 },
  { d:"F", date:2,  wrote:true,  intensity:2 },
  { d:"S", date:3,  wrote:false, intensity:0 },
  { d:"S", date:4,  wrote:true,  intensity:2, today:true },
];

const GROWTH = [
  { dir:"REGRESSION", type:"Weekly",     topic:"work stress",  date:"Apr 28",
    narration:"You wrote about work stress 4 times this week — intensity averaging 4.1. Eight weeks ago, the same topic sat at 2.3. Something shifted in April." },
  { dir:"GROWTH",     type:"Post-Entry", topic:"self-doubt",   date:"Apr 26",
    narration:"Six weeks ago, coding brought up self-doubt at intensity 4.2. Today it appeared at 2.8. You're carrying this differently now." },
  { dir:"STABLE",     type:"Monthly",    topic:"relationships", date:"Apr 1",
    narration:"Relationships appeared in 6 of your entries this month — consistent warmth around 2.0. A stable anchor in a variable month." },
];

const iCol = (i, t) => i <= 2 ? t.growth : i <= 3 ? t.ember : t.caution;

function Badge({ label, color, bg }) {
  return (
    <span style={{
      fontSize:"10px", fontFamily:"sans-serif", letterSpacing:"0.08em",
      textTransform:"uppercase", padding:"3px 10px", borderRadius:"20px",
      color, background:bg, fontWeight:600, whiteSpace:"nowrap",
    }}>{label}</span>
  );
}

function DirBadge({ dir, t }) {
  const map = {
    GROWTH:     [t.growth,  t.growthSoft,  "↗ Growth"],
    REGRESSION: [t.caution, t.cautionSoft, "↘ Shift"],
    STABLE:     [t.inkMid,  t.surfaceEl,   "→ Stable"],
  };
  const [c, bg, label] = map[dir] || [t.inkMid, t.surfaceEl, dir];
  return <Badge label={label} color={c} bg={bg} />;
}

function IntensityDots({ value, t }) {
  return (
    <div style={{ display:"flex", gap:"4px", alignItems:"center" }}>
      {[1,2,3,4,5].map(n => (
        <div key={n} style={{
          width:"7px", height:"7px", borderRadius:"50%",
          background: n <= value ? iCol(value, t) : t.surfaceHi,
          transition:"background 0.2s",
        }} />
      ))}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, dark, setDark, t }) {
  const [hov, setHov] = useState(null);
  const nav = [
    { icon:"⌂", label:"Home",     id:"home" },
    { icon:"✎", label:"Write",    id:"write" },
    { icon:"≡", label:"Journal",  id:"journal" },
    { icon:"◈", label:"Insights", id:"insights" },
  ];
  return (
    <aside style={{
      width:"220px", minWidth:"220px", height:"100vh",
      background:t.surface,
      boxShadow:dark?"1px 0 0 rgba(255,255,255,0.04)":"1px 0 0 rgba(0,0,0,0.07)",
      display:"flex", flexDirection:"column",
      transition:"background 0.3s",
      zIndex:10,
    }}>
      <div style={{ padding:"28px 20px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{
            width:"32px", height:"32px", borderRadius:"10px",
            background:t.emberSoft, display:"flex",
            alignItems:"center", justifyContent:"center",
            fontSize:"16px", flexShrink:0,
          }}>◈</div>
          <div>
            <div style={{ fontSize:"13px", fontWeight:700, color:t.ink, letterSpacing:"0.01em", fontFamily:"sans-serif" }}>Cognalytix</div>
            <div style={{ fontSize:"10px", color:t.inkDim, fontFamily:"sans-serif" }}>self-discovery mirror</div>
          </div>
        </div>
      </div>

      <nav style={{ flex:1, padding:"4px 10px" }}>
        {nav.map(n => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)}
              onMouseEnter={() => setHov(n.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                display:"flex", alignItems:"center", gap:"12px",
                width:"100%", padding:"11px 14px", marginBottom:"2px",
                background: active ? t.emberSoft : hov===n.id ? t.surfaceEl : "transparent",
                border:"none", borderRadius:"12px",
                color: active ? t.ember : t.inkMid,
                cursor:"pointer", textAlign:"left",
                fontFamily:"sans-serif", fontSize:"13px",
                fontWeight: active ? 600 : 400,
                transition:"all 0.15s",
              }}>
              <span style={{ fontSize:"16px", width:"22px", textAlign:"center" }}>{n.icon}</span>
              {n.label}
              {active && <div style={{ marginLeft:"auto", width:"6px", height:"6px", borderRadius:"50%", background:t.ember }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:"0 10px 12px" }}>
        <div style={{
          padding:"16px", background:t.surfaceEl,
          borderRadius:"14px", boxShadow:t.shadowSm,
        }}>
          <div style={{ fontSize:"10px", color:t.inkDim, fontFamily:"sans-serif", letterSpacing:"0.12em", textTransform:"uppercase" }}>Writing Streak</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:"4px", margin:"6px 0 10px" }}>
            <span style={{ fontSize:"30px", color:t.ember, fontWeight:700, fontFamily:"sans-serif", lineHeight:1 }}>12</span>
            <span style={{ fontSize:"12px", color:t.inkMid, fontFamily:"sans-serif" }}>days</span>
          </div>
          <div style={{ height:"4px", background:t.surfaceHi, borderRadius:"4px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:"80%", borderRadius:"4px",
              background:`linear-gradient(90deg,${t.ember}80,${t.ember})` }} />
          </div>
          <div style={{ fontSize:"10px", color:t.inkDim, fontFamily:"sans-serif", marginTop:"6px" }}>Best: 30 days</div>
        </div>
      </div>

      <div style={{
        padding:"12px 16px 20px",
        borderTop:dark?"1px solid rgba(255,255,255,0.05)":"1px solid rgba(0,0,0,0.06)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{
            width:"30px", height:"30px", borderRadius:"50%",
            background:t.emberSoft, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:"12px", color:t.ember, fontWeight:700, fontFamily:"sans-serif",
          }}>A</div>
          <div>
            <div style={{ fontSize:"12px", fontFamily:"sans-serif", color:t.ink, fontWeight:500 }}>Aryan</div>
            <div style={{ fontSize:"10px", color:t.inkDim, fontFamily:"sans-serif" }}>User</div>
          </div>
        </div>
        <button onClick={() => setDark(!dark)} style={{
          width:"32px", height:"32px", borderRadius:"10px",
          background:t.surfaceEl, border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"14px", transition:"all 0.2s", color:t.inkMid,
        }}>{dark ? "☀" : "☽"}</button>
      </div>
    </aside>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({ t, setPage }) {
  const [hovDay, setHovDay] = useState(null);
  const [hovEntry, setHovEntry] = useState(null);
  return (
    <div style={{ maxWidth:"1080px", margin:"0 auto" }}>
      <div style={{ marginBottom:"32px" }}>
        <div style={{ fontSize:"11px", color:t.inkDim, fontFamily:"sans-serif", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"8px" }}>Sunday, May 4</div>
        <h1 style={{ margin:0, fontSize:"clamp(22px,3vw,30px)", color:t.ink, fontWeight:400, fontFamily:"Georgia,serif" }}>Good evening, Aryan.</h1>
      </div>

      {/* Mirror statement — floating, not boxed */}
      <div style={{ marginBottom:"48px", paddingLeft:"20px", position:"relative" }}>
        <div style={{
          position:"absolute", left:0, top:"4px", bottom:"4px", width:"2px", borderRadius:"2px",
          background:`linear-gradient(180deg,${t.ember},${t.ember}20)`,
        }} />
        <div style={{ fontSize:"10px", letterSpacing:"0.18em", color:t.ember, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:"10px" }}>
          This Week's Mirror
        </div>
        <p style={{
          fontSize:"clamp(16px,2vw,20px)", lineHeight:"1.75", color:t.ink,
          fontStyle:"italic", margin:"0 0 14px", maxWidth:"640px", fontFamily:"Georgia,serif",
        }}>
          "You wrote about work stress 4 times this week — intensity averaging 4.1.
          Eight weeks ago, the same topic sat at 2.3. Something shifted in April."
        </p>
        <DirBadge dir="REGRESSION" t={t} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr clamp(260px,28%,320px)", gap:"28px", alignItems:"start" }}>
        <div>
          {/* Week strip */}
          <div style={{ background:t.surface, borderRadius:"18px", padding:"22px", boxShadow:t.shadowSm, marginBottom:"24px" }}>
            <div style={{ fontSize:"10px", letterSpacing:"0.12em", color:t.inkDim, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:"18px" }}>This Week</div>
            <div style={{ display:"flex", gap:"6px" }}>
              {DAYS.map((day, i) => (
                <div key={i} onMouseEnter={() => setHovDay(i)} onMouseLeave={() => setHovDay(null)}
                  style={{
                    flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
                    padding:"10px 4px", borderRadius:"14px", cursor:"default",
                    background: day.today ? t.emberSoft : hovDay===i ? t.surfaceEl : "transparent",
                    transition:"all 0.2s",
                  }}>
                  <span style={{ fontSize:"10px", color:day.today ? t.ember : t.inkDim, fontFamily:"sans-serif", fontWeight:day.today?700:400 }}>{day.d}</span>
                  <div style={{
                    width:"34px", height:"34px", borderRadius:"50%",
                    background: day.wrote ? iCol(day.intensity,t)+"22" : t.surfaceEl,
                    border:`2px solid ${day.wrote ? iCol(day.intensity,t) : "transparent"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.2s",
                    boxShadow: day.wrote && day.intensity>=4 ? `0 0 14px ${iCol(day.intensity,t)}50` : "none",
                  }}>
                    {day.wrote && <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:iCol(day.intensity,t) }} />}
                  </div>
                  <span style={{ fontSize:"11px", color:day.today?t.ink:t.inkDim, fontFamily:"sans-serif" }}>{day.date}</span>
                  {day.wrote
                    ? <span style={{ fontSize:"9px", color:iCol(day.intensity,t), fontFamily:"sans-serif", fontWeight:600 }}>{day.intensity}/5</span>
                    : <span style={{ fontSize:"9px", color:t.inkDim, fontFamily:"sans-serif" }}>—</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Recent entries */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
            <div style={{ fontSize:"10px", letterSpacing:"0.12em", color:t.inkDim, fontFamily:"sans-serif", textTransform:"uppercase" }}>Recent Entries</div>
            <button onClick={() => setPage("journal")} style={{
              background:"none", border:"none", color:t.ember,
              fontSize:"11px", fontFamily:"sans-serif", cursor:"pointer", letterSpacing:"0.04em",
            }}>See all →</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {ENTRIES.slice(0,3).map(e => (
              <div key={e.id}
                onMouseEnter={() => setHovEntry(e.id)}
                onMouseLeave={() => setHovEntry(null)}
                onClick={() => setPage("journal")}
                style={{
                  background:t.surface, borderRadius:"16px", padding:"18px 20px",
                  boxShadow:hovEntry===e.id ? t.shadow : t.shadowSm,
                  cursor:"pointer", transition:"all 0.2s",
                  transform:hovEntry===e.id ? "translateY(-2px)" : "none",
                  borderLeft:`3px solid ${iCol(e.intensity,t)}`,
                }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px", gap:"12px" }}>
                  <span style={{ fontSize:"14px", fontWeight:500, color:t.ink, fontFamily:"sans-serif" }}>{e.title}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
                    <Badge label={e.mood} color={iCol(e.intensity,t)} bg={iCol(e.intensity,t)+"1A"} />
                    <span style={{ fontSize:"11px", color:t.inkDim, fontFamily:"sans-serif" }}>{e.date.split(",")[0]}</span>
                  </div>
                </div>
                <p style={{ margin:0, fontSize:"13px", lineHeight:"1.6", color:t.inkMid, fontStyle:"italic", fontFamily:"Georgia,serif" }}>
                  "{e.content.slice(0,110)}..."
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          <div style={{ background:t.surface, borderRadius:"18px", padding:"20px", boxShadow:t.shadowSm }}>
            <div style={{ fontSize:"10px", letterSpacing:"0.12em", color:t.inkDim, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:"12px" }}>Today's Reflection</div>
            <p style={{ margin:"0 0 14px", fontSize:"13px", lineHeight:"1.65", color:t.inkMid, fontStyle:"italic", fontFamily:"Georgia,serif" }}>
              "Dominant mood: acceptance. Lower than your weekly average. You seem to be processing, not reacting."
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ flex:1, height:"4px", background:t.surfaceEl, borderRadius:"4px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:"40%", background:t.growth, borderRadius:"4px" }} />
              </div>
              <span style={{ fontSize:"11px", color:t.growth, fontFamily:"sans-serif", fontWeight:600 }}>2.0 / 5</span>
            </div>
          </div>

          <div style={{
            borderRadius:"18px", padding:"20px",
            background:`linear-gradient(140deg,${t.emberSoft},${t.surfaceEl})`,
            boxShadow:t.shadowSm,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
              <span style={{ fontSize:"18px" }}>◈</span>
              <span style={{ fontSize:"10px", letterSpacing:"0.12em", color:t.ember, fontFamily:"sans-serif", textTransform:"uppercase" }}>Milestone · 30 Entries</span>
            </div>
            <p style={{ margin:0, fontSize:"13px", lineHeight:"1.65", color:t.inkMid, fontFamily:"Georgia,serif" }}>
              Self-doubt averaged <span style={{ color:t.ink, fontWeight:700 }}>3.8</span> in your first 10 entries.
              It's now <span style={{ color:t.growth, fontWeight:700 }}>2.1</span>. That's not nothing.
            </p>
          </div>

          <div style={{ background:t.surface, borderRadius:"18px", padding:"20px", boxShadow:t.shadowSm }}>
            <div style={{ fontSize:"10px", letterSpacing:"0.12em", color:t.inkDim, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:"16px" }}>Emotional Range</div>
            {[
              { label:"work stress", pct:82, color:t.caution },
              { label:"self-doubt",  pct:61, color:t.ember },
              { label:"acceptance",  pct:44, color:t.growth },
              { label:"curiosity",   pct:30, color:"#7A8E9E" },
            ].map(r => (
              <div key={r.label} style={{ marginBottom:"13px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                  <span style={{ fontSize:"12px", fontFamily:"sans-serif", color:t.inkMid }}>{r.label}</span>
                  <span style={{ fontSize:"11px", color:r.color, fontFamily:"sans-serif", fontWeight:600 }}>{r.pct}%</span>
                </div>
                <div style={{ height:"4px", background:t.surfaceEl, borderRadius:"4px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${r.pct}%`, background:r.color, borderRadius:"4px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WRITE ────────────────────────────────────────────────────────────────────
function WritePage({ t }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | analyzing | mirror
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = () => {
    if (!content.trim() || phase !== "idle") return;
    setPhase("analyzing");
    setTimeout(() => setPhase("mirror"), 2600);
  };

  return (
    <div style={{ maxWidth:"680px", margin:"0 auto", position:"relative" }}>
      {/* Overlay */}
      {(phase === "analyzing" || phase === "mirror") && (
        <div style={{
          position:"fixed", inset:0, zIndex:50,
          background:t.overlay, backdropFilter:"blur(6px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"24px",
        }} onClick={() => phase==="mirror" && (setPhase("idle"), setTitle(""), setContent(""))}>
          {phase === "analyzing" ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"36px", marginBottom:"20px", display:"inline-block",
                animation:"spin 2s linear infinite" }}>◈</div>
              <div style={{ fontSize:"16px", color:t.ink, fontFamily:"Georgia,serif", fontStyle:"italic" }}>
                Reflecting on your entry...
              </div>
              <div style={{ fontSize:"12px", color:t.inkDim, fontFamily:"sans-serif", marginTop:"8px" }}>
                Finding patterns across your history
              </div>
            </div>
          ) : (
            <div style={{
              background:t.surface, borderRadius:"22px", padding:"36px",
              maxWidth:"500px", width:"100%", boxShadow:t.shadowLg,
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
                <span style={{ fontSize:"22px" }}>◈</span>
                <div>
                  <div style={{ fontSize:"10px", letterSpacing:"0.15em", color:t.ember, fontFamily:"sans-serif", textTransform:"uppercase" }}>Mirror · Post Entry</div>
                  <div style={{ fontSize:"11px", color:t.inkDim, fontFamily:"sans-serif" }}>May 4, 2026</div>
                </div>
              </div>
              <p style={{ fontSize:"17px", lineHeight:"1.78", color:t.ink, fontStyle:"italic", fontFamily:"Georgia,serif", margin:"0 0 18px" }}>
                "Work stress appeared at intensity 4.8 — the highest you've recorded on this topic. Six weeks ago it averaged 2.3."
              </p>
              <DirBadge dir="REGRESSION" t={t} />
              <p style={{ fontSize:"13px", color:t.inkMid, fontFamily:"Georgia,serif", margin:"16px 0 0", lineHeight:"1.65" }}>
                You've written about this 4 times this week. Something shifted in April — your data sees it even when you don't.
              </p>
              <button onClick={() => { setPhase("idle"); setTitle(""); setContent(""); }}
                style={{
                  marginTop:"24px", width:"100%", padding:"13px",
                  background:t.emberSoft, border:"none", borderRadius:"12px",
                  color:t.ember, fontSize:"13px", fontFamily:"sans-serif",
                  fontWeight:700, cursor:"pointer", letterSpacing:"0.04em",
                }}>Continue →</button>
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"44px" }}>
        <div style={{ fontSize:"11px", color:t.inkDim, fontFamily:"sans-serif", letterSpacing:"0.1em", textTransform:"uppercase" }}>
          Sunday, May 4
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <span style={{ fontSize:"12px", color:t.inkDim, fontFamily:"sans-serif" }}>{words} words</span>
          <button onClick={handleSave} disabled={!content.trim() || phase!=="idle"}
            style={{
              padding:"10px 22px",
              background: content.trim() && phase==="idle" ? t.ember : t.surfaceEl,
              border:"none", borderRadius:"12px",
              color: content.trim() && phase==="idle" ? "#fff" : t.inkDim,
              fontSize:"13px", fontFamily:"sans-serif", fontWeight:600,
              cursor: content.trim() && phase==="idle" ? "pointer" : "default",
              transition:"all 0.2s",
              boxShadow: content.trim() && phase==="idle" ? `0 4px 16px ${t.ember}50` : "none",
            }}>
            {phase==="idle" ? "Save & Reflect" : "Saving..."}
          </button>
        </div>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="What's on your mind?"
        style={{
          width:"100%", background:"none", border:"none", outline:"none",
          fontSize:"clamp(22px,3vw,30px)", color:t.ink,
          fontFamily:"Georgia,serif", marginBottom:"20px", caretColor:t.ember,
        }}
      />
      <div style={{ height:"1px", background:t.surfaceEl, marginBottom:"28px" }} />
      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="Write freely. This is just for you."
        style={{
          width:"100%", background:"none", border:"none", outline:"none",
          fontSize:"16px", color:t.inkMid, fontFamily:"Georgia,serif",
          lineHeight:"1.85", resize:"none", minHeight:"420px", caretColor:t.ember,
        }}
      />
    </div>
  );
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
function JournalPage({ t }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [hov, setHov] = useState(null);

  const filtered = ENTRIES.filter(e =>
    [e.title, e.content, e.mood].some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (selected) {
    const e = ENTRIES.find(x => x.id === selected);
    return (
      <div style={{ maxWidth:"700px", margin:"0 auto" }}>
        <button onClick={() => setSelected(null)} style={{
          background:"none", border:"none", color:t.ember,
          fontSize:"13px", fontFamily:"sans-serif", cursor:"pointer",
          marginBottom:"28px", padding:0, letterSpacing:"0.04em",
        }}>← Back to journal</button>

        <div style={{ marginBottom:"10px" }}>
          <Badge label={e.mood} color={iCol(e.intensity,t)} bg={iCol(e.intensity,t)+"1A"} />
        </div>
        <h1 style={{ fontSize:"clamp(20px,3vw,26px)", fontFamily:"Georgia,serif", color:t.ink, fontWeight:400, margin:"12px 0 6px" }}>
          {e.title}
        </h1>
        <div style={{ fontSize:"12px", color:t.inkDim, fontFamily:"sans-serif", marginBottom:"32px", display:"flex", alignItems:"center", gap:"12px" }}>
          <span>{e.date}</span>
          <IntensityDots value={e.intensity} t={t} />
        </div>
        <div style={{ height:"1px", background:t.surfaceEl, marginBottom:"32px" }} />
        <p style={{ fontSize:"16px", lineHeight:"1.88", color:t.inkMid, fontFamily:"Georgia,serif" }}>{e.content}</p>

        <div style={{ marginTop:"44px", paddingTop:"32px", borderTop:`1px solid ${t.surfaceEl}` }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.15em", color:t.inkDim, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:"18px" }}>
            AI Analysis · Entry Sections
          </div>
          {e.sections.map((s, i) => (
            <div key={i} style={{
              background:t.surface, borderRadius:"14px", padding:"16px 20px",
              boxShadow:t.shadowSm, marginBottom:"10px",
              borderLeft:`3px solid ${iCol(s.intensity,t)}`,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  <Badge label={s.topic} color={t.ember} bg={t.emberSoft} />
                  <Badge label={s.emotion} color={iCol(s.intensity,t)} bg={iCol(s.intensity,t)+"1A"} />
                </div>
                <IntensityDots value={s.intensity} t={t} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:"700px", margin:"0 auto" }}>
      <h1 style={{ fontSize:"clamp(20px,3vw,26px)", fontFamily:"Georgia,serif", color:t.ink, fontWeight:400, margin:"0 0 20px" }}>Journal</h1>
      <div style={{
        display:"flex", alignItems:"center", gap:"10px",
        background:t.surface, borderRadius:"14px",
        padding:"11px 16px", boxShadow:t.shadowSm, marginBottom:"24px",
      }}>
        <span style={{ color:t.inkDim, fontSize:"15px" }}>⌕</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search entries, moods, topics..."
          style={{
            flex:1, background:"none", border:"none", outline:"none",
            fontSize:"13px", color:t.ink, fontFamily:"sans-serif", caretColor:t.ember,
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{
            background:"none", border:"none", color:t.inkDim,
            cursor:"pointer", fontSize:"14px", padding:0,
          }}>✕</button>
        )}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {filtered.map(e => (
          <div key={e.id}
            onClick={() => setSelected(e.id)}
            onMouseEnter={() => setHov(e.id)}
            onMouseLeave={() => setHov(null)}
            style={{
              background:t.surface, borderRadius:"16px", padding:"18px 22px",
              boxShadow:hov===e.id ? t.shadow : t.shadowSm,
              cursor:"pointer", transition:"all 0.2s",
              transform:hov===e.id ? "translateY(-2px)" : "none",
              borderLeft:`3px solid ${iCol(e.intensity,t)}`,
            }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px", marginBottom:"8px" }}>
              <div>
                <div style={{ fontSize:"14px", fontWeight:500, color:t.ink, fontFamily:"sans-serif", marginBottom:"6px" }}>{e.title}</div>
                <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                  <Badge label={e.mood} color={iCol(e.intensity,t)} bg={iCol(e.intensity,t)+"1A"} />
                  <IntensityDots value={e.intensity} t={t} />
                </div>
              </div>
              <span style={{ fontSize:"11px", color:t.inkDim, fontFamily:"sans-serif", flexShrink:0, marginTop:"2px" }}>{e.date}</span>
            </div>
            <p style={{ margin:0, fontSize:"13px", lineHeight:"1.6", color:t.inkMid, fontStyle:"italic", fontFamily:"Georgia,serif" }}>
              "{e.content.slice(0,120)}..."
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"64px 0", color:t.inkDim, fontFamily:"Georgia,serif", fontStyle:"italic" }}>
            No entries match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────
function InsightsPage({ t }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ maxWidth:"820px", margin:"0 auto" }}>
      <h1 style={{ fontSize:"clamp(20px,3vw,26px)", fontFamily:"Georgia,serif", color:t.ink, fontWeight:400, margin:"0 0 6px" }}>Your Growth</h1>
      <p style={{ fontSize:"14px", color:t.inkDim, fontFamily:"sans-serif", margin:"0 0 40px" }}>
        Patterns your data has noticed. You might not have.
      </p>

      {/* Milestones */}
      <div style={{ marginBottom:"44px" }}>
        <div style={{ fontSize:"10px", letterSpacing:"0.15em", color:t.inkDim, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:"16px" }}>
          Milestones
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"14px" }}>
          {[
            { count:30, text:"Self-doubt averaged 3.8 in your first 10 entries. It now sits at 2.1.", dir:"GROWTH" },
            { count:10, text:"You've written about work stress 7 times. Anxiety around it has softened from 4.2 → 3.1.", dir:"GROWTH" },
          ].map((m, i) => (
            <div key={i} style={{
              background:`linear-gradient(140deg,${t.emberSoft},${t.surfaceEl})`,
              borderRadius:"18px", padding:"22px", boxShadow:t.shadowSm,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
                <span style={{ fontSize:"20px" }}>◈</span>
                <span style={{ fontSize:"10px", letterSpacing:"0.12em", color:t.ember, fontFamily:"sans-serif", textTransform:"uppercase" }}>
                  {m.count} Entries
                </span>
              </div>
              <p style={{ margin:"0 0 16px", fontSize:"14px", lineHeight:"1.7", color:t.inkMid, fontFamily:"Georgia,serif" }}>{m.text}</p>
              <DirBadge dir={m.dir} t={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Pattern timeline */}
      <div>
        <div style={{ fontSize:"10px", letterSpacing:"0.15em", color:t.inkDim, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:"20px" }}>
          Pattern Timeline
        </div>
        <div style={{ position:"relative", paddingLeft:"10px" }}>
          <div style={{
            position:"absolute", left:"15px", top:"8px", bottom:"8px", width:"1px",
            background:`linear-gradient(180deg,${t.ember}70,transparent)`,
          }} />
          {GROWTH.map((g, i) => (
            <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ display:"flex", gap:"22px", alignItems:"flex-start", paddingBottom:"22px" }}>
              <div style={{
                width:"18px", height:"18px", borderRadius:"50%", flexShrink:0, zIndex:1,
                background:hov===i ? t.ember : t.surface,
                border:`2px solid ${hov===i ? t.ember : t.emberLine}`,
                marginTop:"16px", transition:"all 0.2s",
                boxShadow:hov===i ? `0 0 14px ${t.ember}60` : t.shadowSm,
              }} />
              <div style={{
                flex:1, background:t.surface, borderRadius:"16px", padding:"18px 22px",
                boxShadow:hov===i ? t.shadow : t.shadowSm,
                transition:"all 0.2s",
                transform:hov===i ? "translateX(4px)" : "none",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px", flexWrap:"wrap", gap:"8px" }}>
                  <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                    <DirBadge dir={g.dir} t={t} />
                    <Badge label={g.type} color={t.inkMid} bg={t.surfaceEl} />
                  </div>
                  <span style={{ fontSize:"11px", color:t.inkDim, fontFamily:"sans-serif" }}>{g.date}</span>
                </div>
                <p style={{ margin:"0 0 10px", fontSize:"14px", lineHeight:"1.75", color:t.ink, fontStyle:"italic", fontFamily:"Georgia,serif" }}>
                  "{g.narration}"
                </p>
                <span style={{ fontSize:"11px", color:t.inkDim, fontFamily:"sans-serif" }}>Topic: {g.topic}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("home");
  const t = getT(dark);

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:t.bg, color:t.ink, transition:"background 0.3s,color 0.3s" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        textarea,input{color-scheme:${dark?"dark":"light"}}
        textarea::placeholder,input::placeholder{color:${t.inkDim}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${t.surfaceHi};border-radius:4px}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
      <Sidebar page={page} setPage={setPage} dark={dark} setDark={setDark} t={t} />
      <main style={{
        flex:1, overflowY:"auto",
        padding:"clamp(24px,4vw,52px) clamp(20px,5vw,60px)",
        background:t.bg, transition:"background 0.3s",
      }}>
        {page==="home"     && <HomePage     t={t} setPage={setPage} />}
        {page==="write"    && <WritePage    t={t} />}
        {page==="journal"  && <JournalPage  t={t} />}
        {page==="insights" && <InsightsPage t={t} />}
      </main>
    </div>
  );
}