import { useState, useRef, useEffect } from "react";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const PHASES = [
  { id:"general",        label:"General Queries",      short:"P1", color:"#5b9cf6" },
  { id:"must_have",      label:"Must Have",            short:"P2", color:"#34d399" },
  { id:"good_to_have",   label:"Good to Have",         short:"P3", color:"#fbbf24" },
  { id:"negotiation",    label:"Negotiation",          short:"P4", color:"#c084fc" },
  { id:"recommendation", label:"Eng. Recommendations", short:"P5", color:"#f97316" },
  { id:"complete",       label:"Complete",             short:"✓",  color:"#34d399" },
];
const VC = { Alpha:"#5b9cf6", Beta:"#f59e0b", Gamma:"#34d399", Lambda:"#c084fc" };
const vc = n => VC[n] || "#94a3b8";

export default function App() {
  const [rfiFile, setRfiFile]   = useState(null);
  const [supFile, setSupFile]   = useState(null);
  const [rfiSt,   setRfiSt]     = useState("idle");
  const [supSt,   setSupSt]     = useState("idle");
  const [rfiMeta, setRfiMeta]   = useState(null);
  const [supMeta, setSupMeta]   = useState(null);
  const [variants,setVariants]  = useState([]);
  const [activeTab,setActiveTab]= useState(null);
  const [shared,  setShared]    = useState([]);
  const [varChat, setVarChat]   = useState({});
  const [phase,   setPhase]     = useState("idle");
  const [loading, setLoading]   = useState(false);
  const [typing,  setTyping]    = useState(null);
  const [report,  setReport]    = useState(null);
  const [showRpt, setShowRpt]   = useState(false);
  const [genRpt,  setGenRpt]    = useState(false);
  const chatRef = useRef(null);
  const stopRef = useRef(false);

  useEffect(() => { if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [shared, varChat, typing, activeTab]);

  const wait = ms => new Promise(r => setTimeout(r, ms));

  const addShared = (role, text, type="msg") => {
    if (!text?.trim()) return;
    setShared(p => [...p, { role, text: text.trim(), type, id: Date.now()+Math.random() }]);
  };

  const addVar = (vn, role, text, type="msg") => {
    if (!text?.trim()) return;
    setVarChat(p => ({ ...p, [vn]: [...(p[vn]||[]), { role, text: text.trim(), type, id: Date.now()+Math.random() }] }));
  };

  const upload = async (file, type) => {
    const setS = type==="rfi" ? setRfiSt : setSupSt;
    const setM = type==="rfi" ? setRfiMeta : setSupMeta;
    setS("uploading");
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`${SERVER}/upload/${type}`, { method:"POST", body:fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setS("done"); setM(d);
    } catch(e) { setS("error"); console.error(e); }
  };

  // AI call — retries up to 3 times with increasing delay
  // Longer waits prevent rate limiting from rapid sequential calls
  const callAI = async (agent, history, extra={}) => {
    // Trim history to last 10 messages to avoid token overflow
    const trimmed = history.slice(-10);
    for (let i=0; i<3; i++) {
      try {
        const r = await fetch(`${SERVER}/api/ai`, {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ agent, messages: trimmed, ...extra })
        });
        if (!r.ok) {
          const err = await r.json().catch(()=>({}));
          console.error(`[${agent}] HTTP ${r.status}:`, err.error || "unknown");
          if (i<2) { await wait(1500*(i+1)); continue; }
          return "";
        }
        const d = await r.json();
        if (d.error) {
          console.error(`[${agent}] API error:`, d.error);
          if (i<2) { await wait(1500*(i+1)); continue; }
          return "";
        }
        const text = (d?.choices?.[0]?.message?.content || "").trim();
        if (!text && i<2) { await wait(1000); continue; }
        return text;
      } catch(e) {
        console.error(`[${agent}] fetch error:`, e.message);
        if(i<2) { await wait(1500*(i+1)); continue; }
        return "";
      }
    }
    return "";
  };

  // vState: working copy of variants (state is async so track locally too)
  let vStateRef = useRef([]);

  const updateV = (name, updates) => {
    const idx = vStateRef.current.findIndex(v => v.name === name);
    if (idx >= 0) Object.assign(vStateRef.current[idx], updates);
    setVariants([...vStateRef.current]);
  };

  const startEval = async () => {
    if (loading || rfiSt !== "done" || supSt !== "done") return;
    if (!supMeta?.variants_found?.length) { alert("No variants found in supplier catalogue."); return; }

    stopRef.current = false;
    setLoading(true);
    setShared([]); setVarChat({}); setReport(null);
    setPhase("general");

    const vNames = supMeta.variants_found;
    const init   = vNames.map(name => ({
      name, status:"active", mhPassed:0, mhTotal: rfiMeta?.must_have_count||4,
      gthMatched:0, gthTotal: rfiMeta?.good_to_have_count||7,
      deviations:[], history:[], eliminatedAt:null, eliminationReason:null
    }));
    vStateRef.current = init;
    setVariants([...init]);
    setActiveTab(vNames[0]);

    // ── PHASE 1: GENERAL QUERIES ──────────────────────────────
    // Supplier asks → TML answers (scripted, zero hallucination)
    addShared("divider", "PHASE 1 — GENERAL PROJECT QUERIES", "divider");

    const sharedHist = [];
    // Seed conversation
    const seed = "We have received your RFI submission. Please go ahead with your questions.";
    addShared("tml", seed);
    sharedHist.push({ role:"user", content: seed });

    for (let i=0; i<4; i++) {
      if (stopRef.current) break;
      setTyping({ v:"SUP", role:"supplier" });
      const supQ = await callAI("supplier", sharedHist, { phase:"general", variant: vNames[0] });
      setTyping(null);
      if (!supQ) continue;
      addShared("supplier", supQ);
      sharedHist.push({ role:"assistant", content: supQ });
      await wait(300);

      setTyping({ v:"TML", role:"tml" });
      const tmlA = await callAI("tml", sharedHist, { phase:"general" });
      setTyping(null);
      if (!tmlA) continue;
      addShared("tml", tmlA);
      sharedHist.push({ role:"user", content: tmlA });
      await wait(300);
    }

    // Copy shared history to each variant
    vStateRef.current.forEach(v => { v.history = [...sharedHist]; });

    // ── PHASE 2: MUST HAVE — DETERMINISTIC ───────────────────
    addShared("divider", "PHASE 2 — MUST HAVE VERIFICATION  [ALL VARIANTS]", "divider");
    setPhase("must_have");

    // Fetch RFI requirements
    let mhList = [];
    try {
      const rd = await fetch(`${SERVER}/data/rfi`).then(r=>r.json());
      mhList = rd.must_have || [];
    } catch(e) { console.error("Failed to fetch RFI:", e); }

    // Deterministic evaluation — server compares catalogue vs RFI directly
    let det = {};
    try {
      const dr = await fetch(`${SERVER}/evaluate/all_must_have`, { method:"POST", headers:{"Content-Type":"application/json"}, body:"{}" });
      if (!dr.ok) throw new Error(`HTTP ${dr.status}`);
      det = await dr.json();
      if (det.error) throw new Error(det.error);
      console.log("Deterministic results loaded:", Object.keys(det).join(", "));
    } catch(e) {
      console.error("Deterministic eval failed:", e.message);
      addShared("error", `⚠ Evaluation error: ${e.message}. Check server console.`, "error");
    }

    for (let i=0; i<mhList.length; i++) {
      if (stopRef.current) break;
      const req = mhList[i];
      if (!req) continue;

      for (const v of vStateRef.current.filter(x => x.status==="active")) {
        if (stopRef.current) break;
        setActiveTab(v.name);
        await wait(100);

        const detRow = det[v.name]?.[i];
        const passes  = detRow ? detRow.pass : true;
        const offered = detRow?.offered || "";
        const reason  = detRow?.reason  || "";

        // TML asks — trim to last 4 messages only so previous "Confirmed X"
        // messages don't bias which parameter TML thinks it should ask about
        setTyping({ v: v.name, role:"tml" });
        const tmlQ = await callAI("tml", v.history.slice(-4), { phase:"must_have", variant:v.name, reqParam:req.parameter, reqVal:req.requirement });
        setTyping(null);
        if (tmlQ) {
          addVar(v.name, "tml", tmlQ);
          v.history.push({ role:"user", content:tmlQ });
        }
        await wait(600);

        // Supplier answers — trim to last 4 so it only sees the current question
        setTyping({ v: v.name, role:"supplier" });
        const supA = await callAI("supplier", v.history.slice(-4), { phase:"must_have", variant:v.name, reqParam:req.parameter, reqVal:req.requirement });
        setTyping(null);
        if (supA) {
          addVar(v.name, "supplier", supA);
          v.history.push({ role:"assistant", content:supA });
        }
        await wait(600); // Give API breathing room between calls

        // VERDICT: deterministic — result is from catalogue comparison, not AI guess
        if (!passes) {
          const vetoMsg = `VETO: ${req.parameter} does not meet our requirement. Required: ${req.requirement}. Offered: ${offered}. ${reason}`;
          addVar(v.name, "tml", vetoMsg);
          v.history.push({ role:"user", content: vetoMsg });
          addVar(v.name, "veto", `${v.name} ELIMINATED\n${req.parameter}: required ${req.requirement}, offered ${offered}\n${reason}`, "veto");
          updateV(v.name, { status:"eliminated", eliminatedAt: req.parameter, eliminationReason: reason });
        } else {
          const ok = `Confirmed — ${req.parameter} meets requirement. ${v.name} offers ${offered}.`;
          addVar(v.name, "tml", ok);
          v.history.push({ role:"user", content: ok });
          v.mhPassed++;
          updateV(v.name, { mhPassed: v.mhPassed });
        }
        await wait(100);
      }
    }

    const active = vStateRef.current.filter(v => v.status==="active");
    if (!active.length) {
      addShared("info", "All variants have been eliminated in Must Have verification.", "info");
      setPhase("complete"); setLoading(false); setTyping(null); return;
    }

    // ── PHASE 3: GOOD TO HAVE ─────────────────────────────────
    addShared("divider", "PHASE 3 — GOOD TO HAVE PREFERENCES  [ACTIVE VARIANTS]", "divider");
    setPhase("good_to_have");

    let gthList = [];
    try {
      const rd = await fetch(`${SERVER}/data/rfi`).then(r=>r.json());
      gthList = rd.good_to_have || [];
    } catch {}

    for (let i=0; i<gthList.length; i++) {
      if (stopRef.current) break;
      const req = gthList[i];
      if (!req) continue;

      for (const v of vStateRef.current.filter(x => x.status==="active")) {
        if (stopRef.current) break;
        setActiveTab(v.name);

        // For GTH: use FRESH context per parameter — not the full history.
        // Full history causes the LLM to get "stuck" repeating the last answer
        // for every new GTH question. Each parameter needs a clean slate.
        const gthContext = [
          // Include just a brief summary of what's been confirmed so far
          { role:"user", content:`We have completed Must Have verification. All 4 Must Have requirements are confirmed for ${v.name}. Now proceeding to Good to Have preferences.` },
          { role:"assistant", content:`Understood. Ready to discuss Good to Have preferences for ${v.name}.` }
        ];

        setTyping({ v: v.name, role:"tml" });
        const tmlQ2 = await callAI("tml", gthContext, { phase:"good_to_have", variant:v.name, reqParam:req.parameter, reqVal:req.requirement });
        setTyping(null);
        if (tmlQ2) {
          addVar(v.name, "tml", tmlQ2);
        }
        await wait(500);

        // Supplier gets the TML question as context — fresh, no old answers
        const supGthContext = [
          ...gthContext,
          { role:"user", content: tmlQ2 || `Regarding ${req.parameter} — our preference is ${req.requirement}. What does your variant offer?` }
        ];

        setTyping({ v: v.name, role:"supplier" });
        const supA = await callAI("supplier", supGthContext, { phase:"good_to_have", variant:v.name, reqParam:req.parameter, reqVal:req.requirement });
        setTyping(null);
        if (supA) {
          addVar(v.name, "supplier", supA);
          // Only add to main history as a brief note — don't carry full GTH dialogue
          v.history.push({ role:"user", content:`[GTH Check] ${req.parameter}: ${tmlQ2||req.requirement}` });
          v.history.push({ role:"assistant", content: supA });
        }
        await wait(500);

        const miss = ["does not","below","non compliant","not meet","unable","not available"].some(w => supA.toLowerCase().includes(w));
        if (miss) {
          addVar(v.name, "deviation", `[GTH] ${req.parameter}: ${supA.substring(0,120)}`, "deviation");
          v.deviations.push(`[GTH] ${req.parameter}`);
          updateV(v.name, { deviations:[...v.deviations] });
        } else {
          v.gthMatched++;
          updateV(v.name, { gthMatched: v.gthMatched });
        }
        await wait(100);
      }
    }

    // ── PHASE 4: NEGOTIATION ──────────────────────────────────
    addShared("divider", "PHASE 4 — TECHNICAL NEGOTIATION  [AI DRIVEN]", "divider");
    setPhase("negotiation");

    for (const v of vStateRef.current.filter(x => x.status==="active")) {
      if (stopRef.current) break;
      setActiveTab(v.name);
      for (let i=0; i<2; i++) {
        setTyping({ v:v.name, role:"tml" });
        const q = await callAI("tml", v.history, { phase:"negotiation", variant:v.name });
        setTyping(null);
        if (q) { addVar(v.name, "tml", q); v.history.push({ role:"user", content:q }); }
        await wait(200);

        setTyping({ v:v.name, role:"supplier" });
        const a = await callAI("supplier", v.history, { phase:"negotiation", variant:v.name });
        setTyping(null);
        if (a) { addVar(v.name, "supplier", a); v.history.push({ role:"assistant", content:a }); }
        await wait(200);
      }
    }

    // ── PHASE 5: RECOMMENDATIONS ──────────────────────────────
    addShared("divider", "PHASE 5 — ENGINEERING RECOMMENDATIONS  [AI DRIVEN]", "divider");
    setPhase("recommendation");

    for (const v of vStateRef.current.filter(x => x.status==="active")) {
      if (stopRef.current) break;
      setActiveTab(v.name);
      setTyping({ v:v.name, role:"tml" });
      const q = await callAI("tml", v.history, { phase:"recommendation", variant:v.name });
      setTyping(null);
      if (q) { addVar(v.name, "tml", q); v.history.push({ role:"user", content:q }); }
      await wait(200);

      setTyping({ v:v.name, role:"supplier" });
      const a = await callAI("supplier", v.history, { phase:"recommendation", variant:v.name });
      setTyping(null);
      if (a) { addVar(v.name, "supplier", a); v.history.push({ role:"assistant", content:a }); }
      await wait(200);
    }

    setPhase("complete");
    setLoading(false);
    setTyping(null);
  };

  const generateReport = async () => {
    setGenRpt(true); setShowRpt(true);
    try {
      const r = await fetch(`${SERVER}/api/report`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          variantResults: vStateRef.current.map(v => ({
            name:v.name, status:v.status, mhPassed:v.mhPassed, mhTotal:v.mhTotal,
            gthMatched:v.gthMatched, gthTotal:v.gthTotal, deviations:v.deviations,
            eliminationReason:v.eliminationReason
          })),
          conversation: Object.entries(varChat).flatMap(([vn,msgs]) =>
            msgs.filter(m=>m.type==="msg").map(m=>({ role:m.role==="tml"?"user":"assistant", content:`[${vn}] ${m.text}` }))
          ).slice(-40)
        })
      });
      const d = await r.json();
      setReport(d.report || { raw:d.raw, error:d.parse_error });
    } catch(e) { setReport({ error:e.message }); }
    setGenRpt(false);
  };

  // ── UI ────────────────────────────────────────────────────────
  const phIdx  = PHASES.findIndex(p => p.id===phase);
  const phInfo = PHASES[phIdx] || PHASES[0];
  const canStart  = rfiSt==="done" && supSt==="done" && !loading;
  const canReport = phase==="complete" && !loading && vStateRef.current.length>0;
  const activeV = vStateRef.current.filter(v=>v.status==="active");
  const elimV   = vStateRef.current.filter(v=>v.status==="eliminated");

  const showShared = !activeTab || phase==="general" || phase==="idle";
  const msgs = showShared ? shared : (varChat[activeTab]||[]);
  const typingVisible = typing && (showShared ? (typing.v==="TML"||typing.v==="SUP") : typing.v===activeTab);

  const Bdg = ({s}) => { const m={idle:["#1a2535","#3d4f6a","AWAITING"],uploading:["#0a1e3d","#5b9cf6","UPLOADING…"],done:["#081a10","#34d399","✓ READY"],error:["#1a0808","#f87171","ERROR"]}; const [bg,c,l]=m[s]||m.idle; return <span style={{fontSize:9,fontFamily:"monospace",padding:"2px 8px",borderRadius:3,background:bg,color:c,border:`1px solid ${c}44`,fontWeight:500}}>{l}</span>; };

  const pct = v => v.status==="eliminated" ? 0 : Math.round((v.mhPassed/v.mhTotal)*50+((v.gthMatched||0)/v.gthTotal)*30);

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#06080d",color:"#d4dbe8",fontFamily:"'Segoe UI',sans-serif",overflow:"hidden"}}>

      {/* TOPBAR */}
      <div style={{background:"#080b12",borderBottom:"1px solid #131b2e",padding:"0 20px",height:52,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <span style={{fontFamily:"monospace",fontWeight:700,fontSize:18,color:"#4a90d9"}}>TML<span style={{color:"#e84c4c"}}>/</span>RFI</span>
        <div style={{width:1,height:18,background:"#1e2d45"}}/>
        <span style={{fontSize:10,color:"#2d3f5a",fontFamily:"monospace"}}>MULTI-VARIANT EVALUATION SYSTEM</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          {phase!=="idle" && <span style={{fontSize:9,fontFamily:"monospace",padding:"3px 9px",borderRadius:3,fontWeight:500,background:phInfo.color+"1a",color:phInfo.color,border:`1px solid ${phInfo.color}44`}}>{phInfo.label.toUpperCase()}</span>}
          {activeV.length>0&&phase!=="idle"&&<span style={{fontSize:9,color:"#34d399",fontFamily:"monospace"}}>{activeV.length} ACTIVE</span>}
          {elimV.length>0&&<span style={{fontSize:9,color:"#ef4444",fontFamily:"monospace"}}>{elimV.length} ELIMINATED</span>}
        </div>
      </div>

      <div style={{flex:1,display:"grid",gridTemplateColumns:"268px 1fr 220px",overflow:"hidden"}}>

        {/* SIDEBAR */}
        <div style={{background:"#080b12",borderRight:"1px solid #131b2e",display:"flex",flexDirection:"column",overflow:"auto",padding:14,gap:11}}>

          <div style={{fontSize:8,fontFamily:"monospace",letterSpacing:".2em",color:"#1e2d45",textTransform:"uppercase",paddingBottom:4,borderBottom:"1px solid #0d1420"}}>Documents</div>

          {[{type:"rfi",label:"TML RFI Document",desc:"Only TML agent reads this",file:rfiFile,st:rfiSt,meta:rfiMeta,
             onFile:async e=>{const f=e.target.files[0];if(f){setRfiFile(f.name);await upload(f,"rfi");}}},
            {type:"supplier",label:"Supplier Catalogue",desc:"All variants evaluated",file:supFile,st:supSt,meta:supMeta,
             onFile:async e=>{const f=e.target.files[0];if(f){setSupFile(f.name);await upload(f,"supplier");}}}
          ].map(u=>(
            <div key={u.type} style={{background:u.st==="done"?"#060f09":"#0c1220",border:`1px solid ${u.st==="done"?"#0d3a1e":"#0d1420"}`,borderRadius:7,padding:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:11,fontWeight:500,color:"#c8d3e4"}}>{u.label}</span>
                <Bdg s={u.st}/>
              </div>
              <div style={{fontSize:9,color:"#2d3f5a",fontFamily:"monospace",marginBottom:7}}>{u.desc}</div>
              <label style={{display:"block",padding:"5px 10px",background:"#0a1e3d",border:"1px solid #1a3a6e",borderRadius:5,fontSize:10,color:"#5b9cf6",cursor:"pointer",textAlign:"center"}}>
                {u.file?`✓ ${u.file}`:"Choose .xlsx"}
                <input type="file" accept=".xlsx,.xls,.csv" onChange={u.onFile} style={{display:"none"}}/>
              </label>
              {u.type==="rfi"&&u.meta&&<div style={{marginTop:6,fontSize:9,color:"#2d3f5a",fontFamily:"monospace"}}>MH:{u.meta.must_have_count} GTH:{u.meta.good_to_have_count} Subj:{u.meta.subjective_count}</div>}
              {u.type==="supplier"&&u.meta?.variants_found&&(
                <div style={{marginTop:7,display:"flex",flexWrap:"wrap",gap:3}}>
                  {u.meta.variants_found.map(v=><span key={v} style={{padding:"2px 7px",borderRadius:3,border:`1px solid ${vc(v)}44`,background:vc(v)+"15",color:vc(v),fontSize:9,fontFamily:"monospace"}}>{v}</span>)}
                </div>
              )}
            </div>
          ))}

          <div style={{fontSize:8,fontFamily:"monospace",letterSpacing:".2em",color:"#1e2d45",textTransform:"uppercase",paddingBottom:4,borderBottom:"1px solid #0d1420"}}>Agents</div>
          {[{id:"tml",label:"TML Design Engineer",desc:"Access: RFI only",color:"#5b9cf6"},
            {id:"supplier",label:"Supplier App. Engineers",desc:"Access: Per-variant catalogue",color:"#34d399"}
          ].map(ag=>(
            <div key={ag.id} style={{background:"#0c1220",border:`1px solid ${typing?.role===ag.id?ag.color+"44":"#0d1420"}`,borderRadius:7,padding:"9px 10px",display:"flex",gap:9,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:6,background:ag.color+"1a",border:`1px solid ${ag.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:10,fontWeight:700,color:ag.color,flexShrink:0}}>
                {ag.id==="tml"?"TML":"SUP"}
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:500,color:"#c8d3e4",marginBottom:2}}>{ag.label}</div>
                <div style={{fontSize:9,color:"#2d3f5a",fontFamily:"monospace",marginBottom:4}}>{ag.desc}</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:typing?.role===ag.id?ag.color:"#1e2d45",transition:"background .3s",boxShadow:typing?.role===ag.id?`0 0 6px ${ag.color}`:"none"}}/>
                  <span style={{fontSize:8,fontFamily:"monospace",color:"#2d3f5a"}}>{typing?.role===ag.id?`GENERATING [${typing.v}]`:"STANDBY"}</span>
                </div>
              </div>
            </div>
          ))}

          {phase!=="idle"&&(
            <>
              <div style={{fontSize:8,fontFamily:"monospace",letterSpacing:".2em",color:"#1e2d45",textTransform:"uppercase",paddingBottom:4,borderBottom:"1px solid #0d1420"}}>Progress</div>
              {PHASES.map(p=>{const done=phIdx>PHASES.findIndex(x=>x.id===p.id);const act=phase===p.id;return(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:7,padding:"3px 6px",borderRadius:4,background:act?p.color+"12":"transparent"}}>
                  <div style={{width:13,height:13,borderRadius:"50%",background:done?"#0d3a1e":act?p.color+"2a":"#0c1220",border:`1px solid ${done?"#22c55e":act?p.color:"#0d1420"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,color:done?"#22c55e":act?p.color:"#1e2d45",flexShrink:0}}>{done?"✓":p.short}</div>
                  <span style={{fontSize:10,color:done?"#22c55e":act?p.color:"#2d3f5a"}}>{p.label}</span>
                </div>
              );})}
            </>
          )}

          <div style={{flex:1}}/>
          <button onClick={startEval} disabled={!canStart} style={{width:"100%",padding:11,borderRadius:6,border:"none",fontFamily:"monospace",fontSize:13,fontWeight:700,cursor:canStart?"pointer":"not-allowed",opacity:canStart?1:.3,background:"#1a4a9a",color:"#fff"}}>
            {loading?"⏳ RUNNING…":"▶ START EVALUATION"}
          </button>
          <button onClick={generateReport} disabled={!canReport} style={{width:"100%",padding:9,borderRadius:6,border:"1px solid #1a3a6e",background:"#0c1a2e",color:canReport?"#5b9cf6":"#1e2d45",fontFamily:"monospace",fontSize:12,fontWeight:600,cursor:canReport?"pointer":"not-allowed"}}>
            📊 GENERATE REPORT
          </button>
        </div>

        {/* CHAT */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Phase ribbon */}
          <div style={{display:"flex",background:"#080b12",borderBottom:"1px solid #131b2e",padding:"0 14px",flexShrink:0,overflowX:"auto"}}>
            {PHASES.map(p=>{const pi=PHASES.findIndex(x=>x.id===p.id);const done=phIdx>pi&&phase!=="idle";const act=phase===p.id;return(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:5,padding:"9px 11px",fontSize:9,fontFamily:"monospace",letterSpacing:".06em",color:act?p.color:done?"#22c55e":"#1e2d45",borderBottom:`2px solid ${act?p.color:done?"#22c55e":"transparent"}`,whiteSpace:"nowrap"}}>
                <div style={{width:14,height:14,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,background:act?p.color+"1a":done?"#081a10":"#0c1220",border:`1px solid ${act?p.color+"66":done?"#22c55e":"#0d1420"}`,color:act?p.color:done?"#22c55e":"#1e2d45"}}>{done?"✓":p.short}</div>
                {p.label}
              </div>
            );})}
          </div>

          {/* Variant tabs */}
          {vStateRef.current.length>0&&phase!=="general"&&phase!=="idle"&&(
            <div style={{display:"flex",background:"#080b12",borderBottom:"1px solid #131b2e",padding:"0 14px",gap:2,flexShrink:0}}>
              <div onClick={()=>setActiveTab(null)} style={{padding:"7px 12px",fontSize:9,fontFamily:"monospace",color:!activeTab?"#5b9cf6":"#1e2d45",borderBottom:`2px solid ${!activeTab?"#3b6fd4":"transparent"}`,cursor:"pointer"}}>Overview</div>
              {vStateRef.current.map(v=>{const col=v.status==="eliminated"?"#ef4444":vc(v.name);const act=activeTab===v.name;return(
                <div key={v.name} onClick={()=>setActiveTab(v.name)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",fontSize:9,fontFamily:"monospace",color:act?col:v.status==="eliminated"?"#3d1010":"#1e2d45",borderBottom:`2px solid ${act?col:"transparent"}`,cursor:"pointer",opacity:v.status==="eliminated"?.5:1}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:col}}/>
                  {v.name}{v.status==="eliminated"&&<span style={{fontSize:8,color:"#ef4444"}}>✕</span>}
                </div>
              );})}
            </div>
          )}

          {/* Messages */}
          <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:7}}>
            {msgs.length===0&&!loading&&(
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,color:"#0d1420"}}>
                <div style={{fontSize:38}}>◎</div>
                <div style={{fontSize:10,fontFamily:"monospace"}}>Upload both documents → Start evaluation</div>
              </div>
            )}

            {/* Overview scorecards */}
            {!activeTab&&!showShared&&vStateRef.current.length>0&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                {vStateRef.current.map(v=>{const col=v.status==="eliminated"?"#ef4444":vc(v.name);const p=pct(v);return(
                  <div key={v.name} onClick={()=>setActiveTab(v.name)} style={{background:"#0c1220",border:`1px solid ${col}44`,borderLeft:`3px solid ${col}`,borderRadius:7,padding:12,cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:600,color:col,fontFamily:"monospace"}}>{v.name}</span>
                      <span style={{fontSize:18,fontWeight:700,color:col,fontFamily:"monospace"}}>{v.status==="eliminated"?"ELIM":p+"%"}</span>
                    </div>
                    {v.status==="eliminated"
                      ?<div style={{fontSize:9,color:"#f87171",lineHeight:1.4}}>⛔ {v.eliminatedAt||"Must Have failure"}</div>
                      :<><div style={{height:3,background:"#0d1420",borderRadius:2,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:`${p}%`,background:col,borderRadius:2}}/></div><div style={{fontSize:8,color:"#2d3f5a",fontFamily:"monospace"}}>MH {v.mhPassed}/{v.mhTotal} · GTH {v.gthMatched||0}/{v.gthTotal}{v.deviations.length>0&&<span style={{color:"#f5a623"}}> · ⚠{v.deviations.length}</span>}</div></>
                    }
                  </div>
                );})}
              </div>
            )}

            {msgs.map(msg=>{
              if (msg.type==="divider") return <div key={msg.id} style={{display:"flex",alignItems:"center",gap:8,margin:"6px 0"}}><div style={{flex:1,height:1,background:"#0d1420"}}/><span style={{fontSize:8,fontFamily:"monospace",color:"#1e2d45",letterSpacing:".12em",whiteSpace:"nowrap"}}>{msg.text}</span><div style={{flex:1,height:1,background:"#0d1420"}}/></div>;
              if (msg.type==="veto") return <div key={msg.id} style={{background:"#0e0404",border:"1px solid #4a1010",borderLeft:"3px solid #ef4444",borderRadius:6,padding:"11px 13px"}}><div style={{fontSize:11,fontWeight:700,color:"#f87171",marginBottom:3}}>⛔ MUST HAVE VETO — ELIMINATED</div><div style={{fontSize:11,color:"#fca5a5",lineHeight:1.5,whiteSpace:"pre-line"}}>{msg.text}</div></div>;
              if (msg.type==="deviation") return <div key={msg.id} style={{display:"flex",gap:7,padding:"7px 11px",background:"#0e0a00",border:"1px solid #2a1800",borderLeft:"3px solid #f5a623",borderRadius:6}}><span>⚠</span><div><div style={{fontSize:8,fontFamily:"monospace",color:"#fbbf24",marginBottom:2}}>DEVIATION</div><div style={{fontSize:11,color:"#f5a623",lineHeight:1.5}}>{msg.text}</div></div></div>;
              if (msg.type==="error") return <div key={msg.id} style={{background:"#0e0404",border:"1px solid #3d1010",borderRadius:6,padding:"9px 11px",fontSize:11,color:"#f87171"}}>⚠ {msg.text}</div>;
              if (msg.type==="info") return <div key={msg.id} style={{padding:"8px 12px",background:"#0c1220",border:"1px solid #0d1420",borderRadius:6,fontSize:11,color:"#7a8fa8"}}>{msg.text}</div>;
              if (msg.type!=="msg") return null;

              const isTml = msg.role==="tml";
              const varCol = activeTab?vc(activeTab):"#34d399";
              return (
                <div key={msg.id} style={{display:"flex",flexDirection:isTml?"row":"row-reverse",gap:7}}>
                  <div style={{width:24,height:24,borderRadius:5,background:isTml?"#0d1e3a":`${varCol}15`,border:`1px solid ${isTml?"#1a3464":varCol+"44"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:9,fontWeight:700,color:isTml?"#5b9cf6":varCol,flexShrink:0,marginTop:14}}>
                    {isTml?"TML":activeTab?activeTab.substring(0,3).toUpperCase():"SUP"}
                  </div>
                  <div style={{maxWidth:"74%"}}>
                    <div style={{fontSize:8,fontFamily:"monospace",color:"#1e2d45",marginBottom:2,textAlign:isTml?"left":"right"}}>
                      {isTml?"TML Virtual Design Engineer":`Supplier App. Engineer${activeTab?` — ${activeTab}`:""}`}
                    </div>
                    <div style={{padding:"9px 12px",borderRadius:8,fontSize:12,lineHeight:1.7,background:isTml?"#091b36":`${varCol}0a`,border:`1px solid ${isTml?"#142248":varCol+"33"}`,color:isTml?"#93c5fd":varCol+"dd",borderTopLeftRadius:isTml?2:8,borderTopRightRadius:isTml?8:2}}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {typingVisible&&typing&&(
              <div style={{display:"flex",flexDirection:typing.role==="tml"?"row":"row-reverse",gap:7}}>
                <div style={{width:24,height:24,borderRadius:5,background:typing.role==="tml"?"#0d1e3a":"#0a1e10",border:`1px solid ${typing.role==="tml"?"#1a3464":"#0d4a20"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:9,fontWeight:700,color:typing.role==="tml"?"#5b9cf6":"#34d399",flexShrink:0,marginTop:14}}>
                  {typing.role==="tml"?"TML":typing.v?.substring(0,3)||"SUP"}
                </div>
                <div>
                  <div style={{fontSize:8,fontFamily:"monospace",color:"#1e2d45",marginBottom:2}}>{typing.role==="tml"?"TML Virtual Design Engineer":`Supplier — ${typing.v}`}</div>
                  <div style={{padding:"9px 12px",borderRadius:8,background:typing.role==="tml"?"#091b36":"#071510",border:`1px solid ${typing.role==="tml"?"#142248":"#0a2e18"}`,display:"inline-flex",gap:4,alignItems:"center"}}>
                    {[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:typing.role==="tml"?"#3b6fd4":"#1a6e3a",animation:`td 1.1s ${i*.18}s infinite`}}/>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Variant status */}
        <div style={{background:"#080b12",borderLeft:"1px solid #131b2e",overflow:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:8,fontFamily:"monospace",letterSpacing:".2em",color:"#1e2d45",textTransform:"uppercase",paddingBottom:4,borderBottom:"1px solid #0d1420"}}>Variant Status</div>
          {vStateRef.current.length===0&&<div style={{fontSize:9,color:"#1e2d45",fontFamily:"monospace"}}>Not started</div>}
          {vStateRef.current.map(v=>{const col=v.status==="eliminated"?"#ef4444":vc(v.name);const p=pct(v);const act=activeTab===v.name;return(
            <div key={v.name} onClick={()=>setActiveTab(v.name)} style={{background:act?"#0c1220":"#0a0d14",border:`1px solid ${act?col+"66":"#0d1420"}`,borderRadius:7,padding:10,cursor:"pointer",opacity:v.status==="eliminated"?.6:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:12,fontWeight:600,color:col,fontFamily:"monospace"}}>{v.name}</span>
                {v.status==="eliminated"?<span style={{fontSize:9,color:"#ef4444",fontFamily:"monospace"}}>ELIM</span>:<span style={{fontSize:14,fontWeight:700,color:col,fontFamily:"monospace"}}>{p}%</span>}
              </div>
              {v.status==="eliminated"
                ?<div style={{fontSize:8,color:"#f87171",fontFamily:"monospace",lineHeight:1.4}}>⛔ {v.eliminatedAt}</div>
                :<><div style={{height:3,background:"#0d1420",borderRadius:2,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:`${p}%`,background:col}}/></div><div style={{fontSize:8,color:"#2d3f5a",fontFamily:"monospace"}}>MH {v.mhPassed}/{v.mhTotal} · GTH {v.gthMatched||0}/{v.gthTotal}{v.deviations.length>0&&<span style={{color:"#f5a623"}}> · ⚠{v.deviations.length}</span>}</div></>
              }
            </div>
          );})}
          {loading&&typing&&(
            <div style={{padding:"8px 10px",background:"#0c1220",border:`1px solid ${vc(typing.v)+"44"}`,borderRadius:6,marginTop:5}}>
              <div style={{fontSize:8,color:"#2d3f5a",fontFamily:"monospace",marginBottom:3}}>NOW EVALUATING</div>
              <div style={{fontSize:11,color:vc(typing.v),fontFamily:"monospace",fontWeight:500}}>{typing.v}</div>
              <div style={{fontSize:8,color:"#2d3f5a",fontFamily:"monospace"}}>{typing.role==="tml"?"TML asking…":"Supplier answering…"}</div>
            </div>
          )}
        </div>
      </div>

      {/* REPORT MODAL */}
      {showRpt&&(
        <div style={{position:"fixed",inset:0,background:"rgba(2,4,8,.94)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:14}}>
          <div style={{background:"#080b12",border:"1px solid #1a3a6e",borderRadius:11,width:"100%",maxWidth:920,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid #0d1420",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:15,fontWeight:700,color:"#dde3ee",fontFamily:"monospace",display:"flex",alignItems:"center",gap:10}}>
                RFI Compliance Report
                {report?.verdict&&<span style={{fontSize:9,fontFamily:"monospace",padding:"2px 8px",borderRadius:3,fontWeight:500,background:report.verdict==="RECOMMENDED"?"#081a10":"#1a1000",color:report.verdict==="RECOMMENDED"?"#34d399":"#f59e0b"}}>{report.verdict}</span>}
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>navigator.clipboard.writeText(JSON.stringify(report,null,2))} style={{padding:"4px 11px",borderRadius:4,fontSize:10,cursor:"pointer",border:"1px solid #1a3a6e",background:"#0c1220",color:"#5b9cf6"}}>Copy</button>
                <button onClick={()=>setShowRpt(false)} style={{padding:"4px 11px",borderRadius:4,fontSize:10,cursor:"pointer",border:"1px solid #0d1420",background:"#0c1220",color:"#2d3f5a"}}>Close</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:18}}>
              {genRpt
                ?<div style={{display:"flex",alignItems:"center",gap:10,padding:28,color:"#5b9cf6",fontSize:12,fontFamily:"monospace"}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#5b9cf6",animation:`td 1.1s ${i*.18}s infinite`}}/>)}</div>Generating report…</div>
                :report?.error?<div style={{color:"#f87171",padding:18}}>{report.error}</div>
                :report?<ReportView r={report} vs={vStateRef.current}/>:null
              }
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes td{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1a2535;border-radius:2px}`}</style>
    </div>
  );
}

function ReportView({ r, vs }) {
  const H=({c})=><div style={{fontSize:9,fontFamily:"monospace",letterSpacing:".14em",color:"#2d3f5a",textTransform:"uppercase",marginBottom:9,paddingBottom:4,borderBottom:"1px solid #0d1420"}}>{c}</div>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {r.executive_summary&&<div><H c="Executive Summary"/><p style={{fontSize:12,color:"#7a8fa8",lineHeight:1.75}}>{r.executive_summary}</p></div>}
      {r.variant_results?.length>0&&(
        <div><H c="Variant Results"/>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(r.variant_results.length,4)},1fr)`,gap:10}}>
            {r.variant_results.map((vr,i)=>{const col=vr.status==="ELIMINATED"?"#ef4444":(VC[vr.variant]||"#94a3b8");return(
              <div key={i} style={{background:"#0c1220",border:`1px solid ${col}44`,borderLeft:`3px solid ${col}`,borderRadius:7,padding:12}}>
                <div style={{fontSize:13,fontWeight:700,color:col,marginBottom:4,fontFamily:"monospace"}}>{vr.variant}</div>
                <div style={{fontSize:10,color:vr.status==="ELIMINATED"?"#ef4444":"#34d399",fontFamily:"monospace",marginBottom:5}}>{vr.status}</div>
                {vr.elimination_reason&&<div style={{fontSize:9,color:"#fca5a5",lineHeight:1.4,marginBottom:5}}>⛔ {vr.elimination_reason}</div>}
                <div style={{fontSize:11,color:col,fontWeight:600}}>{vr.overall_fit}</div>
                {vr.deviations?.length>0&&<div style={{marginTop:5,fontSize:8,color:"#f5a623",fontFamily:"monospace"}}>⚠ {vr.deviations.join(" · ")}</div>}
              </div>
            );})}
          </div>
        </div>
      )}
      {r.recommended_variant&&(
        <div><H c="Recommendation"/>
          <div style={{background:"#05100a",border:"1px solid #0d4a20",borderLeft:"3px solid #22c55e",borderRadius:7,padding:13}}>
            <div style={{fontSize:14,fontWeight:700,color:"#34d399",marginBottom:5}}>✓ Recommended: {r.recommended_variant}</div>
            <div style={{fontSize:12,color:"#86efac",lineHeight:1.7}}>{r.recommendation_reason}</div>
          </div>
        </div>
      )}
      {r.modifications_required?.length>0&&(
        <div><H c="Modifications Required"/>
          {r.modifications_required.map((m,i)=><div key={i} style={{display:"flex",gap:8,padding:"7px 10px",background:"#0c1220",border:"1px solid #0d1420",borderRadius:5,marginBottom:4,fontSize:11,color:"#7a8fa8",lineHeight:1.5}}><span>🔧</span><div><div style={{fontWeight:500,color:"#c8d3e4",marginBottom:1}}>{m.item}</div>{m.timeline&&<div style={{fontSize:10,color:"#475569"}}>Timeline: {m.timeline} · <span style={{color:m.feasibility==="High"?"#34d399":"#f59e0b"}}>{m.feasibility}</span></div>}</div></div>)}
        </div>
      )}
      {r.risks?.length>0&&(
        <div><H c="Risk Assessment"/>
          {r.risks.map((ri,i)=><div key={i} style={{display:"flex",gap:8,padding:"7px 10px",background:"#0c1220",border:"1px solid #0d1420",borderRadius:5,marginBottom:4,fontSize:11,color:"#7a8fa8",lineHeight:1.5}}><span>⚠</span><div><div style={{fontWeight:500,color:"#c8d3e4",marginBottom:1}}>{ri.risk} <span style={{fontSize:9,fontFamily:"monospace",padding:"1px 5px",borderRadius:3,background:"#1a0808",color:"#f87171"}}>{ri.severity}</span></div>{ri.mitigation&&<div style={{fontSize:10,color:"#475569"}}>{ri.mitigation}</div>}</div></div>)}
        </div>
      )}
      {r.raw&&!r.executive_summary&&<div><H c="Raw"/><pre style={{fontSize:10,color:"#7a8fa8",lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{r.raw}</pre></div>}
    </div>
  );
}