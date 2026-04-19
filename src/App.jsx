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
// HERO / LANDING PAGE — Full cinematic car animation
// ══════════════════════════════════════════════════════════════════
function HeroPage({ onSelect }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("intro"); // intro | reveal | done
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    let carX      = -420;
    const carY    = H * 0.55;
    const carW    = 320;
    const carH    = 110;
    let speed     = 0;
    let tick      = 0;
    let particles = [];
    let sparks    = [];
    let done      = false;

    // Spawn spark particles from wheels
    const spawnSpark = (x, y) => {
      for (let i = 0; i < 3; i++) {
        sparks.push({
          x, y,
          vx: (Math.random() - 0.8) * 4,
          vy: (Math.random() - 0.5) * 3 - 1,
          life: 1, size: Math.random() * 2.5 + 0.5,
          col: Math.random() > 0.5 ? "#FFD700" : "#FF8C00"
        });
      }
    };

    // Road particles (dust)
    const spawnDust = (x, y) => {
      particles.push({
        x, y,
        vx: -(speed * 0.3 + Math.random() * 2),
        vy: (Math.random() - 0.5) * 0.8,
        life: 1, size: Math.random() * 6 + 2, alpha: 0.18
      });
    };

    const drawSUV = (x, y, wheelRot) => {
      ctx.save();
      ctx.translate(x, y);

      // ── Shadow ──
      ctx.save();
      ctx.scale(1, 0.2);
      const sg = ctx.createRadialGradient(carW/2, carH*5, 10, carW/2, carH*5, carW*0.6);
      sg.addColorStop(0, "rgba(0,0,0,0.55)");
      sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(carW/2, carH*5.2, carW*0.55, carH*1.8, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      // ── Underbody ──
      ctx.fillStyle = "#0a1628";
      ctx.beginPath();
      ctx.roundRect(18, carH-18, carW-36, 22, 4);
      ctx.fill();

      // ── Body main ──
      const bodyGrad = ctx.createLinearGradient(0, 15, 0, carH-15);
      bodyGrad.addColorStop(0, "#1e3a6e");
      bodyGrad.addColorStop(0.35, "#1a5fa8");
      bodyGrad.addColorStop(0.7, "#163d7a");
      bodyGrad.addColorStop(1, "#0d2040");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(30, carH-14);
      ctx.lineTo(15, carH-28);
      ctx.lineTo(15, carH-45);
      ctx.lineTo(22, carH-55);
      ctx.lineTo(55, carH-75); // hood slope
      ctx.lineTo(80, carH-80);
      ctx.lineTo(240, carH-80); // roofline
      ctx.lineTo(272, carH-65);
      ctx.lineTo(285, carH-50);
      ctx.lineTo(290, carH-28);
      ctx.lineTo(282, carH-14);
      ctx.closePath();
      ctx.fill();

      // ── Roof highlight ──
      const rg = ctx.createLinearGradient(80, 0, 240, 0);
      rg.addColorStop(0, "rgba(255,255,255,0)");
      rg.addColorStop(0.3, "rgba(255,255,255,0.12)");
      rg.addColorStop(0.7, "rgba(255,255,255,0.09)");
      rg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(80, carH-80);
      ctx.lineTo(240, carH-80);
      ctx.lineTo(240, carH-65);
      ctx.lineTo(80, carH-65);
      ctx.closePath();
      ctx.fill();

      // ── Windshield ──
      ctx.fillStyle = "rgba(100,180,255,0.45)";
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(82, carH-79);
      ctx.lineTo(115, carH-55);
      ctx.lineTo(178, carH-55);
      ctx.lineTo(180, carH-79);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // ── Side windows ──
      ctx.fillStyle = "rgba(80,160,255,0.35)";
      ctx.beginPath();
      ctx.moveTo(182, carH-79);
      ctx.lineTo(182, carH-55);
      ctx.lineTo(230, carH-55);
      ctx.lineTo(238, carH-69);
      ctx.lineTo(238, carH-79);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Rear window
      ctx.beginPath();
      ctx.moveTo(240, carH-79);
      ctx.lineTo(240, carH-55);
      ctx.lineTo(258, carH-57);
      ctx.lineTo(268, carH-65);
      ctx.lineTo(262, carH-79);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // ── Grill ──
      ctx.fillStyle = "#050e1c";
      ctx.beginPath();
      ctx.roundRect(272, carH-52, 18, 22, 2);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(273, carH-50+i*5);
        ctx.lineTo(289, carH-50+i*5);
        ctx.stroke();
      }

      // ── Headlights ──
      const hl = ctx.createRadialGradient(291, carH-44, 0, 291, carH-44, 14);
      hl.addColorStop(0, "#ffffff");
      hl.addColorStop(0.3, "#ffe87a");
      hl.addColorStop(1, "rgba(255,220,80,0)");
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.ellipse(291, carH-44, 10, 7, 0, 0, Math.PI*2);
      ctx.fill();

      // DRL strip
      ctx.strokeStyle = "#87ceeb";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(278, carH-56);
      ctx.lineTo(292, carH-56);
      ctx.stroke();

      // ── Tail lights ──
      ctx.fillStyle = "#cc1111";
      ctx.beginPath();
      ctx.roundRect(14, carH-52, 9, 18, 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,60,60,0.7)";
      ctx.beginPath();
      ctx.roundRect(15, carH-51, 6, 14, 1);
      ctx.fill();

      // ── Door lines ──
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(183, carH-54); ctx.lineTo(180, carH-14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(113, carH-54); ctx.lineTo(115, carH-14); ctx.stroke();

      // ── Roof rack ──
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(95, carH-81);
      ctx.lineTo(235, carH-81);
      ctx.stroke();
      [110, 150, 190, 220].forEach(rx => {
        ctx.beginPath();
        ctx.moveTo(rx, carH-81);
        ctx.lineTo(rx, carH-78);
        ctx.stroke();
      });

      // ── Side mirror ──
      ctx.fillStyle = "#0e2444";
      ctx.beginPath();
      ctx.roundRect(265, carH-66, 14, 8, 2);
      ctx.fill();

      // ── Wheels ──
      const drawWheel = (wx, wy, rot) => {
        ctx.save();
        ctx.translate(wx, wy);

        // Tire
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI*2);
        ctx.fill();

        // Rim outer
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI*2);
        ctx.fill();

        // Rim spokes
        ctx.save();
        ctx.rotate(rot);
        for (let i = 0; i < 5; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI * 2) / 5);
          ctx.fillStyle = "#c8c8c8";
          ctx.beginPath();
          ctx.roundRect(-3, -20, 6, 16, 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Center cap
        ctx.fillStyle = "#888";
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#1971C2";
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI*2);
        ctx.fill();

        // Brake disc hint
        ctx.strokeStyle = "rgba(180,180,180,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI*2);
        ctx.stroke();

        ctx.restore();
      };

      drawWheel(68, carH-14, wheelRot);
      drawWheel(238, carH-14, wheelRot);

      // ── Side skirt detail ──
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.roundRect(25, carH-20, carW-50, 8, 2);
      ctx.fill();

      ctx.restore();
    };

    const drawBeams = (x, y) => {
      // Left beam
      ctx.save();
      const b1 = ctx.createConicalGradient
        ? ctx.createConicalGradient(x+290, y+carH-44, -0.18, 0.18)
        : null;

      // Fallback triangle beams
      const bx = x + 295;
      const by = y + carH - 44;
      [[-0.22, 0.22], [-0.10, 0.10]].forEach(([a1, a2], i) => {
        const len = i === 0 ? 420 : 280;
        const spread = i === 0 ? 0.22 : 0.10;
        const grad = ctx.createLinearGradient(bx, by, bx + len, by);
        grad.addColorStop(0, i === 0 ? "rgba(255,230,120,0.18)" : "rgba(255,240,180,0.28)");
        grad.addColorStop(1, "rgba(255,230,120,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + len, by - len*spread);
        ctx.lineTo(bx + len, by + len*spread);
        ctx.closePath();
        ctx.fill();
      });

      // Bright core dot
      const hg = ctx.createRadialGradient(bx, by, 0, bx, by, 25);
      hg.addColorStop(0, "rgba(255,255,255,0.9)");
      hg.addColorStop(0.3, "rgba(255,230,100,0.4)");
      hg.addColorStop(1, "rgba(255,200,0,0)");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(bx, by, 25, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    };

    const drawSpeedLines = (x) => {
      for (let i = 0; i < 12; i++) {
        const ly  = H * 0.25 + i * H * 0.045;
        const lx1 = x - 60 - Math.random() * 200;
        const lx2 = lx1 - (30 + Math.random() * 120);
        const alpha = 0.06 + Math.random() * 0.12;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 0.5 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(lx1, ly);
        ctx.lineTo(lx2, ly);
        ctx.stroke();
      }
    };

    const drawRoad = () => {
      // Road base
      const rg = ctx.createLinearGradient(0, carY+carH, 0, H);
      rg.addColorStop(0, "#111827");
      rg.addColorStop(1, "#0a0f1a");
      ctx.fillStyle = rg;
      ctx.fillRect(0, carY+carH-10, W, H - (carY+carH-10));

      // Road surface texture line
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, carY+carH+2);
      ctx.lineTo(W, carY+carH+2);
      ctx.stroke();

      // Center dashes
      const dashW = 60, gap = 40, total = dashW + gap;
      const offset = (tick * speed * 0.5) % total;
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      for (let dx = -total + offset; dx < W + total; dx += total) {
        ctx.fillRect(dx - offset, carY + carH + 18, dashW, 4);
      }

      // Edge lines
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, carY+carH+8); ctx.lineTo(W, carY+carH+8); ctx.stroke();
    };

    const drawParticles = () => {
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.025;
        ctx.fillStyle = `rgba(180,180,200,${p.life * p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
        ctx.fill();
      });

      sparks = sparks.filter(s => s.life > 0);
      sparks.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.vy += 0.15; s.life -= 0.06;
        ctx.fillStyle = s.col;
        ctx.globalAlpha = s.life;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    };

    let startTime = null;
    const DRIVE_MS    = 1800; // ms to drive in
    const BRAKE_MS    = 400;  // ms to brake to stop
    const STOP_X      = W * 0.38; // where car stops

    const loop = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      tick++;

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Background
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#060d1a");
      bg.addColorStop(0.5, "#0a1628");
      bg.addColorStop(1, "#06101f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5 + 50) % W;
        const sy = (i * 97.3 + 30) % (H * 0.55);
        const ss = (i % 3 === 0) ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.arc(sx, sy, ss, 0, Math.PI*2);
        ctx.fill();
      }

      // City silhouette
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      [
        [W*0.05,H*0.4,40,H*0.15],[W*0.1,H*0.38,30,H*0.17],
        [W*0.18,H*0.35,50,H*0.2],[W*0.28,H*0.37,35,H*0.18],
        [W*0.38,H*0.32,60,H*0.23],[W*0.52,H*0.36,40,H*0.19],
        [W*0.62,H*0.33,55,H*0.22],[W*0.72,H*0.38,30,H*0.17],
        [W*0.82,H*0.35,45,H*0.2],[W*0.9,H*0.39,35,H*0.16],
      ].forEach(([bx,by,bw,bh]) => {
        ctx.fillRect(bx, by, bw, bh);
      });

      // Ease in car
      let t = Math.min(elapsed / DRIVE_MS, 1);
      const ease = t < 0.7 
        ? (t / 0.7) * (t / 0.7)  // accelerate
        : 1 - Math.pow((t - 0.7) / 0.3, 2); // decelerate
      carX = -420 + ease * (STOP_X + 420);
      speed = Math.max(0, (1 - Math.abs(ease - 0.5) * 2) * 18 + 2);

      const wheelRot = -(tick * speed * 0.04);

      drawRoad();
      drawSpeedLines(carX);

      // Dust from rear wheel while moving
      if (speed > 3 && tick % 2 === 0) {
        spawnDust(carX + 68, carY + carH - 6);
      }
      // Sparks when braking
      if (t > 0.75 && t < 0.95 && tick % 3 === 0) {
        spawnSpark(carX + 68, carY + carH - 6);
        spawnSpark(carX + 238, carY + carH - 6);
      }

      drawParticles();

      // Headlight beams when close
      if (carX > -100) drawBeams(carX, carY);

      drawSUV(carX, carY, wheelRot);

      // Reveal KAVACH text after car stops
      if (t >= 1 && !done) {
        done = true;
        setPhase("reveal");
      }

      if (t < 1 || phase === "intro") {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    animRef.current = requestAnimationFrame(loop);

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ position:"relative", width:"100vw", height:"100vh", overflow:"hidden", fontFamily:"'Segoe UI',sans-serif" }}>

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}/>

      {/* KAVACH reveal */}
      <div style={{
        position:"absolute", top:"12%", left:0, right:0, textAlign:"center", zIndex:10,
        opacity: phase==="reveal" ? 1 : 0,
        transform: phase==="reveal" ? "translateY(0) scale(1)" : "translateY(-30px) scale(0.9)",
        transition: "opacity 1s ease, transform 1s ease",
      }}>
        <div style={{ fontSize:"clamp(48px,8vw,90px)", fontWeight:900, color:"#fff", letterSpacing:"-2px",
          textShadow:"0 0 60px rgba(100,180,255,0.5), 0 0 120px rgba(25,113,194,0.3)" }}>
          KAVACH
        </div>
        <div style={{ fontSize:"clamp(11px,1.4vw,15px)", color:"rgba(255,255,255,0.65)", letterSpacing:".2em", marginTop:4 }}>
          AI-POWERED SUPPLIER EVALUATION SYSTEM
        </div>
      </div>

      {/* Cards */}
      <div style={{
        position:"absolute", bottom:"8%", left:0, right:0,
        display:"flex", gap:20, justifyContent:"center", flexWrap:"wrap", padding:"0 20px", zIndex:10,
        opacity: phase==="reveal" ? 1 : 0,
        transform: phase==="reveal" ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s",
      }}>
        {[
          { id:"oem", icon:"🏭", title:"Login as OEM", desc:"Design Engineer — Upload RFI, evaluate suppliers, generate reports", btn:"Enter as OEM →", bg:"#1971C2" },
          { id:"supplier", icon:"🔧", title:"Login as Supplier", desc:"Application Engineer — Upload your product catalogue for evaluation", btn:"Enter as Supplier →", bg:"#2F9E44" }
        ].map(card => (
          <div key={card.id} onClick={() => onSelect(card.id)}
            style={{ background:"rgba(255,255,255,0.95)", borderRadius:16, padding:"28px 28px", width:260,
              cursor:"pointer", backdropFilter:"blur(10px)",
              boxShadow:"0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
              transition:"transform .2s, box-shadow .2s", textAlign:"center" }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-6px) scale(1.02)"; e.currentTarget.style.boxShadow="0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0) scale(1)"; e.currentTarget.style.boxShadow="0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)"; }}>
            <div style={{ fontSize:36, marginBottom:10 }}>{card.icon}</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#1a1a2e", marginBottom:6 }}>{card.title}</div>
            <div style={{ fontSize:11, color:"#555", lineHeight:1.6, marginBottom:16 }}>{card.desc}</div>
            <div style={{ background:card.bg, color:"#fff", padding:"9px 20px", borderRadius:8, fontSize:12, fontWeight:700, letterSpacing:".03em" }}>{card.btn}</div>
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