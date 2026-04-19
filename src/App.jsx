import { useState, useRef, useEffect } from "react";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ── THEME ─────────────────────────────────────────────────────────
const T = {
  bg:        "#F8F9FA",
  surface:   "#FFFFFF",
  surface2:  "#F1F3F5",
  border:    "#DEE2E6",
  border2:   "#CED4DA",
  text:      "#212529",
  textSub:   "#6C757D",
  textMuted: "#ADB5BD",
  primary:   "#1971C2",
  primaryBg: "#E7F5FF",
  success:   "#2F9E44",
  successBg: "#EBFBEE",
  danger:    "#C92A2A",
  dangerBg:  "#FFF5F5",
  warning:   "#E67700",
  warningBg: "#FFF9DB",
  purple:    "#6741D9",
  purpleBg:  "#F3F0FF",
};

const PHASES = [
  { id:"general",        label:"General Queries",      short:"P1", color:T.primary },
  { id:"must_have",      label:"Must Have",            short:"P2", color:T.success },
  { id:"good_to_have",   label:"Good to Have",         short:"P3", color:T.warning },
  { id:"negotiation",    label:"Negotiation",          short:"P4", color:T.purple },
  { id:"recommendation", label:"Eng. Recommendations", short:"P5", color:"#E8590C" },
  { id:"complete",       label:"Complete",             short:"✓",  color:T.success },
];

const VC = { Alpha:T.primary, Beta:T.warning, Gamma:T.success, Lambda:T.purple };
const vc = n => VC[n] || T.textSub;

// ══════════════════════════════════════════════════════════════════
// HERO / LANDING PAGE — CSS animation (no canvas bugs)
// ══════════════════════════════════════════════════════════════════
function HeroPage({ onSelect }) {
  return (
    <div style={{ position:"relative", width:"100vw", height:"100vh", overflow:"hidden",
      background:"linear-gradient(160deg, #060d1a 0%, #0a1628 50%, #06101f 100%)",
      fontFamily:"'Segoe UI',sans-serif" }}>

      <style>{`
        @keyframes driveIn {
          0%   { transform: translateX(-480px); }
          100% { transform: translateX(0px); }
        }
        @keyframes carStop {
          0%   { transform: translateX(0px); }
          60%  { transform: translateX(18px); }
          80%  { transform: translateX(-4px); }
          100% { transform: translateX(0px); }
        }
        @keyframes fadeUp {
          0%   { opacity:0; transform: translateY(28px); }
          100% { opacity:1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          0%   { opacity:0; transform: translateY(-20px); }
          100% { opacity:1; transform: translateY(0); }
        }
        @keyframes roadMove {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100px); }
        }
        @keyframes beamPulse {
          0%,100% { opacity:0.7; }
          50%      { opacity:1; }
        }
        @keyframes sparkFly1 {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(-40px, -30px) scale(0); opacity:0; }
        }
        @keyframes sparkFly2 {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(-20px, -45px) scale(0); opacity:0; }
        }
        @keyframes sparkFly3 {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(-60px, -20px) scale(0); opacity:0; }
        }
        @keyframes glowPulse {
          0%,100% { text-shadow: 0 0 40px rgba(100,180,255,0.4), 0 0 80px rgba(25,113,194,0.2); }
          50%      { text-shadow: 0 0 60px rgba(100,180,255,0.7), 0 0 120px rgba(25,113,194,0.4); }
        }
        .hero-car {
          animation: driveIn 1.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards,
                     carStop 0.5s ease-in-out 1.6s forwards;
        }
        .hero-beams {
          animation: driveIn 1.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards,
                     beamPulse 2s ease-in-out 1.6s infinite;
        }
        .hero-sparks {
          animation: fadeUp 0.1s ease 1.55s both;
        }
        .spark1 { animation: sparkFly1 0.6s ease-out 1.6s both; }
        .spark2 { animation: sparkFly2 0.5s ease-out 1.65s both; }
        .spark3 { animation: sparkFly3 0.7s ease-out 1.62s both; }
        .spark4 { animation: sparkFly1 0.55s ease-out 1.7s both; }
        .spark5 { animation: sparkFly2 0.65s ease-out 1.68s both; }
        .hero-title {
          animation: fadeDown 0.9s cubic-bezier(0.16,1,0.3,1) 2.2s both,
                     glowPulse 3s ease-in-out 3.2s infinite;
        }
        .hero-sub   { animation: fadeUp 0.8s ease 2.5s both; }
        .hero-cards { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 2.8s both; }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-6px) scale(1.02) !important; }
      `}</style>

      {/* Stars */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
        {[...Array(70)].map((_,i) => (
          <circle key={i}
            cx={`${(i*137.5+50)%100}%`}
            cy={`${(i*97.3+20)%(55)}%`}
            r={i%5===0?1.3:i%3===0?0.9:0.5}
            fill="white" opacity={i%4===0?0.8:0.4}/>
        ))}
      </svg>

      {/* City silhouette */}
      <svg style={{ position:"absolute", bottom:"38%", left:0, width:"100%", height:"25%", pointerEvents:"none" }}>
        {[
          [3,60,45,100],[7,40,30,110],[12,55,55,90],[18,35,40,105],
          [23,65,60,85],[29,45,35,100],[35,70,50,80],[41,40,40,100],
          [47,58,45,92],[53,50,35,105],[60,62,55,88],[68,42,38,100],
          [73,55,48,92],[79,38,32,108],[85,60,50,90],[91,45,40,100],[96,50,35,100]
        ].map(([x,y,w,h],i) => (
          <rect key={i} x={`${x}%`} y={`${y}%`} width={`${w}px`} height={`${h}%`}
            fill={`rgba(255,255,255,${0.03+i%3*0.01})`}/>
        ))}
      </svg>

      {/* Road */}
      <div style={{ position:"absolute", bottom:"32%", left:0, right:0 }}>
        <div style={{ height:2, background:"rgba(255,255,255,0.12)" }}/>
        {/* Moving dashes */}
        <div style={{ height:4, overflow:"hidden", position:"relative" }}>
          <div style={{ display:"flex", gap:40, animation:"roadMove 0.5s linear infinite", width:"200%", height:"100%", alignItems:"center" }}>
            {[...Array(35)].map((_,i) => (
              <div key={i} style={{ width:60, height:4, background:"rgba(255,255,255,0.25)", flexShrink:0 }}/>
            ))}
          </div>
        </div>
        <div style={{ height:2, background:"rgba(255,255,255,0.06)" }}/>
      </div>

      {/* Road surface */}
      <div style={{ position:"absolute", left:0, right:0, bottom:0, height:"32%",
        background:"linear-gradient(180deg, #111827 0%, #0a0f1a 100%)" }}/>



      {/* Car */}
      <div className="hero-car" style={{ position:"absolute", bottom:"32%", left:"calc(50% - 180px)" }}>

        {/* Sparks at wheel positions */}
        <div className="hero-sparks">
          {[
            {cls:"spark1",x:88,col:"#FFD700"},{cls:"spark2",x:92,col:"#FF8C00"},
            {cls:"spark3",x:82,col:"#FFD700"},{cls:"spark4",x:298,col:"#FF8C00"},
            {cls:"spark5",x:305,col:"#FFD700"},
          ].map((s,i) => (
            <div key={i} className={s.cls} style={{
              position:"absolute", bottom:22, left:s.x,
              width:5, height:5, borderRadius:"50%", background:s.col,
              pointerEvents:"none"
            }}/>
          ))}
        </div>

        {/* SUV SVG — proper proportions */}
        <svg width="820" height="130" viewBox="0 0 820 130" style={{ display:"block", filter:"drop-shadow(0 10px 28px rgba(0,0,0,0.7))" }}>
          <defs>
            <linearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2952a3"/>
              <stop offset="30%" stopColor="#1e6fc4"/>
              <stop offset="70%" stopColor="#163d7a"/>
              <stop offset="100%" stopColor="#0d2040"/>
            </linearGradient>
            <linearGradient id="hoodG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e6fc4"/>
              <stop offset="100%" stopColor="#163d7a"/>
            </linearGradient>
            <linearGradient id="roofShine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="200" cy="126" rx="175" ry="7" fill="rgba(0,0,0,0.5)"/>

          {/* === CHASSIS / UNDERBODY === */}
          <rect x="35" y="98" width="340" height="12" rx="4" fill="#06101e"/>

          {/* === MAIN BODY (boxy SUV) === */}
          {/* Rear quarter */}
          <path d="M38 98 L32 88 L32 52 L38 46 L38 98 Z" fill="#0d2040"/>
          {/* Body side */}
          <rect x="38" y="36" width="290" height="62" rx="0" fill="url(#bodyG)"/>
          {/* Front pillar + hood area */}
          <path d="M328 36 L328 98 L368 98 L375 88 L378 72 L376 56 L368 42 L350 36 Z" fill="url(#hoodG)"/>
          {/* Hood slope */}
          <path d="M350 36 L368 42 L380 54 L382 36 Z" fill="#1a5090"/>

          {/* Body top edge highlight */}
          <rect x="38" y="36" width="312" height="4" rx="0" fill="rgba(255,255,255,0.12)"/>

          {/* === ROOF (flat boxy SUV roof) === */}
          <rect x="60" y="14" width="255" height="24" rx="3" fill="#16325c"/>
          <rect x="60" y="14" width="255" height="10" rx="3" fill="url(#roofShine)"/>

          {/* Roof rack */}
          <rect x="70" y="11" width="235" height="4" rx="2" fill="rgba(200,200,220,0.35)"/>
          {[90,120,155,190,225,260,285].map(rx => (
            <rect key={rx} x={rx} y="10" width="3" height="7" rx="1" fill="rgba(180,180,200,0.3)"/>
          ))}

          {/* A-pillar */}
          <path d="M60 14 L60 38 L95 38 L115 14 Z" fill="#14305a"/>
          {/* C-pillar */}
          <path d="M315 14 L295 38 L315 38 Z" fill="#14305a"/>
          {/* D-pillar (rear) */}
          <path d="M315 14 L315 38 L330 38 L330 20 Z" fill="#0f2448"/>

          {/* === WINDOWS === */}
          {/* Windshield — large, slightly raked */}
          <path d="M62 37 L98 15 L168 15 L168 38 Z" fill="rgba(120,185,255,0.55)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
          {/* Window 1 (front door) */}
          <rect x="170" y="15" width="70" height="23" rx="1" fill="rgba(100,165,255,0.45)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
          {/* Window 2 (rear door) */}
          <rect x="244" y="15" width="68" height="23" rx="1" fill="rgba(85,150,240,0.4)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>
          {/* Quarter glass */}
          <path d="M316 15 L314 38 L328 38 L330 18 Z" fill="rgba(70,130,210,0.35)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>

          {/* === DOOR LINES === */}
          <line x1="170" y1="14" x2="167" y2="98" stroke="rgba(0,0,0,0.35)" strokeWidth="2"/>
          <line x1="244" y1="14" x2="244" y2="98" stroke="rgba(0,0,0,0.35)" strokeWidth="2"/>
          <line x1="314" y1="14" x2="316" y2="98" stroke="rgba(0,0,0,0.35)" strokeWidth="2"/>

          {/* Door handles */}
          <rect x="190" y="68" width="28" height="5" rx="2.5" fill="rgba(200,210,230,0.5)"/>
          <rect x="264" y="68" width="28" height="5" rx="2.5" fill="rgba(200,210,230,0.5)"/>

          {/* === FRONT DETAILS === */}
          {/* Front bumper */}
          <path d="M368 98 L380 90 L384 76 L384 100 L368 100 Z" fill="#0a1830"/>
          <rect x="370" y="94" width="14" height="4" rx="1" fill="#1560a0" opacity="0.7"/>

          {/* Grill */}
          <rect x="366" y="56" width="16" height="28" rx="2" fill="#040c18"/>
          <rect x="368" y="48" width="14" height="8" rx="1" fill="#060e1c"/>
          {[59,64,69,74,79].map((gy,i) => (
            <line key={i} x1="367" y1={gy} x2="381" y2={gy} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          ))}
          {/* Grill badge */}
          <rect x="371" y="65" width="8" height="8" rx="1" fill="#1971C2" opacity="0.8"/>

          {/* Headlight — sleek angular */}
          <path d="M362 44 L380 44 L384 52 L384 60 L378 62 L362 58 Z" fill="#060e20"/>
          <path d="M364 46 L378 46 L382 52 L364 56 Z" fill="rgba(255,230,100,0.85)"/>
          <path d="M366 48 L376 48 L379 52 L366 54 Z" fill="rgba(255,245,180,0.95)"/>
          {/* DRL strip */}
          <rect x="358" y="42" width="24" height="3" rx="1.5" fill="#7ec8e3"/>
          <rect x="358" y="42" width="24" height="1.5" rx="1" fill="rgba(255,255,255,0.6)"/>

          {/* Headlight beams — inside SVG so they stay with car */}
          <defs>
            <linearGradient id="beam1" x1="0" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="rgba(255,220,80,0.45)"/>
              <stop offset="100%" stopColor="rgba(255,220,80,0)"/>
            </linearGradient>
            <linearGradient id="beam2" x1="0" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="rgba(255,240,140,0.6)"/>
              <stop offset="100%" stopColor="rgba(255,240,140,0)"/>
            </linearGradient>
          </defs>
          <polygon points="382,52 820,5 820,100" fill="url(#beam1)"/>
          <polygon points="382,52 650,20 650,84" fill="url(#beam2)"/>

          {/* === TAIL LIGHTS === */}
          <rect x="30" y="44" width="9" height="32" rx="2" fill="#8b0000"/>
          <rect x="31" y="45" width="6" height="28" rx="1" fill="#cc1111"/>
          <rect x="32" y="46" width="3" height="12" rx="1" fill="rgba(255,80,80,0.9)"/>
          {/* Tail light strip */}
          <rect x="38" y="44" width="3" height="32" fill="rgba(180,0,0,0.4)"/>

          {/* Side mirror */}
          <rect x="356" y="46" width="16" height="11" rx="2" fill="#0e2444"/>
          <rect x="357" y="47" width="13" height="8" rx="1" fill="#1a3060"/>

          {/* Side skirt */}
          <rect x="38" y="96" width="330" height="6" rx="2" fill="rgba(0,0,0,0.5)"/>
          {/* Chrome strip */}
          <rect x="38" y="93" width="330" height="2" fill="rgba(200,210,230,0.2)"/>

          {/* Under glow */}
          <ellipse cx="200" cy="110" rx="150" ry="6" fill="rgba(25,113,194,0.18)"/>

          {/* === WHEELS === */}
          {[95, 305].map(wx => (
            <g key={wx} transform={`translate(${wx}, 108)`}>
              {/* Tyre */}
              <circle r="30" fill="#0c0c0c"/>
              <circle r="29" fill="none" stroke="#1a1a1a" strokeWidth="2"/>
              {/* Rim */}
              <circle r="22" fill="#222"/>
              {/* 6 spokes */}
              {[0,60,120,180,240,300].map(deg => (
                <g key={deg} transform={`rotate(${deg})`}>
                  <rect x="-2.5" y="-20" width="5" height="15" rx="2" fill="#c0c0c0"/>
                  <rect x="-1" y="-20" width="2" height="15" rx="1" fill="rgba(255,255,255,0.3)"/>
                </g>
              ))}
              {/* Center */}
              <circle r="7" fill="#444"/>
              <circle r="4.5" fill="#1971C2"/>
              <circle r="2" fill="rgba(255,255,255,0.5)"/>
              {/* Brake disc */}
              <circle r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
              <circle r="12" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </g>
          ))}
        </svg>
      </div>

      {/* KAVACH title */}
      <div className="hero-title" style={{ position:"absolute", top:"10%", left:0, right:0, textAlign:"center", zIndex:10 }}>
        <div style={{ fontSize:"clamp(52px,8vw,96px)", fontWeight:900, color:"#fff", letterSpacing:"-3px", lineHeight:1 }}>
          KAVACH
        </div>
      </div>

      {/* Subtitle */}
      <div className="hero-sub" style={{ position:"absolute", top:"calc(10% + clamp(56px,9vw,104px))", left:0, right:0, textAlign:"center", zIndex:10 }}>
        <div style={{ fontSize:"clamp(10px,1.2vw,14px)", color:"rgba(255,255,255,0.6)", letterSpacing:".22em" }}>
          AI-POWERED SUPPLIER EVALUATION SYSTEM
        </div>
      </div>

      {/* Cards */}
      <div className="hero-cards" style={{ position:"absolute", bottom:"4%", left:0, right:0,
        display:"flex", gap:20, justifyContent:"center", flexWrap:"wrap", padding:"0 20px", zIndex:10 }}>
        {[
          { id:"oem", icon:"🏭", title:"Login as OEM", desc:"Design Engineer — Upload RFI, evaluate supplier variants, generate compliance reports", btn:"Enter as OEM →", bg:"#1971C2" },
          { id:"supplier", icon:"🔧", title:"Login as Supplier", desc:"Application Engineer — Upload your catalogue to make it available for evaluation", btn:"Enter as Supplier →", bg:"#2F9E44" }
        ].map(card => (
          <div key={card.id} className="card-hover" onClick={() => onSelect(card.id)}
            style={{ background:"rgba(255,255,255,0.95)", borderRadius:16, padding:"24px 26px", width:250,
              boxShadow:"0 20px 60px rgba(0,0,0,0.5)", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>{card.icon}</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#1a1a2e", marginBottom:6 }}>{card.title}</div>
            <div style={{ fontSize:11, color:"#555", lineHeight:1.6, marginBottom:16 }}>{card.desc}</div>
            <div style={{ background:card.bg, color:"#fff", padding:"9px 20px", borderRadius:8, fontSize:12, fontWeight:700 }}>{card.btn}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════
// SUPPLIER PORTAL
// ══════════════════════════════════════════════════════════════════
function SupplierPortal({ onBack }) {
  const [companyName, setCompanyName] = useState("");
  const [file, setFile]               = useState(null);
  const [status, setStatus]           = useState("idle"); // idle|uploading|done|error
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState("");

  const handleUpload = async () => {
    if (!companyName.trim()) { setError("Please enter your company name."); return; }
    if (!file) { setError("Please select a catalogue file."); return; }
    setError(""); setStatus("uploading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("supplierName", companyName.trim());
      const r = await fetch(`${SERVER}/upload/supplier`, { method:"POST", body:fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setStatus("done"); setResult(d);
    } catch(e) { setStatus("error"); setError(e.message); }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"0 24px", height:56, display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:T.textSub, fontSize:13, display:"flex", alignItems:"center", gap:4 }}>← Back</button>
        <div style={{ width:1, height:16, background:T.border }}/>
        <span style={{ fontWeight:700, fontSize:16, color:T.text }}>KAVACH</span>
        <span style={{ fontSize:12, color:T.textSub }}>Supplier Portal</span>
        <div style={{ marginLeft:"auto", padding:"3px 10px", borderRadius:20, background:T.successBg, color:T.success, fontSize:11, fontWeight:600 }}>SUPPLIER</div>
      </div>

      <div style={{ maxWidth:560, margin:"60px auto", padding:"0 24px" }}>

        <div style={{ background:T.surface, borderRadius:12, border:`1px solid ${T.border}`, padding:36, boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize:22, fontWeight:700, color:T.text, marginBottom:6 }}>Upload Product Catalogue</div>
          <div style={{ fontSize:13, color:T.textSub, marginBottom:28, lineHeight:1.6 }}>Upload your eAxle product catalogue to make your variants available for TML evaluation.</div>

          {status === "done" ? (
            <div style={{ textAlign:"center", padding:24 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:18, fontWeight:700, color:T.success, marginBottom:8 }}>Catalogue Uploaded Successfully</div>
              <div style={{ fontSize:13, color:T.textSub, marginBottom:16 }}>Your catalogue is now available for TML evaluation.</div>
              <div style={{ background:T.surface2, borderRadius:8, padding:14, textAlign:"left", marginBottom:16 }}>
                <div style={{ fontSize:12, color:T.textSub, marginBottom:4 }}>Company</div>
                <div style={{ fontWeight:600, color:T.text }}>{companyName}</div>
                <div style={{ fontSize:12, color:T.textSub, marginTop:8, marginBottom:4 }}>Variants uploaded</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {result?.variants_found?.map(v => (
                    <span key={v} style={{ background:T.primaryBg, color:T.primary, padding:"2px 10px", borderRadius:20, fontSize:12, fontWeight:500 }}>{v}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => { setStatus("idle"); setFile(null); setResult(null); setCompanyName(""); }}
                style={{ background:T.surface2, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 20px", fontSize:13, cursor:"pointer", color:T.text }}>
                Upload Another
              </button>
            </div>
          ) : (
            <>
              {/* Company name */}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, color:T.text, display:"block", marginBottom:6 }}>Company Name *</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Supplier X Technologies"
                  style={{ width:"100%", padding:"10px 12px", border:`1px solid ${T.border2}`, borderRadius:8, fontSize:13, color:T.text, background:T.surface, outline:"none", boxSizing:"border-box" }}/>
              </div>

              {/* File upload */}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, color:T.text, display:"block", marginBottom:6 }}>Product Catalogue (.xlsx) *</label>
                <label style={{ display:"block", border:`2px dashed ${file ? T.success : T.border2}`, borderRadius:8, padding:24, textAlign:"center", cursor:"pointer", background: file ? T.successBg : T.surface2, transition:"all .2s" }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{file ? "📄" : "📂"}</div>
                  <div style={{ fontSize:13, color: file ? T.success : T.textSub, fontWeight: file ? 600 : 400 }}>
                    {file ? file.name : "Click to choose .xlsx file"}
                  </div>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={e => setFile(e.target.files[0])} style={{ display:"none" }}/>
                </label>
              </div>

              {error && <div style={{ background:T.dangerBg, border:`1px solid #FFC9C9`, borderRadius:8, padding:"10px 14px", fontSize:13, color:T.danger, marginBottom:16 }}>⚠ {error}</div>}

              <button onClick={handleUpload} disabled={status==="uploading"}
                style={{ width:"100%", padding:"12px", background:status==="uploading"?T.border:T.success, color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:status==="uploading"?"not-allowed":"pointer" }}>
                {status==="uploading" ? "⏳ Uploading…" : "Upload Catalogue"}
              </button>
            </>
          )}
        </div>

        {/* Info card */}
        <div style={{ background:T.primaryBg, border:`1px solid #BAC8FF`, borderRadius:12, padding:16, marginTop:16 }}>
          <div style={{ fontSize:12, fontWeight:600, color:T.primary, marginBottom:6 }}>📋 What happens after upload?</div>
          <div style={{ fontSize:12, color:T.textSub, lineHeight:1.7 }}>
            Your catalogue will be available for TML's evaluation system. TML engineers will be able to select your company and run an automated multi-variant compliance evaluation against their RFI requirements.
          </div>
        </div>

        {/* View past conversations */}
        {(status==="done"||companyName) && (
          <SupplierConversations companyName={companyName} />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SUPPLIER CONVERSATIONS VIEW
// ══════════════════════════════════════════════════════════════════
function SupplierConversations({ companyName }) {
  const [convs, setConvs]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [selConv, setSelConv] = useState(null);
  const [convData, setConvData] = useState(null);
  const [loadingConv, setLoadingConv] = useState(false);

  const load = async () => {
    if (!companyName?.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${SERVER}/conversations/${encodeURIComponent(companyName)}`);
      const d = await r.json();
      setConvs(d.conversations || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if(companyName) load(); }, [companyName]);

  const openConv = async (id) => {
    setSelConv(id); setLoadingConv(true);
    try {
      const r = await fetch(`${SERVER}/conversation/${id}`);
      const d = await r.json();
      setConvData(d);
    } catch(e) { console.error(e); }
    setLoadingConv(false);
  };

  if (!companyName?.trim()) return null;

  return (
    <div style={{ marginTop:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Past Evaluations</div>
        <button onClick={load} style={{ background:T.surface2, border:`1px solid ${T.border}`, borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer", color:T.textSub }}>↻ Refresh</button>
      </div>

      {loading && <div style={{ fontSize:12, color:T.textMuted, padding:12 }}>Loading…</div>}

      {!loading && convs.length===0 && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:20, textAlign:"center" }}>
          <div style={{ fontSize:24, marginBottom:8 }}>📭</div>
          <div style={{ fontSize:12, color:T.textSub }}>No evaluations yet for {companyName}</div>
        </div>
      )}

      {convs.map(c => (
        <div key={c.id} onClick={() => openConv(c.id)}
          style={{ background:T.surface, border:`1px solid ${selConv===c.id?T.primary:T.border}`, borderRadius:10, padding:14, marginBottom:8, cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.text }}>Evaluation — {new Date(c.savedAt).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</div>
            <div style={{ fontSize:11, color:T.textSub }}>{new Date(c.savedAt).toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:T.successBg, color:T.success, fontWeight:600 }}>{c.summary?.active||0} Active</span>
            {(c.summary?.eliminated||0)>0 && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:T.dangerBg, color:T.danger, fontWeight:600 }}>{c.summary.eliminated} Eliminated</span>}
          </div>
        </div>
      ))}

      {/* Conversation detail modal — supplier POV */}
      {selConv && convData && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:16 }}>
          <div style={{ background:T.surface, borderRadius:14, width:"100%", maxWidth:700, maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.2)" }}>

            {/* Modal header */}
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Evaluation — {new Date(convData.savedAt).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</div>
                <div style={{ fontSize:11, color:T.textSub, marginTop:2 }}>Supplier perspective — your messages on left, TML on right</div>
              </div>
              <button onClick={() => { setSelConv(null); setConvData(null); }}
                style={{ background:T.surface2, border:`1px solid ${T.border}`, borderRadius:6, padding:"6px 14px", fontSize:12, cursor:"pointer", color:T.text }}>Close</button>
            </div>

            {/* Variant results summary */}
            {convData.variantResults?.length>0 && (
              <div style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", gap:8, flexWrap:"wrap" }}>
                {convData.variantResults.map(v => (
                  <div key={v.name} style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600,
                    background:v.status==="active"?T.successBg:T.dangerBg,
                    color:v.status==="active"?T.success:T.danger }}>
                    {v.name} — {v.status==="active"?"PASSED":"ELIMINATED"}
                    {v.status==="active" && ` (MH ${v.mhPassed}/${v.mhTotal})`}
                  </div>
                ))}
              </div>
            )}

            {loadingConv && <div style={{ padding:20, textAlign:"center", color:T.textMuted }}>Loading conversation…</div>}

            {/* Messages — SUPPLIER POV (supplier left, TML right) */}
            {!loadingConv && (
              <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:8 }}>
                {/* Shared messages (Phase 1) */}
                {(convData.sharedMessages||[]).filter(m=>m.type==="msg"||m.type==="divider").map(msg => {
                  if (msg.type==="divider") return (
                    <div key={msg.id} style={{ display:"flex", alignItems:"center", gap:8, margin:"6px 0" }}>
                      <div style={{ flex:1, height:1, background:T.border }}/>
                      <span style={{ fontSize:10, fontWeight:600, color:T.textMuted, whiteSpace:"nowrap" }}>{msg.text}</span>
                      <div style={{ flex:1, height:1, background:T.border }}/>
                    </div>
                  );
                  // FLIPPED: supplier=left, tml=right
                  const isSupplier = msg.role==="supplier";
                  return (
                    <div key={msg.id} style={{ display:"flex", flexDirection:isSupplier?"row":"row-reverse", gap:8, alignItems:"flex-end" }}>
                      <div style={{ width:28,height:28,borderRadius:8,background:isSupplier?T.successBg:T.primaryBg,border:`1.5px solid ${isSupplier?T.success:T.primary}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:isSupplier?T.success:T.primary,flexShrink:0 }}>
                        {isSupplier?"YOU":"TML"}
                      </div>
                      <div style={{ maxWidth:"72%" }}>
                        <div style={{ fontSize:10, color:T.textMuted, marginBottom:3, textAlign:isSupplier?"left":"right" }}>
                          {isSupplier?"You (Supplier Engineer)":"TML Design Engineer"}
                        </div>
                        <div style={{ padding:"10px 14px", borderRadius:10, fontSize:13, lineHeight:1.65,
                          background:isSupplier?`${T.success}10`:T.surface,
                          border:`1px solid ${isSupplier?T.success+"30":T.border}`,
                          color:T.text,
                          borderTopLeftRadius:isSupplier?2:10, borderTopRightRadius:isSupplier?10:2,
                          boxShadow:"0 1px 4px rgba(0,0,0,.05)" }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Variant chats */}
                {Object.entries(convData.variantChats||{}).map(([vname, msgs]) => (
                  <div key={vname}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.textSub, margin:"12px 0 6px", paddingLeft:4 }}>— {vname} —</div>
                    {msgs.filter(m=>m.type==="msg").map(msg => {
                      const isSupplier = msg.role==="supplier";
                      return (
                        <div key={msg.id} style={{ display:"flex", flexDirection:isSupplier?"row":"row-reverse", gap:8, alignItems:"flex-end", marginBottom:8 }}>
                          <div style={{ width:28,height:28,borderRadius:8,background:isSupplier?T.successBg:T.primaryBg,border:`1.5px solid ${isSupplier?T.success:T.primary}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:isSupplier?T.success:T.primary,flexShrink:0 }}>
                            {isSupplier?"YOU":"TML"}
                          </div>
                          <div style={{ maxWidth:"72%" }}>
                            <div style={{ fontSize:10, color:T.textMuted, marginBottom:3, textAlign:isSupplier?"left":"right" }}>
                              {isSupplier?`You — ${vname}`:"TML Design Engineer"}
                            </div>
                            <div style={{ padding:"10px 14px", borderRadius:10, fontSize:13, lineHeight:1.65,
                              background:isSupplier?`${T.success}10`:T.surface,
                              border:`1px solid ${isSupplier?T.success+"30":T.border}`,
                              color:T.text,
                              borderTopLeftRadius:isSupplier?2:10, borderTopRightRadius:isSupplier?10:2,
                              boxShadow:"0 1px 4px rgba(0,0,0,.05)" }}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// OEM PORTAL  
// ══════════════════════════════════════════════════════════════════
function OEMPortal({ onBack }) {
  const [step, setStep]         = useState("setup"); // setup | evaluating
  const [rfiFile, setRfiFile]   = useState(null);
  const [rfiSt,   setRfiSt]     = useState("idle");
  const [rfiMeta, setRfiMeta]   = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selSupplier, setSelSupplier] = useState(null);
  const [supLoading, setSupLoading]   = useState(false);

  // Evaluation state
  const [variants,   setVariants]   = useState([]);
  const [activeTab,  setActiveTab]  = useState(null);
  const [shared,     setShared]     = useState([]);
  const [varChat,    setVarChat]    = useState({});
  const [phase,      setPhase]      = useState("idle");
  const [loading,    setLoading]    = useState(false);
  const [typing,     setTyping]     = useState(null);
  const [report,     setReport]     = useState(null);
  const [showRpt,    setShowRpt]    = useState(false);
  const [genRpt,     setGenRpt]     = useState(false);

  const chatRef  = useRef(null);
  const stopRef  = useRef(false);
  const vStateRef = useRef([]);

  useEffect(() => { if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [shared, varChat, typing, activeTab]);

  const wait = ms => new Promise(r => setTimeout(r, ms));

  // Load available suppliers
  const loadSuppliers = async () => {
    setSupLoading(true);
    try {
      const r = await fetch(`${SERVER}/suppliers`);
      const d = await r.json();
      setSuppliers(d.suppliers || []);
    } catch(e) { console.error(e); }
    setSupLoading(false);
  };

  useEffect(() => { loadSuppliers(); }, []);

  // Upload RFI
  const uploadRFI = async (file) => {
    setRfiSt("uploading");
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`${SERVER}/upload/rfi`, { method:"POST", body:fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setRfiSt("done"); setRfiMeta(d);
    } catch(e) { setRfiSt("error"); console.error(e); }
  };

  // Select supplier — load their catalogue
  const selectSupplier = async (sup) => {
    setSelSupplier(sup);
    try {
      await fetch(`${SERVER}/select/supplier`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ supplierName: sup.name })
      });
    } catch(e) { console.error(e); }
  };

  const localSharedRef = useRef([]);

  const addShared = (role, text, type="msg") => {
    if (!text?.trim()) return;
    const msg = { role, text:text.trim(), type, id:Date.now()+Math.random() };
    setShared(p => [...p, msg]);
    // Also track in ref for save
    localSharedRef.current.push(msg);
  };

  const localVarChatRef = useRef({});

  const addVar = (vn, role, text, type="msg") => {
    if (!text?.trim()) return;
    const msg = { role, text:text.trim(), type, id:Date.now()+Math.random() };
    setVarChat(p => ({ ...p, [vn]: [...(p[vn]||[]), msg] }));
    // Also track in ref for save — works synchronously unlike state
    if (!localVarChatRef.current[vn]) localVarChatRef.current[vn] = [];
    localVarChatRef.current[vn].push(msg);
  };

  const callAI = async (agent, history, extra={}) => {
    const trimmed = history.slice(-10);
    for (let i=0; i<3; i++) {
      try {
        const r = await fetch(`${SERVER}/api/ai`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ agent, messages:trimmed, ...extra })
        });
        if (!r.ok) { if(i<2){await wait(1500*(i+1));continue;} return ""; }
        const d = await r.json();
        if (d.error) { if(i<2){await wait(1500*(i+1));continue;} return ""; }
        const text = (d?.choices?.[0]?.message?.content||"").trim();
        if (!text && i<2) { await wait(1000); continue; }
        return text;
      } catch(e) { if(i<2){await wait(1500*(i+1));continue;} return ""; }
    }
    return "";
  };

  const updateV = (name, updates) => {
    const idx = vStateRef.current.findIndex(v => v.name===name);
    if (idx>=0) Object.assign(vStateRef.current[idx], updates);
    setVariants([...vStateRef.current]);
  };

  const startEval = async () => {
    if (loading || rfiSt!=="done" || !selSupplier) return;
    stopRef.current = false;
    setLoading(true);
    setShared([]); setVarChat({}); setReport(null);
    setPhase("general");
    setStep("evaluating");
    // Reset refs for fresh tracking
    localSharedRef.current = [];
    localVarChatRef.current = {};

    // Get supplier variants
    const supRes = await fetch(`${SERVER}/data/supplier`).then(r=>r.json());
    const vNames = supRes.variants?.map(v=>v.name) || [];

    if (!vNames.length) { addShared("error","No variants found in selected supplier catalogue.","error"); setLoading(false); return; }

    const init = vNames.map(name => ({
      name, status:"active", mhPassed:0, mhTotal:rfiMeta?.must_have_count||4,
      gthMatched:0, gthTotal:rfiMeta?.good_to_have_count||7,
      deviations:[], history:[], eliminatedAt:null, eliminationReason:null
    }));
    vStateRef.current = init;
    setVariants([...init]);
    setActiveTab(vNames[0]);

    // ── PHASE 1 ───────────────────────────────────────────────────
    addShared("divider", "PHASE 1 — GENERAL PROJECT QUERIES", "divider");
    const sharedHist = [];
    const seed = "We have received your RFI submission. Please proceed with your questions about this project.";
    addShared("tml", seed);
    localSharedRef.current.push({ role:"tml", text:seed, type:"msg", id:Date.now()+Math.random() });
    sharedHist.push({ role:"user", content:seed });

    for (let i=0; i<4; i++) {
      if (stopRef.current) break;
      setTyping({ v:"SUP", role:"supplier" });
      const supQ = await callAI("supplier", sharedHist, { phase:"general", variant:vNames[0] });
      setTyping(null);
      if (!supQ) continue;
      addShared("supplier", supQ);
      localSharedRef.current.push({ role:"supplier", text:supQ, type:"msg", id:Date.now()+Math.random() });
      sharedHist.push({ role:"assistant", content:supQ });
      await wait(300);

      setTyping({ v:"TML", role:"tml" });
      const tmlA = await callAI("tml", sharedHist, { phase:"general" });
      setTyping(null);
      if (!tmlA) continue;
      addShared("tml", tmlA);
      localSharedRef.current.push({ role:"tml", text:tmlA, type:"msg", id:Date.now()+Math.random() });
      sharedHist.push({ role:"user", content:tmlA });
      await wait(300);
    }

    vStateRef.current.forEach(v => { v.history = [...sharedHist]; });

    // ── PHASE 2: MUST HAVE ────────────────────────────────────────
    addShared("divider", "PHASE 2 — MUST HAVE VERIFICATION  [ALL VARIANTS]", "divider");
    setPhase("must_have");

    let mhList = [];
    try { const rd = await fetch(`${SERVER}/data/rfi`).then(r=>r.json()); mhList = rd.must_have||[]; } catch{}

    let det = {};
    try {
      const dr = await fetch(`${SERVER}/evaluate/all_must_have`,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
      if (!dr.ok) throw new Error(`HTTP ${dr.status}`);
      det = await dr.json();
      if (det.error) throw new Error(det.error);
    } catch(e) {
      addShared("error",`⚠ Evaluation error: ${e.message}`,"error");
    }

    for (let i=0; i<mhList.length; i++) {
      if (stopRef.current) break;
      const req = mhList[i]; if (!req) continue;

      for (const v of vStateRef.current.filter(x=>x.status==="active")) {
        if (stopRef.current) break;
        setActiveTab(v.name); await wait(100);

        const detRow = det[v.name]?.[i];
        const passes  = detRow ? detRow.pass : true;
        const offered = detRow?.offered || "";
        const reason  = detRow?.reason  || "";

        setTyping({ v:v.name, role:"tml" });
        const tmlQ = await callAI("tml", v.history.slice(-4), { phase:"must_have", variant:v.name, reqParam:req.parameter, reqVal:req.requirement });
        setTyping(null);
        if (tmlQ) { addVar(v.name,"tml",tmlQ); v.history.push({role:"user",content:tmlQ});
          if(!localVarChatRef.current[v.name]) localVarChatRef.current[v.name]=[];
          localVarChatRef.current[v.name].push({role:"tml",text:tmlQ,type:"msg",id:Date.now()+Math.random()});
        }
        await wait(600);

        setTyping({ v:v.name, role:"supplier" });
        const supA = await callAI("supplier", v.history.slice(-4), { phase:"must_have", variant:v.name, reqParam:req.parameter, reqVal:req.requirement });
        setTyping(null);
        if (supA) { addVar(v.name,"supplier",supA); v.history.push({role:"assistant",content:supA});
          if(!localVarChatRef.current[v.name]) localVarChatRef.current[v.name]=[];
          localVarChatRef.current[v.name].push({role:"supplier",text:supA,type:"msg",id:Date.now()+Math.random()});
        }
        await wait(600);

        if (!passes) {
          const vetoMsg = `VETO: ${req.parameter} does not meet our requirement. Required: ${req.requirement}. Offered: ${offered}. ${reason}`;
          addVar(v.name,"tml",vetoMsg);
          v.history.push({role:"user",content:vetoMsg});
          addVar(v.name,"veto",`${v.name} ELIMINATED\n${req.parameter}: required ${req.requirement}, offered ${offered}\n${reason}`,"veto");
          updateV(v.name,{status:"eliminated",eliminatedAt:req.parameter,eliminationReason:reason});
        } else {
          const ok = `Confirmed — ${req.parameter} meets our requirement. ${v.name} offers ${offered}.`;
          addVar(v.name,"tml",ok); v.history.push({role:"user",content:ok});
          v.mhPassed++; updateV(v.name,{mhPassed:v.mhPassed});
        }
        await wait(100);
      }
    }

    const active = vStateRef.current.filter(v=>v.status==="active");
    if (!active.length) {
      addShared("info","All variants eliminated in Must Have verification.","info");
      setPhase("complete"); setLoading(false); setTyping(null); return;
    }

    // ── PHASE 3: GTH ──────────────────────────────────────────────
    addShared("divider","PHASE 3 — GOOD TO HAVE PREFERENCES  [ACTIVE VARIANTS]","divider");
    setPhase("good_to_have");
    let gthList = [];
    try { const rd = await fetch(`${SERVER}/data/rfi`).then(r=>r.json()); gthList = rd.good_to_have||[]; } catch{}

    for (let i=0; i<gthList.length; i++) {
      if (stopRef.current) break;
      const req = gthList[i]; if (!req) continue;

      for (const v of vStateRef.current.filter(x=>x.status==="active")) {
        if (stopRef.current) break;
        setActiveTab(v.name);

        const gthCtx = [
          {role:"user",content:`Must Have verification complete for ${v.name}. Now checking Good to Have preferences.`},
          {role:"assistant",content:`Ready to discuss Good to Have preferences for ${v.name}.`}
        ];

        setTyping({ v:v.name, role:"tml" });
        const tmlQ2 = await callAI("tml", gthCtx, { phase:"good_to_have", variant:v.name, reqParam:req.parameter, reqVal:req.requirement });
        setTyping(null);
        if (tmlQ2) {
          addVar(v.name,"tml",tmlQ2);
          if(!localVarChatRef.current[v.name]) localVarChatRef.current[v.name]=[];
          localVarChatRef.current[v.name].push({role:"tml",text:tmlQ2,type:"msg",id:Date.now()+Math.random()});
        }
        await wait(500);

        const supGthCtx = [...gthCtx, {role:"user",content:tmlQ2||`Regarding ${req.parameter} — our preference is ${req.requirement}. What does your variant offer?`}];

        setTyping({ v:v.name, role:"supplier" });
        const supA = await callAI("supplier", supGthCtx, { phase:"good_to_have", variant:v.name, reqParam:req.parameter, reqVal:req.requirement });
        setTyping(null);
        if (supA) {
          addVar(v.name,"supplier",supA);
          v.history.push({role:"user",content:`[GTH] ${req.parameter}: ${tmlQ2||req.requirement}`});
          v.history.push({role:"assistant",content:supA});
          if(!localVarChatRef.current[v.name]) localVarChatRef.current[v.name]=[];
          localVarChatRef.current[v.name].push({role:"supplier",text:supA,type:"msg",id:Date.now()+Math.random()});
        }

        const miss = ["does not","below","non compliant","not meet","unable","not available"].some(w=>supA.toLowerCase().includes(w));
        if (miss) {
          addVar(v.name,"deviation",`[GTH] ${req.parameter}: ${supA.substring(0,120)}`,"deviation");
          v.deviations.push(`[GTH] ${req.parameter}`);
          updateV(v.name,{deviations:[...v.deviations]});
        } else { v.gthMatched++; updateV(v.name,{gthMatched:v.gthMatched}); }
        await wait(500);
      }
    }

    // ── PHASE 4: NEGOTIATION ──────────────────────────────────────
    addShared("divider","PHASE 4 — TECHNICAL NEGOTIATION  [AI DRIVEN]","divider");
    setPhase("negotiation");

    for (const v of vStateRef.current.filter(x=>x.status==="active")) {
      if (stopRef.current) break;
      setActiveTab(v.name);
      for (let i=0; i<2; i++) {
        setTyping({v:v.name,role:"tml"});
        const q = await callAI("tml",v.history,{phase:"negotiation",variant:v.name});
        setTyping(null);
        if (q) { addVar(v.name,"tml",q); v.history.push({role:"user",content:q});
          if(!localVarChatRef.current[v.name]) localVarChatRef.current[v.name]=[];
          localVarChatRef.current[v.name].push({role:"tml",text:q,type:"msg",id:Date.now()+Math.random()});
        }
        await wait(300);
        setTyping({v:v.name,role:"supplier"});
        const a = await callAI("supplier",v.history,{phase:"negotiation",variant:v.name});
        setTyping(null);
        if (a) { addVar(v.name,"supplier",a); v.history.push({role:"assistant",content:a});
          if(!localVarChatRef.current[v.name]) localVarChatRef.current[v.name]=[];
          localVarChatRef.current[v.name].push({role:"supplier",text:a,type:"msg",id:Date.now()+Math.random()});
        }
        await wait(300);
      }
    }

    // ── PHASE 5: RECOMMENDATIONS ──────────────────────────────────
    addShared("divider","PHASE 5 — ENGINEERING RECOMMENDATIONS  [AI DRIVEN]","divider");
    setPhase("recommendation");

    for (const v of vStateRef.current.filter(x=>x.status==="active")) {
      if (stopRef.current) break;
      setActiveTab(v.name);
      setTyping({v:v.name,role:"tml"});
      const q = await callAI("tml",v.history,{phase:"recommendation",variant:v.name});
      setTyping(null);
      if (q) { addVar(v.name,"tml",q); v.history.push({role:"user",content:q});
        if(!localVarChatRef.current[v.name]) localVarChatRef.current[v.name]=[];
        localVarChatRef.current[v.name].push({role:"tml",text:q,type:"msg",id:Date.now()+Math.random()});
      }
      await wait(300);
      setTyping({v:v.name,role:"supplier"});
      const a = await callAI("supplier",v.history,{phase:"recommendation",variant:v.name});
      setTyping(null);
      if (a) { addVar(v.name,"supplier",a); v.history.push({role:"assistant",content:a});
        if(!localVarChatRef.current[v.name]) localVarChatRef.current[v.name]=[];
        localVarChatRef.current[v.name].push({role:"supplier",text:a,type:"msg",id:Date.now()+Math.random()});
      }
      await wait(300);
    }

    setPhase("complete"); setLoading(false); setTyping(null);

    // Auto-save — use localShared and localVarChat (accumulated during eval)
    if (selSupplier) {
      try {
        await fetch(`${SERVER}/api/save-conversation`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            supplierName: selSupplier.name,
            sharedMessages: localSharedRef.current,
            variantChats: localVarChatRef.current,
            variantResults: vStateRef.current.map(v=>({
              name:v.name, status:v.status,
              mhPassed:v.mhPassed, mhTotal:v.mhTotal,
              gthMatched:v.gthMatched||0, gthTotal:v.gthTotal,
              deviations:v.deviations,
              eliminatedAt:v.eliminatedAt, eliminationReason:v.eliminationReason
            }))
          })
        });
        console.log("✅ Conversation saved — shared:", localSharedRef.current.length, "variants:", Object.keys(localVarChatRef.current).join(", "));
      } catch(e) { console.error("Save failed:", e); }
    }
  };

  const generateReport = async () => {
    setGenRpt(true); setShowRpt(true);
    try {
      const r = await fetch(`${SERVER}/api/report`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          variantResults:vStateRef.current.map(v=>({name:v.name,status:v.status,mhPassed:v.mhPassed,mhTotal:v.mhTotal,gthMatched:v.gthMatched,gthTotal:v.gthTotal,deviations:v.deviations,eliminationReason:v.eliminationReason})),
          conversation:Object.entries(varChat).flatMap(([vn,msgs])=>msgs.filter(m=>m.type==="msg").map(m=>({role:m.role==="tml"?"user":"assistant",content:`[${vn}] ${m.text}`}))).slice(-40)
        })
      });
      const d = await r.json();
      setReport(d.report||{raw:d.raw,error:d.parse_error});
    } catch(e) { setReport({error:e.message}); }
    setGenRpt(false);
  };

  const phIdx   = PHASES.findIndex(p=>p.id===phase);
  const phInfo  = PHASES[phIdx]||PHASES[0];
  const canStart = rfiSt==="done" && selSupplier && !loading;
  const canReport = phase==="complete" && !loading;
  const activeV = vStateRef.current.filter(v=>v.status==="active");
  const elimV   = vStateRef.current.filter(v=>v.status==="eliminated");
  const pct = v => v.status==="eliminated" ? 0 : Math.round((v.mhPassed/v.mhTotal)*50+((v.gthMatched||0)/v.gthTotal)*30);

  const showShared = !activeTab || phase==="general" || phase==="idle";
  const msgs = showShared ? shared : (varChat[activeTab]||[]);
  const typingVisible = typing && (showShared ? (typing.v==="TML"||typing.v==="SUP") : typing.v===activeTab);

  // ── SETUP SCREEN ─────────────────────────────────────────────
  if (step === "setup") return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"0 24px", height:56, display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",color:T.textSub,fontSize:13 }}>← Back</button>
        <div style={{ width:1,height:16,background:T.border }}/>
        <span style={{ fontWeight:700,fontSize:16,color:T.text }}>KAVACH</span>
        <span style={{ fontSize:12,color:T.textSub }}>OEM Portal</span>
        <div style={{ marginLeft:"auto",padding:"3px 10px",borderRadius:20,background:T.primaryBg,color:T.primary,fontSize:11,fontWeight:600 }}>OEM</div>
      </div>

      <div style={{ maxWidth:800,margin:"40px auto",padding:"0 24px" }}>
        <div style={{ fontSize:22,fontWeight:700,color:T.text,marginBottom:4 }}>New Supplier Evaluation</div>
        <div style={{ fontSize:13,color:T.textSub,marginBottom:32 }}>Upload your RFI document and select a supplier to begin the automated evaluation.</div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>

          {/* RFI Upload */}
          <div style={{ background:T.surface,borderRadius:12,border:`1px solid ${rfiSt==="done"?T.success:T.border}`,padding:24,boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
              <div style={{ fontSize:15,fontWeight:600,color:T.text }}>TML RFI Document</div>
              {rfiSt==="done"&&<span style={{ background:T.successBg,color:T.success,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20 }}>✓ READY</span>}
              {rfiSt==="uploading"&&<span style={{ background:T.primaryBg,color:T.primary,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20 }}>UPLOADING…</span>}
              {rfiSt==="error"&&<span style={{ background:T.dangerBg,color:T.danger,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20 }}>ERROR</span>}
            </div>
            <div style={{ fontSize:12,color:T.textSub,marginBottom:14 }}>Your RFI requirements file — only visible to TML agent</div>
            <label style={{ display:"block",border:`1.5px dashed ${rfiSt==="done"?T.success:T.border2}`,borderRadius:8,padding:16,textAlign:"center",cursor:"pointer",background:rfiSt==="done"?T.successBg:T.surface2 }}>
              <div style={{ fontSize:22,marginBottom:6 }}>{rfiSt==="done"?"✅":"📁"}</div>
              <div style={{ fontSize:12,color:rfiSt==="done"?T.success:T.textSub }}>{rfiFile||"Choose .xlsx file"}</div>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={async e=>{const f=e.target.files[0];if(f){setRfiFile(f.name);await uploadRFI(f);}}} style={{ display:"none" }}/>
            </label>
            {rfiMeta&&<div style={{ marginTop:10,fontSize:11,color:T.textSub }}>MH: {rfiMeta.must_have_count} · GTH: {rfiMeta.good_to_have_count} · Subj: {rfiMeta.subjective_count}</div>}
          </div>

          {/* Supplier Selection */}
          <div style={{ background:T.surface,borderRadius:12,border:`1px solid ${selSupplier?T.success:T.border}`,padding:24,boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
              <div style={{ fontSize:15,fontWeight:600,color:T.text }}>Select Supplier</div>
              {selSupplier&&<span style={{ background:T.successBg,color:T.success,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20 }}>✓ SELECTED</span>}
            </div>
            <div style={{ fontSize:12,color:T.textSub,marginBottom:14 }}>Choose from suppliers who have uploaded their catalogue</div>

            {supLoading ? (
              <div style={{ textAlign:"center",padding:16,color:T.textMuted,fontSize:12 }}>Loading suppliers…</div>
            ) : suppliers.length===0 ? (
              <div style={{ textAlign:"center",padding:16 }}>
                <div style={{ fontSize:24,marginBottom:6 }}>📭</div>
                <div style={{ fontSize:12,color:T.textSub }}>No suppliers have uploaded catalogues yet.</div>
                <button onClick={loadSuppliers} style={{ marginTop:8,background:T.surface2,border:`1px solid ${T.border}`,borderRadius:6,padding:"6px 14px",fontSize:11,cursor:"pointer",color:T.textSub }}>Refresh</button>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {suppliers.map(sup=>(
                  <div key={sup.name} onClick={()=>selectSupplier(sup)}
                    style={{ padding:"10px 12px",borderRadius:8,border:`1.5px solid ${selSupplier?.name===sup.name?T.primary:T.border}`,background:selSupplier?.name===sup.name?T.primaryBg:T.surface2,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13,fontWeight:600,color:T.text }}>{sup.name}</div>
                      <div style={{ fontSize:11,color:T.textSub }}>{sup.variants?.length||0} variants · Uploaded {new Date(sup.uploadedAt).toLocaleDateString()}</div>
                    </div>
                    {selSupplier?.name===sup.name&&<span style={{ color:T.primary,fontSize:16 }}>✓</span>}
                  </div>
                ))}
                <button onClick={loadSuppliers} style={{ background:T.surface2,border:`1px solid ${T.border}`,borderRadius:6,padding:"6px",fontSize:11,cursor:"pointer",color:T.textSub,marginTop:4 }}>↻ Refresh list</button>
              </div>
            )}
          </div>
        </div>

        {/* Start button */}
        <button onClick={startEval} disabled={!canStart}
          style={{ width:"100%",padding:14,background:canStart?T.primary:T.border,color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:canStart?"pointer":"not-allowed",boxShadow:canStart?"0 4px 12px rgba(25,113,194,.3)":"none" }}>
          {loading?"⏳ Evaluation Running…":"▶ Start Evaluation"}
        </button>

        {(!rfiSt==="done"||!selSupplier)&&!loading&&(
          <div style={{ textAlign:"center",fontSize:12,color:T.textSub,marginTop:10 }}>
            {rfiSt!=="done"&&"Upload RFI document · "}
            {!selSupplier&&"Select a supplier"}
          </div>
        )}
      </div>
    </div>
  );

  // ── EVALUATION SCREEN ─────────────────────────────────────────
  return (
    <div style={{ height:"100vh",display:"flex",flexDirection:"column",background:T.bg,fontFamily:"'Segoe UI',sans-serif",overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 20px",height:52,display:"flex",alignItems:"center",gap:12,flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
        <button onClick={()=>setStep("setup")} style={{ background:"none",border:"none",cursor:"pointer",color:T.textSub,fontSize:13 }}>← Setup</button>
        <div style={{ width:1,height:16,background:T.border }}/>
        <span style={{ fontWeight:700,fontSize:15,color:T.text }}>KAVACH</span>
        {selSupplier&&<span style={{ fontSize:12,color:T.textSub }}>Evaluating: {selSupplier.name}</span>}
        <div style={{ marginLeft:"auto",display:"flex",gap:8,alignItems:"center" }}>
          {phase!=="idle"&&<span style={{ fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,background:phInfo.color+"20",color:phInfo.color,border:`1px solid ${phInfo.color}40` }}>{phInfo.label}</span>}
          {activeV.length>0&&phase!=="idle"&&<span style={{ fontSize:11,color:T.success,fontWeight:600 }}>{activeV.length} Active</span>}
          {elimV.length>0&&<span style={{ fontSize:11,color:T.danger,fontWeight:600 }}>{elimV.length} Eliminated</span>}
        </div>
      </div>

      <div style={{ flex:1,display:"grid",gridTemplateColumns:"240px 1fr 200px",overflow:"hidden" }}>

        {/* LEFT SIDEBAR */}
        <div style={{ background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflow:"auto",padding:14,gap:10 }}>

          <div style={{ fontSize:10,fontWeight:700,letterSpacing:".1em",color:T.textMuted,textTransform:"uppercase",paddingBottom:8,borderBottom:`1px solid ${T.border}` }}>Agents</div>
          {[{id:"tml",label:"TML Design Engineer",desc:"Access: RFI only",color:T.primary,icon:"🏭"},
            {id:"supplier",label:"Supplier App. Engineers",desc:`${selSupplier?.name||"Supplier"} — Catalogue only`,color:T.success,icon:"🔧"}
          ].map(ag=>(
            <div key={ag.id} style={{ background:typing?.role===ag.id?ag.color+"12":T.surface2,border:`1.5px solid ${typing?.role===ag.id?ag.color:T.border}`,borderRadius:8,padding:"10px 12px",display:"flex",gap:8,alignItems:"flex-start",transition:"all .2s" }}>
              <div style={{ fontSize:20 }}>{ag.icon}</div>
              <div>
                <div style={{ fontSize:11,fontWeight:600,color:T.text,marginBottom:1 }}>{ag.label}</div>
                <div style={{ fontSize:10,color:T.textSub,marginBottom:4 }}>{ag.desc}</div>
                <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:typing?.role===ag.id?ag.color:T.textMuted }}/>
                  <span style={{ fontSize:10,color:T.textMuted }}>{typing?.role===ag.id?`Generating [${typing.v}]`:"Standby"}</span>
                </div>
              </div>
            </div>
          ))}

          {phase!=="idle"&&(
            <>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:".1em",color:T.textMuted,textTransform:"uppercase",paddingTop:6,paddingBottom:8,borderBottom:`1px solid ${T.border}` }}>Progress</div>
              {PHASES.map(p=>{const done=phIdx>PHASES.findIndex(x=>x.id===p.id);const act=phase===p.id;return(
                <div key={p.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"4px 6px",borderRadius:6,background:act?p.color+"15":"transparent" }}>
                  <div style={{ width:20,height:20,borderRadius:"50%",background:done?T.success:act?p.color:"transparent",border:`1.5px solid ${done?T.success:act?p.color:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:done?"#fff":act?p.color:T.textMuted,flexShrink:0,fontWeight:700 }}>
                    {done?"✓":p.short}
                  </div>
                  <span style={{ fontSize:11,color:done?T.success:act?p.color:T.textMuted,fontWeight:act||done?600:400 }}>{p.label}</span>
                </div>
              );})}
            </>
          )}

          <div style={{ flex:1 }}/>

          <button onClick={generateReport} disabled={!canReport}
            style={{ width:"100%",padding:10,background:canReport?T.primary:T.surface2,color:canReport?"#fff":T.textMuted,border:`1px solid ${canReport?T.primary:T.border}`,borderRadius:8,fontSize:12,fontWeight:600,cursor:canReport?"pointer":"not-allowed" }}>
            📊 Generate Report
          </button>
        </div>

        {/* CHAT */}
        <div style={{ display:"flex",flexDirection:"column",overflow:"hidden",background:T.bg }}>

          {/* Phase ribbon */}
          <div style={{ display:"flex",background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 16px",flexShrink:0,overflowX:"auto" }}>
            {PHASES.map(p=>{const pi=PHASES.findIndex(x=>x.id===p.id);const done=phIdx>pi&&phase!=="idle";const act=phase===p.id;return(
              <div key={p.id} style={{ display:"flex",alignItems:"center",gap:5,padding:"10px 12px",fontSize:11,fontWeight:act||done?600:400,color:act?p.color:done?T.success:T.textMuted,borderBottom:`2px solid ${act?p.color:done?T.success:"transparent"}`,whiteSpace:"nowrap",cursor:"default" }}>
                <div style={{ width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,background:act?p.color:done?T.success:"transparent",border:`1.5px solid ${act?p.color:done?T.success:T.border}`,color:act||done?"#fff":T.textMuted,fontWeight:700,flexShrink:0 }}>{done?"✓":p.short}</div>
                {p.label}
              </div>
            );})}
          </div>

          {/* Variant tabs */}
          {vStateRef.current.length>0&&phase!=="general"&&phase!=="idle"&&(
            <div style={{ display:"flex",background:T.surface2,borderBottom:`1px solid ${T.border}`,padding:"0 16px",gap:2,flexShrink:0 }}>
              <div onClick={()=>setActiveTab(null)} style={{ padding:"8px 14px",fontSize:11,fontWeight:!activeTab?700:400,color:!activeTab?T.primary:T.textSub,borderBottom:`2px solid ${!activeTab?T.primary:"transparent"}`,cursor:"pointer" }}>Overview</div>
              {vStateRef.current.map(v=>{const col=v.status==="eliminated"?T.danger:vc(v.name);const act=activeTab===v.name;return(
                <div key={v.name} onClick={()=>setActiveTab(v.name)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",fontSize:11,fontWeight:act?700:400,color:act?col:v.status==="eliminated"?T.danger:T.textSub,borderBottom:`2px solid ${act?col:"transparent"}`,cursor:"pointer",opacity:v.status==="eliminated"?.6:1 }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:col }}/>
                  {v.name}{v.status==="eliminated"&&" ✕"}
                </div>
              );})}
            </div>
          )}

          {/* Messages */}
          <div ref={chatRef} style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:8 }}>

            {msgs.length===0&&!loading&&(
              <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,color:T.textMuted,paddingTop:60 }}>
                <div style={{ fontSize:48 }}>◎</div>
                <div style={{ fontSize:13 }}>Upload RFI → Select Supplier → Start Evaluation</div>
              </div>
            )}

            {/* Overview scorecards */}
            {!activeTab&&!showShared&&vStateRef.current.length>0&&(
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:8 }}>
                {vStateRef.current.map(v=>{const col=v.status==="eliminated"?T.danger:vc(v.name);const p=pct(v);return(
                  <div key={v.name} onClick={()=>setActiveTab(v.name)} style={{ background:T.surface,border:`1.5px solid ${col}40`,borderLeft:`4px solid ${col}`,borderRadius:10,padding:14,cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,.06)" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                      <span style={{ fontSize:14,fontWeight:700,color:col }}>{v.name}</span>
                      <span style={{ fontSize:18,fontWeight:800,color:col }}>{v.status==="eliminated"?"ELIM":p+"%"}</span>
                    </div>
                    {v.status==="eliminated"
                      ?<div style={{ fontSize:11,color:T.danger }}>⛔ {v.eliminatedAt}</div>
                      :<><div style={{ height:4,background:T.surface2,borderRadius:2,overflow:"hidden",marginBottom:6 }}><div style={{ height:"100%",width:`${p}%`,background:col,borderRadius:2 }}/></div><div style={{ fontSize:10,color:T.textSub }}>MH {v.mhPassed}/{v.mhTotal} · GTH {v.gthMatched||0}/{v.gthTotal}{v.deviations.length>0&&<span style={{ color:T.warning }}> · ⚠{v.deviations.length}</span>}</div></>
                    }
                  </div>
                );})}
              </div>
            )}

            {msgs.map(msg=>{
              if (msg.type==="divider") return(
                <div key={msg.id} style={{ display:"flex",alignItems:"center",gap:8,margin:"8px 0" }}>
                  <div style={{ flex:1,height:1,background:T.border }}/>
                  <span style={{ fontSize:10,fontWeight:600,color:T.textMuted,letterSpacing:".1em",whiteSpace:"nowrap" }}>{msg.text}</span>
                  <div style={{ flex:1,height:1,background:T.border }}/>
                </div>
              );
              if (msg.type==="veto") return(
                <div key={msg.id} style={{ background:T.dangerBg,border:`1px solid #FFC9C9`,borderLeft:`4px solid ${T.danger}`,borderRadius:8,padding:"12px 14px" }}>
                  <div style={{ fontSize:12,fontWeight:700,color:T.danger,marginBottom:4 }}>⛔ MUST HAVE VETO — VARIANT ELIMINATED</div>
                  <div style={{ fontSize:12,color:T.danger,lineHeight:1.5,whiteSpace:"pre-line" }}>{msg.text}</div>
                </div>
              );
              if (msg.type==="deviation") return(
                <div key={msg.id} style={{ background:T.warningBg,border:`1px solid #FFE8A3`,borderLeft:`4px solid ${T.warning}`,borderRadius:8,padding:"10px 12px",display:"flex",gap:8 }}>
                  <span>⚠</span>
                  <div>
                    <div style={{ fontSize:10,fontWeight:700,color:T.warning,marginBottom:2 }}>DEVIATION RECORDED</div>
                    <div style={{ fontSize:12,color:"#7C4F00",lineHeight:1.5 }}>{msg.text}</div>
                  </div>
                </div>
              );
              if (msg.type==="error") return <div key={msg.id} style={{ background:T.dangerBg,border:`1px solid #FFC9C9`,borderRadius:8,padding:"10px 12px",fontSize:12,color:T.danger }}>⚠ {msg.text}</div>;
              if (msg.type==="info") return <div key={msg.id} style={{ background:T.primaryBg,border:`1px solid #BAC8FF`,borderRadius:8,padding:"10px 12px",fontSize:12,color:T.primary }}>{msg.text}</div>;
              if (msg.type!=="msg") return null;

              const isTml = msg.role==="tml";
              const varCol = activeTab?vc(activeTab):T.success;

              return(
                <div key={msg.id} style={{ display:"flex",flexDirection:isTml?"row":"row-reverse",gap:8,alignItems:"flex-end" }}>
                  <div style={{ width:28,height:28,borderRadius:8,background:isTml?T.primaryBg:`${varCol}20`,border:`1.5px solid ${isTml?T.primary:varCol}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:isTml?T.primary:varCol,flexShrink:0 }}>
                    {isTml?"TML":activeTab?activeTab.substring(0,3).toUpperCase():"SUP"}
                  </div>
                  <div style={{ maxWidth:"72%" }}>
                    <div style={{ fontSize:10,color:T.textMuted,marginBottom:3,textAlign:isTml?"left":"right" }}>
                      {isTml?"TML Virtual Design Engineer":`Supplier App. Engineer${activeTab?` — ${activeTab}`:""}`}
                    </div>
                    <div style={{ padding:"10px 14px",borderRadius:10,fontSize:13,lineHeight:1.65,background:isTml?T.surface:`${varCol}10`,border:`1px solid ${isTml?T.border:varCol+"30"}`,color:T.text,borderTopLeftRadius:isTml?2:10,borderTopRightRadius:isTml?10:2,boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {typingVisible&&typing&&(
              <div style={{ display:"flex",flexDirection:typing.role==="tml"?"row":"row-reverse",gap:8,alignItems:"flex-end" }}>
                <div style={{ width:28,height:28,borderRadius:8,background:typing.role==="tml"?T.primaryBg:T.successBg,border:`1.5px solid ${typing.role==="tml"?T.primary:T.success}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:typing.role==="tml"?T.primary:T.success,flexShrink:0 }}>
                  {typing.role==="tml"?"TML":typing.v?.substring(0,3)||"SUP"}
                </div>
                <div style={{ padding:"10px 14px",borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,display:"inline-flex",gap:5,alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
                  {[0,1,2].map(i=><div key={i} style={{ width:5,height:5,borderRadius:"50%",background:typing.role==="tml"?T.primary:T.success,animation:`td 1.1s ${i*.18}s infinite` }}/>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Variant status */}
        <div style={{ background:T.surface,borderLeft:`1px solid ${T.border}`,overflow:"auto",padding:14,display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:".1em",color:T.textMuted,textTransform:"uppercase",paddingBottom:8,borderBottom:`1px solid ${T.border}` }}>Variant Status</div>
          {vStateRef.current.length===0&&<div style={{ fontSize:11,color:T.textMuted }}>Not started</div>}
          {vStateRef.current.map(v=>{const col=v.status==="eliminated"?T.danger:vc(v.name);const p=pct(v);const act=activeTab===v.name;return(
            <div key={v.name} onClick={()=>setActiveTab(v.name)} style={{ background:act?col+"10":T.surface2,border:`1.5px solid ${act?col:T.border}`,borderRadius:8,padding:10,cursor:"pointer",transition:"all .15s" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                <span style={{ fontSize:12,fontWeight:700,color:col }}>{v.name}</span>
                {v.status==="eliminated"?<span style={{ fontSize:10,color:T.danger,fontWeight:600 }}>ELIM</span>:<span style={{ fontSize:13,fontWeight:800,color:col }}>{p}%</span>}
              </div>
              {v.status==="eliminated"
                ?<div style={{ fontSize:10,color:T.danger }}>⛔ {v.eliminatedAt}</div>
                :<><div style={{ height:3,background:T.border,borderRadius:2,overflow:"hidden",marginBottom:5 }}><div style={{ height:"100%",width:`${p}%`,background:col,borderRadius:2 }}/></div><div style={{ fontSize:10,color:T.textSub }}>MH {v.mhPassed}/{v.mhTotal} · GTH {v.gthMatched||0}/{v.gthTotal}{v.deviations.length>0&&<span style={{ color:T.warning }}> · ⚠{v.deviations.length}</span>}</div></>
              }
            </div>
          );})}

          {loading&&typing&&(
            <div style={{ padding:"8px 10px",background:T.primaryBg,border:`1px solid #BAC8FF`,borderRadius:8,marginTop:4 }}>
              <div style={{ fontSize:10,color:T.textSub,marginBottom:2 }}>Now evaluating</div>
              <div style={{ fontSize:12,color:T.primary,fontWeight:600 }}>{typing.v}</div>
              <div style={{ fontSize:10,color:T.textSub }}>{typing.role==="tml"?"TML asking…":"Supplier answering…"}</div>
            </div>
          )}
        </div>
      </div>

      {/* REPORT MODAL */}
      {showRpt&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16 }}>
          <div style={{ background:T.surface,borderRadius:14,width:"100%",maxWidth:900,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.2)" }}>
            <div style={{ padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ fontSize:16,fontWeight:700,color:T.text,display:"flex",alignItems:"center",gap:10 }}>
                RFI Compliance Report
                {report?.verdict&&<span style={{ fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,background:report.verdict==="RECOMMENDED"?T.successBg:T.warningBg,color:report.verdict==="RECOMMENDED"?T.success:T.warning }}>{report.verdict}</span>}
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>navigator.clipboard.writeText(JSON.stringify(report,null,2))} style={{ padding:"6px 14px",borderRadius:6,fontSize:12,cursor:"pointer",border:`1px solid ${T.border}`,background:T.surface2,color:T.text }}>Copy JSON</button>
                <button onClick={()=>setShowRpt(false)} style={{ padding:"6px 14px",borderRadius:6,fontSize:12,cursor:"pointer",border:`1px solid ${T.border}`,background:T.surface2,color:T.text }}>Close</button>
              </div>
            </div>
            <div style={{ flex:1,overflowY:"auto",padding:20 }}>
              {genRpt?<div style={{ display:"flex",alignItems:"center",gap:10,padding:28,color:T.primary,fontSize:13 }}><div style={{ display:"flex",gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:"50%",background:T.primary,animation:`td 1.1s ${i*.18}s infinite` }}/>)}</div>Generating report…</div>
              :report?.error?<div style={{ color:T.danger,padding:20 }}>{report.error}</div>
              :report?<ReportView r={report}/>:null}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes td{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:2px}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// REPORT VIEW
// ══════════════════════════════════════════════════════════════════
function ReportView({ r }) {
  const H = ({c}) => <div style={{ fontSize:10,fontWeight:700,letterSpacing:".12em",color:T.textSub,textTransform:"uppercase",marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${T.border}` }}>{c}</div>;
  const sc = s => { if(!s) return T.textSub; const u=s.toUpperCase(); return u==="PASS"||u==="MATCH"?T.success:u==="FAIL"||u==="MISS"?T.danger:T.warning; };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      {r.executive_summary&&<div><H c="Executive Summary"/><p style={{ fontSize:13,color:T.textSub,lineHeight:1.75,margin:0 }}>{r.executive_summary}</p></div>}

      {r.variant_results?.length>0&&(
        <div><H c="Variant Results"/>
          <div style={{ display:"grid",gridTemplateColumns:`repeat(${Math.min(r.variant_results.length,4)},1fr)`,gap:12 }}>
            {r.variant_results.map((vr,i)=>{const col=vr.status==="ELIMINATED"?T.danger:(VC[vr.variant]||T.textSub);return(
              <div key={i} style={{ background:T.surface2,border:`1.5px solid ${col}40`,borderLeft:`4px solid ${col}`,borderRadius:8,padding:12 }}>
                <div style={{ fontSize:13,fontWeight:700,color:col,marginBottom:4 }}>{vr.variant}</div>
                <div style={{ fontSize:11,color:vr.status==="ELIMINATED"?T.danger:T.success,fontWeight:600,marginBottom:5 }}>{vr.status}</div>
                {vr.elimination_reason&&<div style={{ fontSize:10,color:T.danger,lineHeight:1.4,marginBottom:5 }}>⛔ {vr.elimination_reason}</div>}
                <div style={{ fontSize:12,fontWeight:700,color:col }}>{vr.overall_fit}</div>
                {vr.deviations?.length>0&&<div style={{ marginTop:5,fontSize:10,color:T.warning }}>⚠ {vr.deviations.join(" · ")}</div>}
              </div>
            );})}
          </div>
        </div>
      )}

      {r.recommended_variant&&(
        <div><H c="Recommendation"/>
          <div style={{ background:T.successBg,border:`1px solid ${T.success}40`,borderLeft:`4px solid ${T.success}`,borderRadius:8,padding:14 }}>
            <div style={{ fontSize:14,fontWeight:700,color:T.success,marginBottom:5 }}>✓ Recommended: {r.recommended_variant}</div>
            <div style={{ fontSize:13,color:"#2B6A3D",lineHeight:1.65 }}>{r.recommendation_reason}</div>
          </div>
        </div>
      )}

      {r.modifications_required?.length>0&&(
        <div><H c="Modifications Required"/>
          {r.modifications_required.map((m,i)=>(
            <div key={i} style={{ display:"flex",gap:10,padding:"10px 12px",background:T.surface2,border:`1px solid ${T.border}`,borderRadius:7,marginBottom:6,fontSize:12,color:T.textSub,lineHeight:1.5 }}>
              <span>🔧</span>
              <div><div style={{ fontWeight:600,color:T.text,marginBottom:2 }}>{m.item}</div>
              {m.timeline&&<div style={{ fontSize:11,color:T.textMuted }}>Timeline: {m.timeline} · <span style={{ color:m.feasibility==="High"?T.success:T.warning }}>{m.feasibility}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {r.risks?.length>0&&(
        <div><H c="Risk Assessment"/>
          {r.risks.map((ri,i)=>(
            <div key={i} style={{ display:"flex",gap:10,padding:"10px 12px",background:T.surface2,border:`1px solid ${T.border}`,borderRadius:7,marginBottom:6,fontSize:12,color:T.textSub,lineHeight:1.5 }}>
              <span>⚠</span>
              <div><div style={{ fontWeight:600,color:T.text,marginBottom:2 }}>{ri.risk} <span style={{ fontSize:10,padding:"1px 7px",borderRadius:20,background:T.dangerBg,color:T.danger,fontWeight:600 }}>{ri.severity}</span></div>
              {ri.mitigation&&<div style={{ fontSize:11,color:T.textMuted }}>{ri.mitigation}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {r.raw&&!r.executive_summary&&<div><H c="Raw Output"/><pre style={{ fontSize:11,color:T.textSub,lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word",background:T.surface2,padding:14,borderRadius:8 }}>{r.raw}</pre></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("hero"); // hero | oem | supplier

  if (view === "hero")     return <HeroPage onSelect={setView}/>;
  if (view === "supplier") return <SupplierPortal onBack={() => setView("hero")}/>;
  if (view === "oem")      return <OEMPortal onBack={() => setView("hero")}/>;
}