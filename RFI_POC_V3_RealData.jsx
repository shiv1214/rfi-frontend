import { useState, useRef, useEffect, useCallback } from "react";

const DEFAULT_RFI = {
  project: {
    name: "Columbus", vehicle: "N3 Heavy Commercial Vehicle (46T GVW)",
    sop: "October 2026", alpha_build: "June 2025", beta_build: "December 2025",
    location: "Jamshedpur", market: "India and SARC Countries",
    warranty: "10 years or 5 lac KM whichever is earlier",
    volumes: { y1: "15,000", y2: "25,000", y3: "30,000", y4: "25,000", y5: "20,000" },
    localisation: "Yes — PLI/PM-E drive guidelines", alpha_qty: "6 Nos", beta_qty: "15 Nos",
  },
  component: "eAxle Drive System",
  must_have: [
    { id: "MH01", parameter: "Driveline Architecture", requirement: "eAxle" },
    { id: "MH02", parameter: "Operating Voltage Range", requirement: "500 Vdc to 800 Vdc" },
    { id: "MH03", parameter: "Cooling", requirement: "Water/Liquid cooling" },
    { id: "MH04", parameter: "Motor Technology", requirement: "PMSM" },
  ],
  good_to_have: [
    { id: "GTH01", parameter: "Protection Rating", preferred: "IP6K9K" },
    { id: "GTH02", parameter: "Control Voltage", preferred: "24V nominal (18V–30V)" },
    { id: "GTH03", parameter: "Control Loops", preferred: "Both speed and torque" },
    { id: "GTH04", parameter: "CAN Bus Speed", preferred: "500 kbps / configurable" },
    { id: "GTH05", parameter: "Traction Drive Operation", preferred: "4 quadrant operation" },
    { id: "GTH06", parameter: "Safety Requirements", preferred: "ASIL C" },
    { id: "GTH07", parameter: "EMI/EMC Compatibility", preferred: "Compliant (AIS004)" },
  ],
  subjective: [
    { id: "SB01", parameter: "Peak Torque", target: "2160 Nm at 0 rpm" },
    { id: "SB02", parameter: "Peak Torque Duration", target: "30 sec" },
    { id: "SB03", parameter: "Peak Power", target: "410 kW" },
    { id: "SB04", parameter: "Maximum Motor Speed", target: "3500 rpm" },
    { id: "SB05", parameter: "Continuous Torque", target: "1300 Nm" },
    { id: "SB06", parameter: "Continuous Power", target: "246 kW" },
    { id: "SB07", parameter: "Average Efficiency", target: "Motor >90%, MCU >93%" },
    { id: "SB08", parameter: "Operating Temperature", target: "-20 to 80°C" },
    { id: "SB09", parameter: "Weight", target: "Motor <200 kg, MCU <25 kg" },
    { id: "SB10", parameter: "Packaging Dimensions", target: "465 x 405 mm" },
    { id: "SB11", parameter: "B10 Life", target: "10 years" },
    { id: "SB12", parameter: "Nominal Voltage", target: "650 Vdc" },
  ],
};

const DEFAULT_SUPPLIER = {
  name: "Supplier X",
  variants: [
    {
      id: "Alpha", tag: "Recommended",
      specs: {
        "Driveline Architecture": "eAxle",
        "Peak Torque": "2223 Nm",
        "Peak Torque Duration": "30 sec",
        "Peak Power": "470 kW",
        "Max Speed": "4000 rpm",
        "Continuous Torque": "1866 Nm",
        "Continuous Power": "360 kW",
        "Nominal Voltage": "650 Vdc",
        "Operating Voltage Range": "300–750 Vdc",
        "Cooling": "Water/Liquid (Glycol+Water 40-60)",
        "Protection": "IP6K9K",
        "Efficiency": "89% combined",
        "Motor Technology": "PMSM",
        "Altitude": "3000 m",
        "Control Voltage": "24V nominal",
        "Control Loops": "Both speed and torque",
        "CAN Bus Speed": "500 kbps / configurable",
        "CAN Communication": "Ref SAE J1939",
        "Traction Drive": "4 quadrant operation",
        "Safety": "Non ASIL",
        "EMI/EMC": "Non Compliant",
        "Operating Temperature": "-20 to 80°C",
        "Weight": "240 kg combined",
        "Packaging Dimensions": "465 x 405 mm",
        "B10 Life": "5 years",
      },
      mh: [true, false, true, true],
      mh_notes: [
        "eAxle architecture confirmed — matches requirement exactly.",
        "Voltage range is 300–750 Vdc. Upper limit is 750V, which is 50V below the required 800V upper limit.",
        "Water/Liquid cooling with Glycol-Water (40-60) mix — meets requirement.",
        "PMSM motor technology confirmed — meets requirement.",
      ],
      gth: [true, true, true, true, true, false, false],
      gth_notes: [
        "IP6K9K protection rating confirmed — meets preference.",
        "24V nominal control voltage with 18V min and 30V max range — meets preference.",
        "Both speed and torque control loops available — meets preference.",
        "500 kbps CAN bus, configurable — meets preference.",
        "4 quadrant traction drive operation — meets preference.",
        "Safety rating is Non ASIL. We do not carry ASIL C certification on this variant.",
        "EMI/EMC is currently Non Compliant with AIS004. This is a known gap we are working to address.",
      ],
      deviations: [
        { param: "Operating Voltage Range", rfi: "500–800 Vdc", offered: "300–750 Vdc", gap: "Upper limit is 750V vs required 800V — 50V shortfall", negotiable: true },
        { param: "Average Efficiency", rfi: "Motor >90%, MCU >93%", offered: "89% combined", gap: "1% below Motor target on combined rating", negotiable: true },
        { param: "Safety Requirements", rfi: "ASIL C preferred", offered: "Non ASIL", gap: "No functional safety certification", negotiable: false },
        { param: "EMI/EMC", rfi: "AIS004 Compliant", offered: "Non Compliant", gap: "No AIS004 certification currently", negotiable: true },
        { param: "Weight", rfi: "Motor <200 kg, MCU <25 kg", offered: "240 kg combined unit", gap: "Integrated unit exceeds target by ~40 kg", negotiable: false },
        { param: "B10 Life", rfi: "10 years", offered: "5 years", gap: "50% of required service life", negotiable: true },
      ],
    },
    {
      id: "Beta", tag: "Alternative",
      specs: { "Driveline Architecture": "Rear Wheel Central Drive", "Peak Torque": "2750 Nm", "Operating Voltage Range": "500–750 Vdc", "Cooling": "Water/Liquid", "Motor Technology": "PMSM", "Weight": "220 kg", "Packaging": "653 x 510 mm", "B10 Life": "5 years" },
      mh: [false, false, true, true],
      mh_notes: [
        "Driveline is Rear Wheel Central Drive, NOT eAxle architecture. This is a fundamental mismatch with TML requirement.",
        "Voltage range 500–750 Vdc — upper limit 750V does not reach 800V.",
        "Water/Liquid cooling confirmed.",
        "PMSM confirmed.",
      ],
      gth: [false, false, true, true, true, false, true],
      gth_notes: ["No IP rating specified.", "Control voltage not specified.", "Both loops supported.", "500 kbps CAN.", "4 quadrant.", "Non ASIL.", "AIS004 compliant."],
      deviations: [{ param: "Driveline Architecture", rfi: "eAxle", offered: "Rear Wheel Central Drive", gap: "Architecture mismatch — cannot be modified", negotiable: false }],
    },
    {
      id: "Gamma", tag: "Compact",
      specs: { "Driveline Architecture": "eAxle", "Peak Torque": "230 Nm", "Operating Voltage Range": "260–360 Vdc", "Cooling": "Water/Liquid", "Motor Technology": "PMSM", "Weight": "75 kg", "B10 Life": "240,000 kms" },
      mh: [true, false, true, true],
      mh_notes: ["eAxle confirmed.", "Voltage range 260–360 Vdc — far outside required 500–800 Vdc.", "Water/Liquid cooling.", "PMSM confirmed."],
      gth: [false, false, true, true, true, true, true],
      gth_notes: ["No IP data.", "No control V data.", "Both loops.", "500 kbps.", "4 quadrant.", "ASIL rated.", "AIS004."],
      deviations: [{ param: "Voltage / Torque", rfi: "500–800 Vdc / 2160 Nm", offered: "260–360 Vdc / 230 Nm", gap: "Wrong application size entirely", negotiable: false }],
    },
    {
      id: "Lambda", tag: "Light Duty",
      specs: { "Driveline Architecture": "eAxle", "Peak Torque": "104 Nm", "Operating Voltage Range": "75–110 Vdc", "Cooling": "Air", "Motor Technology": "PMSM", "Weight": "26 kg" },
      mh: [true, false, false, true],
      mh_notes: ["eAxle confirmed.", "75–110 Vdc — completely outside range.", "Air cooling — Water/Liquid required.", "PMSM confirmed."],
      gth: [false, false, true, true, true, false, true],
      gth_notes: ["No IP.", "No CV.", "Both loops.", "500 kbps.", "4 quad.", "Non ASIL.", "AIS004."],
      deviations: [{ param: "Application Size", rfi: "46T Heavy Truck eAxle", offered: "Light duty 26kg unit", gap: "Wrong application entirely", negotiable: false }],
    },
  ],
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;background:#06080d;color:#d4dbe8;font-family:'Inter',sans-serif;overflow:hidden}
.shell{display:grid;grid-template-columns:300px 1fr 290px;grid-template-rows:56px 1fr;height:100vh}
.tb{grid-column:1/-1;background:#080b12;border-bottom:1px solid #131b2e;display:flex;align-items:center;padding:0 20px;gap:12px}
.tb-logo{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#4a90d9;letter-spacing:.06em}
.tb-logo span{color:#e84c4c}
.tb-sep{width:1px;height:20px;background:#131b2e}
.tb-project{font-family:'JetBrains Mono',monospace;font-size:10px;color:#2d3f5a;letter-spacing:.08em}
.tb-chips{margin-left:auto;display:flex;gap:6px;align-items:center}
.chip{font-size:9px;font-family:'JetBrains Mono',monospace;padding:3px 9px;border-radius:3px;letter-spacing:.06em;font-weight:500}
.c-blue{background:#0a1e3d;border:1px solid #1a3a6e;color:#5b9cf6}
.c-green{background:#081a10;border:1px solid #0d3a1e;color:#34d399}
.c-amber{background:#1a1000;border:1px solid #3d2800;color:#f59e0b}
.c-red{background:#1a0808;border:1px solid #3d1010;color:#f87171}
.lp{background:#080b12;border-right:1px solid #131b2e;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.lp::-webkit-scrollbar{width:3px}.lp::-webkit-scrollbar-thumb{background:#1a2535}
.sec-lbl{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.2em;color:#1e2d45;text-transform:uppercase;padding-bottom:5px;border-bottom:1px solid #131b2e}
.upload-zone{border:1.5px dashed #1a2d45;border-radius:8px;padding:14px;text-align:center;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
.upload-zone:hover{border-color:#2a4a7a;background:#080e1a}
.upload-zone.loaded{border-color:#0d3a1e;border-style:solid;background:#060f09}
.upload-icon{font-size:20px;margin-bottom:6px}
.upload-title{font-size:11px;font-weight:500;color:#7a8fa8;margin-bottom:3px}
.upload-sub{font-size:9px;color:#2d3f5a;font-family:'JetBrains Mono',monospace}
.upload-loaded{font-size:10px;color:#34d399;font-family:'JetBrains Mono',monospace;display:flex;align-items:center;gap:5px;justify-content:center}
.upload-input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.agent-box{background:#0c1220;border:1px solid #131b2e;border-radius:8px;padding:11px;display:flex;gap:10px;align-items:flex-start}
.agent-av{width:32px;height:32px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;flex-shrink:0}
.av-tml{background:#0d2040;color:#5b9cf6;border:1px solid #1a3a6e}
.av-sup{background:#0d2a14;color:#34d399;border:1px solid #0d4a20}
.agent-info{flex:1;min-width:0}
.agent-name{font-size:11px;font-weight:500;color:#c8d3e4;margin-bottom:2px}
.agent-desc{font-size:9px;color:#2d3f5a;line-height:1.4;font-family:'JetBrains Mono',monospace}
.agent-status{display:flex;align-items:center;gap:4px;margin-top:5px}
.a-dot{width:5px;height:5px;border-radius:50%}
.dot-idle{background:#1e2d45}
.dot-active{background:#34d399;animation:apulse 1.2s infinite}
@keyframes apulse{0%,100%{opacity:1;box-shadow:0 0 0 0 #34d39966}50%{opacity:.7;box-shadow:0 0 0 4px transparent}}
.a-st-txt{font-size:8px;font-family:'JetBrains Mono',monospace;color:#2d3f5a}
.var-select{background:#0c1220;border:1px solid #131b2e;border-radius:8px;padding:11px}
.var-select-title{font-size:10px;color:#7a8fa8;margin-bottom:8px;font-weight:500}
.var-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.var-btn{padding:7px 8px;border-radius:5px;border:1px solid #131b2e;background:transparent;font-size:9px;font-family:'JetBrains Mono',monospace;color:#2d3f5a;cursor:pointer;transition:all .15s;text-align:center;line-height:1.4}
.var-btn:hover{border-color:#1a3a6e;color:#5b9cf6;background:#080e1a}
.var-btn.vsel{background:#0a1e3d;border-color:#2a4a8a;color:#5b9cf6}
.var-btn.vfail{border-color:#2d1010;color:#f87171}
.btn-main{width:100%;padding:11px;border-radius:7px;border:none;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;letter-spacing:.04em}
.btn-main:disabled{opacity:.3;cursor:not-allowed}
.btn-start{background:#1a4a9a;color:#fff}
.btn-start:hover:not(:disabled){background:#2256b0}
.btn-report{background:#0c1a2e;color:#5b9cf6;border:1px solid #1a3a6e;margin-top:4px}
.btn-report:hover:not(:disabled){background:#0a1e3d}
.rfi-summary{background:#0c1220;border:1px solid #131b2e;border-radius:8px;padding:11px}
.rfi-title{font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dde3ee;margin-bottom:8px;letter-spacing:.03em}
.rfi-row{display:flex;justify-content:space-between;gap:6px;padding:3px 0;border-bottom:1px solid #0d1420}
.rfi-row:last-child{border:none}
.rk{font-size:9px;color:#2d3f5a;font-family:'JetBrains Mono',monospace;flex-shrink:0}
.rv{font-size:9px;color:#7a8fa8;text-align:right;max-width:62%}
.cp{display:flex;flex-direction:column;background:#060810;overflow:hidden}
.phase-ribbon{display:flex;background:#080b12;border-bottom:1px solid #131b2e;padding:0 16px;overflow-x:auto}
.phase-ribbon::-webkit-scrollbar{display:none}
.ph-step{display:flex;align-items:center;gap:6px;padding:10px 14px;font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.08em;color:#1e2d45;border-bottom:2px solid transparent;white-space:nowrap;transition:all .2s}
.ph-step.ph-active{color:#5b9cf6;border-bottom-color:#2563eb}
.ph-step.ph-done{color:#34d399;border-bottom-color:#0d6e3a}
.ph-step.ph-elim{color:#f87171;border-bottom-color:#7f1d1d}
.ph-num{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;background:#0c1220;border:1px solid #131b2e;flex-shrink:0}
.ph-step.ph-active .ph-num{background:#0a1e3d;border-color:#2a4a8a;color:#5b9cf6}
.ph-step.ph-done .ph-num{background:#081a10;border-color:#0d4a20;color:#34d399}
.variant-banner{padding:7px 16px;background:#060e09;border-bottom:1px solid #0a2410;display:flex;align-items:center;gap:8px;font-size:10px;color:#34d399;font-family:'JetBrains Mono',monospace}
.vb-lbl{color:#1e2d45}
.chat-area{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth}
.chat-area::-webkit-scrollbar{width:3px}
.chat-area::-webkit-scrollbar-thumb{background:#131b2e}
.msg{display:flex;gap:8px;animation:fadein .2s ease}
@keyframes fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.msg.tml{flex-direction:row}
.msg.sup{flex-direction:row-reverse}
.m-av{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;flex-shrink:0;margin-top:15px}
.m-av.ta{background:#0d2040;color:#5b9cf6;border:1px solid #1a3a6e}
.m-av.sa{background:#0d2a14;color:#34d399;border:1px solid #0d4a20}
.m-body{max-width:74%}
.m-who{font-size:8px;font-family:'JetBrains Mono',monospace;color:#1e2d45;margin-bottom:3px}
.msg.sup .m-who{text-align:right}
.m-bub{padding:10px 13px;border-radius:9px;font-size:12px;line-height:1.7}
.msg.tml .m-bub{background:#0a1e3d;border:1px solid #162a52;color:#a8c4f0;border-top-left-radius:2px}
.msg.sup .m-bub{background:#0e1a28;border:1px solid #1a2a3d;color:#c8d3e4;border-top-right-radius:2px}
.m-bub strong{color:#dde3ee;font-weight:500}
.streaming::after{content:'▋';animation:cur .7s infinite;color:#5b9cf6;font-size:10px}
@keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
.divider{display:flex;align-items:center;gap:10px;margin:4px 0;animation:fadein .3s ease}
.div-line{flex:1;height:1px;background:#131b2e}
.div-label{font-size:8px;font-family:'JetBrains Mono',monospace;color:#1e2d45;letter-spacing:.12em;white-space:nowrap}
.dev-inline{display:flex;gap:8px;padding:9px 12px;background:#120e00;border:1px solid #3a2800;border-radius:7px;animation:fadein .3s ease}
.di-icon{flex-shrink:0;margin-top:1px}
.di-body{font-size:11px;color:#f5a623;line-height:1.5}
.di-body strong{font-size:9px;font-family:'JetBrains Mono',monospace;color:#fbbf24;display:block;margin-bottom:2px;letter-spacing:.06em}
.neg-inline{display:flex;gap:8px;padding:9px 12px;background:#0a1a0d;border:1px solid #1a4a25;border-radius:7px;animation:fadein .3s ease}
.ni-body{font-size:11px;color:#6ee7b7;line-height:1.5}
.ni-body strong{font-size:9px;font-family:'JetBrains Mono',monospace;color:#34d399;display:block;margin-bottom:2px;letter-spacing:.06em}
.veto-inline{background:#150808;border:1px solid #5a1515;border-left:3px solid #ef4444;border-radius:7px;padding:12px 14px;animation:fadein .3s ease}
.veto-t{font-size:12px;font-weight:700;color:#f87171;display:flex;align-items:center;gap:6px;margin-bottom:4px;font-family:'Rajdhani',sans-serif;letter-spacing:.04em}
.veto-r{font-size:10px;color:#fca5a5;line-height:1.5}
.typing-wrap{display:flex;gap:4px;padding:2px 0;align-items:center}
.td{width:4px;height:4px;border-radius:50%;background:#2a3a52;animation:tb 1.1s infinite}
.td:nth-child(2){animation-delay:.18s}.td:nth-child(3){animation-delay:.36s}
@keyframes tb{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
.empty-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#131b2e}
.es-icon{font-size:36px}.es-text{font-size:10px;font-family:'JetBrains Mono',monospace}
.rp{background:#080b12;border-left:1px solid #131b2e;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.rp::-webkit-scrollbar{width:3px}.rp::-webkit-scrollbar-thumb{background:#1a2535}
.score-hero{background:#0c1220;border:1px solid #131b2e;border-radius:8px;padding:14px;text-align:center}
.sh-num{font-family:'Rajdhani',sans-serif;font-size:40px;font-weight:700;line-height:1}
.sh-lbl{font-size:8px;font-family:'JetBrains Mono',monospace;color:#1e2d45;letter-spacing:.14em;margin-top:4px}
.bar-row{display:flex;align-items:center;gap:8px;margin-bottom:5px}
.bar-lbl{font-size:8px;font-family:'JetBrains Mono',monospace;color:#2d3f5a;width:80px;flex-shrink:0}
.bar-bg{flex:1;height:4px;background:#131b2e;border-radius:2px;overflow:hidden}
.bar-fill{height:100%;border-radius:2px;transition:width .6s ease}
.bar-val{font-size:9px;font-family:'JetBrains Mono',monospace;color:#2d3f5a;width:26px;text-align:right;flex-shrink:0}
.req-list{display:flex;flex-direction:column;gap:3px}
.rq{display:flex;align-items:center;gap:5px;padding:4px 7px;border-radius:4px;background:#0c1220;border:1px solid #0d1420}
.rq-d{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.rq-nm{font-size:8px;color:#2d3f5a;flex:1;font-family:'JetBrains Mono',monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rq-st{font-size:8px;font-family:'JetBrains Mono',monospace;flex-shrink:0}
.d-p{background:#22c55e}.d-f{background:#ef4444}.d-w{background:#f59e0b}.d-n{background:#1e2d45}
.s-p{color:#22c55e}.s-f{color:#ef4444}.s-w{color:#f59e0b}.s-n{color:#1e2d45}
.elim-hero{background:#150808;border:1px solid #5a1515;border-radius:8px;padding:12px;text-align:center}
.eh-t{font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f87171;margin-bottom:4px}
.eh-r{font-size:9px;color:#fca5a5;line-height:1.5}
.dev-tag{font-size:8px;font-family:'JetBrains Mono',monospace;color:#f5a623;background:#161000;border:1px solid #2a1f00;border-radius:3px;padding:3px 6px;line-height:1.4;margin-bottom:3px}
.overlay{position:fixed;inset:0;background:rgba(4,6,10,.93);display:flex;align-items:center;justify-content:center;z-index:300;padding:16px}
.modal{background:#080b12;border:1px solid #1a3a6e;border-radius:12px;width:100%;max-width:960px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden}
.modal-hdr{padding:16px 20px;border-bottom:1px solid #131b2e;display:flex;align-items:center;justify-content:space-between}
.modal-ttl{font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#dde3ee;letter-spacing:.04em;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.modal-acts{display:flex;gap:6px}
.m-act{padding:5px 12px;border-radius:5px;font-size:10px;cursor:pointer;border:1px solid #1a3a6e;background:#0c1220;color:#5b9cf6;transition:all .12s;font-family:'Inter',sans-serif}
.m-act:hover{background:#0a1e3d}
.m-close{border-color:#131b2e;color:#2d3f5a}
.modal-body{flex:1;overflow-y:auto;padding:20px}
.modal-body::-webkit-scrollbar{width:3px}.modal-body::-webkit-scrollbar-thumb{background:#131b2e}
.r-sec{margin-bottom:22px}
.r-sec-t{font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:.15em;color:#2d3f5a;text-transform:uppercase;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #131b2e}
.r-txt{font-size:12px;color:#7a8fa8;line-height:1.75}
.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:4px}
.chart-card{background:#0c1220;border:1px solid #131b2e;border-radius:8px;padding:14px}
.chart-lbl{font-size:8px;font-family:'JetBrains Mono',monospace;color:#2d3f5a;letter-spacing:.12em;margin-bottom:10px}
.bcr-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.bcr-name{font-size:9px;font-family:'JetBrains Mono',monospace;color:#2d3f5a;width:80px;flex-shrink:0}
.bcr-bg{flex:1;height:20px;background:#0a0e18;border-radius:4px;overflow:hidden}
.bcr-fill{height:100%;border-radius:4px;display:flex;align-items:center;padding:0 8px;transition:width .8s ease}
.bcr-pct{font-size:10px;font-family:'JetBrains Mono',monospace;color:#fff;font-weight:500}
.tl-row{display:grid;grid-template-columns:120px 80px 90px;gap:3px;margin-bottom:3px}
.tl-lbl{font-size:8px;font-family:'JetBrains Mono',monospace;color:#2d3f5a;display:flex;align-items:center}
.tl-cell{border-radius:3px;text-align:center;padding:5px 3px;font-size:8px;font-family:'JetBrains Mono',monospace;font-weight:500}
.tl-g{background:#081a10;color:#34d399}.tl-a{background:#161000;color:#f59e0b}.tl-r{background:#150808;color:#f87171}
.r-tbl{width:100%;border-collapse:collapse;font-size:11px}
.r-tbl th{text-align:left;padding:7px 10px;background:#0c1220;color:#2d3f5a;font-weight:500;font-family:'JetBrains Mono',monospace;font-size:9px;border-bottom:1px solid #0d1420}
.r-tbl td{padding:6px 10px;border-bottom:1px solid #080b12;color:#7a8fa8;vertical-align:top;line-height:1.4}
.r-tbl tr:hover td{background:#0a0e18}
.c-g{color:#34d399;font-weight:500}.c-r{color:#f87171;font-weight:500}.c-a{color:#f59e0b}
.rec-hero{background:#06120a;border:1px solid #145228;border-left:3px solid #22c55e;border-radius:8px;padding:14px}
.rec-name{font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#34d399;margin-bottom:6px;display:flex;align-items:center;gap:8px}
.rec-reason{font-size:12px;color:#86efac;line-height:1.7}
.mod-item{display:flex;gap:8px;padding:8px 10px;background:#0c1220;border:1px solid #131b2e;border-radius:6px;margin-bottom:5px;font-size:11px;color:#7a8fa8;line-height:1.5}
.gen-loader{display:flex;align-items:center;gap:12px;padding:30px 20px;color:#5b9cf6;font-size:12px;font-family:'JetBrains Mono',monospace}
.spider-svg{width:100%;height:190px}
.str-gap-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sg-title{font-size:9px;font-family:'JetBrains Mono',monospace;margin-bottom:6px}
`;

function RadarChart({ vals, label }) {
  const cx = 100, cy = 92, r = 68;
  const axes = ["Must Have","Good to\nHave","Subjective","Torque\nFit","Voltage\nFit","Dimensions\nFit"];
  const n = axes.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (v, i) => [cx + r * v * Math.cos(angle(i)), cy + r * v * Math.sin(angle(i))];
  return (
    <svg className="spider-svg" viewBox="0 0 200 195">
      {[.25,.5,.75,1].map(lv=>(
        <polygon key={lv} points={Array.from({length:n},(_,i)=>pt(lv,i).join(",")).join(" ")} fill="none" stroke="#131b2e" strokeWidth=".5"/>
      ))}
      {Array.from({length:n},(_,i)=>{
        const [x2,y2]=pt(1,i); const [lx,ly]=pt(1.28,i);
        const lines=axes[i].split("\n");
        return (<g key={i}>
          <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#131b2e" strokeWidth=".5"/>
          {lines.map((l,li)=><text key={li} x={lx} y={ly+li*8} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#2d3f5a" fontFamily="JetBrains Mono">{l}</text>)}
        </g>);
      })}
      <polygon points={vals.map((v,i)=>pt(v,i).join(",")).join(" ")} fill="#5b9cf6" fillOpacity=".12" stroke="#5b9cf6" strokeWidth="1.5"/>
      {vals.map((v,i)=>{const [px,py]=pt(v,i);return <circle key={i} cx={px} cy={py} r="2.5" fill="#5b9cf6"/>;})}
      <text x={10} y={186} fontSize="7" fill="#7a8fa8" fontFamily="JetBrains Mono">■</text>
      <text x={18} y={186} fontSize="7" fill="#7a8fa8" fontFamily="JetBrains Mono">{label}</text>
    </svg>
  );
}

export default function RFIEngine() {
  const [rfiData] = useState(DEFAULT_RFI);
  const [supplierData] = useState(DEFAULT_SUPPLIER);
  const [rfiLoaded, setRfiLoaded] = useState(true);
  const [supLoaded, setSupLoaded] = useState(true);
  const [rfiFileName, setRfiFileName] = useState("Test_data_RFI.xlsx");
  const [supFileName, setSupFileName] = useState("Test_data_Supplier_X_catalogue.xlsx");
  const [selectedVar, setSelectedVar] = useState(0);
  const [conv, setConv] = useState([]);
  const [phaseIdx, setPhaseIdx] = useState(-1);
  const [evalStatus, setEvalStatus] = useState("idle");
  const [mhResults, setMhResults] = useState([]);
  const [gthResults, setGthResults] = useState([]);
  const [scores, setScores] = useState({ mh: 0, gth: 0, sb: 0 });
  const [deviations, setDeviations] = useState([]);
  const [typing, setTyping] = useState(null);
  const [running, setRunning] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState(null);
  const [genReport, setGenReport] = useState(false);
  const [agentStatus, setAgentStatus] = useState({ tml: "idle", sup: "idle" });
  const chatRef = useRef(null);
  const runRef = useRef(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [conv, typing]);

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const addMsg = useCallback((role, text) => {
    setConv(p => [...p, { role, text, type: "msg", id: Date.now() + Math.random() }]);
  }, []);

  const addCard = useCallback((type, text, extra) => {
    setConv(p => [...p, { role: type, text, type, extra, id: Date.now() + Math.random() }]);
  }, []);

  const callStream = async (role, systemPrompt, messages) => {
    const msgId = Date.now() + Math.random();
    setConv(p => [...p, { role, text: "", type: "msg", id: msgId, streaming: true }]);
    let full = "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 350, stream: true, system: systemPrompt, messages }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n").filter(l => l.startsWith("data:"));
        for (const line of lines) {
          try {
            const j = JSON.parse(line.slice(5));
            if (j.type === "content_block_delta" && j.delta?.text) {
              full += j.delta.text;
              setConv(p => p.map(m => m.id === msgId ? { ...m, text: full } : m));
            }
          } catch {}
        }
      }
    } catch { full = "[API error — please retry]"; }
    setConv(p => p.map(m => m.id === msgId ? { ...m, streaming: false } : m));
    return full;
  };

  const callOnce = async (system, messages) => {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 280, system, messages }),
      });
      const d = await res.json();
      return d.content?.[0]?.text?.trim() || "";
    } catch { return "[error]"; }
  };

  const startEvaluation = async () => {
    if (running) return;
    const variant = supplierData.variants[selectedVar];
    setRunning(true); runRef.current = true;
    setConv([]); setPhaseIdx(0); setEvalStatus("running");
    setMhResults([]); setGthResults([]);
    setScores({ mh: 0, gth: 0, sb: 0 }); setDeviations([]);

    const tmlSys = `You are TML's (Tata Motors Limited) Virtual Design Engineer for Project ${rfiData.project.name}. You are evaluating a ${rfiData.component} for a ${rfiData.project.vehicle}. You ONLY have access to the TML RFI document. RFI data: ${JSON.stringify(rfiData)}. Be precise, technical and professional. Output ONLY your message — no labels or preamble.`;
    const supSys = `You are the Application Engineer for ${supplierData.name}. You ONLY have access to your supplier product catalogue. You are presenting the ${variant.id} variant. Specs: ${JSON.stringify(variant.specs)}. Be honest — state actual values clearly. Be professional and concise. Output ONLY your response — no labels.`;
    const hist = [];

    // PHASE 1 — GENERAL QUERIES (Semi-scripted)
    setPhaseIdx(0);
    addCard("divider", "PHASE 1 — PROJECT GENERAL QUERIES");
    const p1 = [
      { q: "Good morning. I am the Application Engineer at " + supplierData.name + ". Before we begin the technical evaluation, could you please confirm the project name and the specific drivetrain component being sourced in this RFI?", a: `This is Project ${rfiData.project.name}. We are sourcing a complete ${rfiData.component} assembly for a ${rfiData.project.vehicle} application.` },
      { q: "Thank you. Could you share the vehicle GVW, manufacturing location, and target market for this programme?", a: `GVW is ${rfiData.project.vehicle.includes("46T") ? "46T" : "as specified"}. Manufacturing will be at ${rfiData.project.location}. Target market is ${rfiData.project.market}.` },
      { q: "What is the planned Start of Production timeline, and what are the alpha and beta build schedules and quantities?", a: `SOP is ${rfiData.project.sop}. Alpha build: ${rfiData.project.alpha_build} — ${rfiData.project.alpha_qty}. Beta build: ${rfiData.project.beta_build} — ${rfiData.project.beta_qty}.` },
      { q: "What are the annual volume projections for the first five years of production?", a: `Year 1: ${rfiData.project.volumes.y1} units. Year 2: ${rfiData.project.volumes.y2}. Year 3: ${rfiData.project.volumes.y3}. Year 4: ${rfiData.project.volumes.y4}. Year 5: ${rfiData.project.volumes.y5}.` },
      { q: "What are the warranty terms and are there any localisation compliance requirements we should be aware of?", a: `Warranty requirement is ${rfiData.project.warranty}. Localisation: ${rfiData.project.localisation}.` },
    ];
    for (const qa of p1) {
      if (!runRef.current) return;
      setAgentStatus({ tml: "idle", sup: "active" }); setTyping("sup");
      await delay(900); setTyping(null);
      "sup", qa.q; hist.push({ role: "user", content: qa.q });
      await delay(500);
      setAgentStatus({ tml: "active", sup: "idle" }); setTyping("tml");
      await delay(800); setTyping(null);
      addMsg("tml", qa.a); hist.push({ role: "assistant", content: qa.a });
      await delay(400);
    }
    setAgentStatus({ tml: "idle", sup: "idle" });

    // PHASE 2 — MUST HAVE (Semi-scripted)
    setPhaseIdx(1);
    addCard("divider", "PHASE 2 — MUST HAVE REQUIREMENT VERIFICATION");
    let mhArr = [];
    for (let i = 0; i < rfiData.must_have.length; i++) {
      if (!runRef.current) return;
      const req = rfiData.must_have[i];
      const q = `Requirement ${req.id} — ${req.parameter}: Our mandatory specification is ${req.requirement}. Please confirm whether the ${variant.id} variant complies and provide the exact offered value.`;
      setAgentStatus({ tml: "active", sup: "idle" }); setTyping("tml");
      await delay(900); setTyping(null);
      addMsg("tml", q); hist.push({ role: "user", content: q });
      await delay(500);
      const pass = variant.mh[i];
      const note = variant.mh_notes[i];
      const ans = pass
        ? `Confirmed — the ${variant.id} variant meets this requirement. ${note}`
        : `I must flag a deviation here. ${note} We would need to discuss this.`;
      setAgentStatus({ tml: "idle", sup: "active" }); setTyping("sup");
      await delay(1000); setTyping(null);
      addMsg("sup", ans); hist.push({ role: "assistant", content: ans });
      mhArr = [...mhArr, pass];
      setMhResults([...mhArr]);
      setScores(p => ({ ...p, mh: mhArr.filter(Boolean).length }));
      if (!pass) {
        await delay(400);
        addCard("veto", `${req.parameter}: ${note}`);
        setEvalStatus("eliminated"); setPhaseIdx(-1);
        setAgentStatus({ tml: "idle", sup: "idle" }); setRunning(false); return;
      }
      await delay(400);
    }
    setAgentStatus({ tml: "idle", sup: "idle" });

    // PHASE 3 — GOOD TO HAVE (Semi-scripted)
    setPhaseIdx(2);
    addCard("divider", "PHASE 3 — GOOD TO HAVE PREFERENCES");
    let gthArr = [];
    for (let i = 0; i < rfiData.good_to_have.length; i++) {
      if (!runRef.current) return;
      const req = rfiData.good_to_have[i];
      const q = `Good-to-have — ${req.parameter}: We prefer ${req.preferred}. What does the ${variant.id} variant offer on this parameter?`;
      setAgentStatus({ tml: "active", sup: "idle" }); setTyping("tml");
      await delay(900); setTyping(null);
      addMsg("tml", q); hist.push({ role: "user", content: q });
      await delay(500);
      const match = variant.gth ? variant.gth[i] : false;
      const note = variant.gth_notes ? variant.gth_notes[i] : "Data not available.";
      setAgentStatus({ tml: "idle", sup: "active" }); setTyping("sup");
      await delay(900); setTyping(null);
      addMsg("sup", note); hist.push({ role: "assistant", content: note });
      gthArr = [...gthArr, match];
      setGthResults([...gthArr]);
      setScores(p => ({ ...p, gth: gthArr.filter(Boolean).length }));
      if (!match) {
        await delay(300);
        addCard("deviation", `${req.parameter}: ${note}`);
        setDeviations(p => [...p, `${req.parameter} — ${note}`]);
      }
      await delay(400);
    }
    setAgentStatus({ tml: "idle", sup: "idle" });

    // PHASE 4 — AI NEGOTIATION
    setPhaseIdx(3);
    addCard("divider", "PHASE 4 — TECHNICAL NEGOTIATION  [AI DRIVEN]");
    const devList = variant.deviations || [];
    if (devList.length === 0) {
      setTyping("tml"); await delay(700); setTyping(null);
      addMsg("tml", "All critical requirements and most preferences are satisfied. No significant deviations require negotiation. We will proceed to engineering recommendations.");
    } else {
      for (const dev of devList.slice(0, 3)) {
        if (!runRef.current) return;
        const negQ = await callOnce(
          `You are TML's Design Engineer. A deviation: param="${dev.param}", TML requires="${dev.rfi}", Supplier offers="${dev.offered}", gap="${dev.gap}". Ask a focused negotiation question about whether this can be resolved, modification feasibility, and implications. 2 sentences max.`,
          [{ role: "user", content: "Generate negotiation question." }]
        );
        setAgentStatus({ tml: "active", sup: "idle" }); setTyping("tml");
        await delay(600); setTyping(null);
        addMsg("tml", negQ); hist.push({ role: "user", content: negQ });
        await delay(400);
        setAgentStatus({ tml: "idle", sup: "active" });
        const supA = await callStream("sup", supSys, [...hist]);
        hist.push({ role: "assistant", content: supA });
        setAgentStatus({ tml: "idle", sup: "idle" });
        if (dev.negotiable) {
          await delay(300);
          addCard("negotiated", `${dev.param}: Negotiation exchange recorded — supplier response noted`);
        }
        await delay(500);
      }
    }

    // PHASE 5 — AI ENGINEERING RECOMMENDATIONS
    setPhaseIdx(4);
    addCard("divider", "PHASE 5 — ENGINEERING RECOMMENDATIONS  [AI DRIVEN]");
    const recQ = `Based on our evaluation of the ${variant.id} variant, please provide: (1) modifications you can commit to in order to close the identified gaps, (2) estimated timeline and tooling implications for each, and (3) any critical constraints or risks TML should consider in the sourcing decision.`;
    setAgentStatus({ tml: "active", sup: "idle" }); setTyping("tml");
    await delay(700); setTyping(null);
    addMsg("tml", recQ); hist.push({ role: "user", content: recQ });
    await delay(400);
    setAgentStatus({ tml: "idle", sup: "active" });
    const recA = await callStream("sup", supSys, [...hist]);
    hist.push({ role: "assistant", content: recA });
    setAgentStatus({ tml: "idle", sup: "idle" });
    await delay(400);

    // TML closing
    const closingPrompt = `You are TML's Design Engineer. Give a brief professional closing statement for the evaluation of ${supplierData.name}'s ${variant.id} variant for project ${rfiData.project.name}. State clearly: conditionally recommended, recommended, or not recommended, and the primary reason. 2-3 sentences.`;
    setAgentStatus({ tml: "active", sup: "idle" }); setTyping("tml");
    await delay(700); setTyping(null);
    await callStream("tml", closingPrompt, [{ role: "user", content: "Provide closing evaluation statement." }]);
    setAgentStatus({ tml: "idle", sup: "idle" });

    const sbScore = Math.round(rfiData.subjective.length * 0.58);
    setScores(p => ({ ...p, sb: sbScore }));
    setPhaseIdx(5); setEvalStatus("done"); setRunning(false);
  };

  const generateReport = async () => {
    setGenReport(true); setShowReport(true);
    const variant = supplierData.variants[selectedVar];
    const prompt = `Generate RFI compliance report for Project ${rfiData.project.name} — ${rfiData.component}. Supplier: ${supplierData.name}, Variant: ${variant.id}. Must Have passed: ${scores.mh}/${rfiData.must_have.length}. Good to Have matched: ${scores.gth}/${rfiData.good_to_have.length}. Key deviations: ${variant.deviations?.map(d=>`${d.param}: ${d.gap}`).join("; ")||"None"}. Return ONLY valid JSON (no markdown): {"executive_summary":"3-4 sentences","verdict":"RECOMMENDED or CONDITIONALLY RECOMMENDED or NOT RECOMMENDED","verdict_reason":"2-3 sentences","key_strengths":["s1","s2","s3"],"critical_gaps":["g1","g2","g3"],"modifications_required":[{"item":"...","timeline":"...","feasibility":"High/Medium/Low"}],"risks":[{"risk":"...","severity":"High/Medium/Low","mitigation":"..."}],"comparison":[{"parameter":"...","requirement":"...","offered":"...","status":"PASS/DEVIATION/MISS/MATCH","note":"..."}]}. Include 10-12 comparison rows covering all requirement categories.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1800, messages: [{ role: "user", content: prompt }] }),
      });
      const d = await res.json();
      const txt = d.content?.[0]?.text || "{}";
      setReport(JSON.parse(txt.replace(/```json|```/g,"").trim()));
    } catch { setReport({ error: "Report generation failed. Retry." }); }
    setGenReport(false);
  };

  const variant = supplierData.variants[selectedVar];
  const overall = (() => {
    if (evalStatus === "idle") return 0;
    if (evalStatus === "eliminated") return Math.round((scores.mh / rfiData.must_have.length) * 40);
    return Math.round((scores.mh / rfiData.must_have.length) * 50 + (scores.gth / rfiData.good_to_have.length) * 30 + (scores.sb / rfiData.subjective.length) * 20);
  })();
  const overallColor = overall >= 75 ? "#34d399" : overall >= 50 ? "#f59e0b" : "#f87171";

  const PHASES = [
    { label: "General Queries", short: "P1" },
    { label: "Must Have", short: "P2" },
    { label: "Good to Have", short: "P3" },
    { label: "Negotiation", short: "P4" },
    { label: "Eng. Rec.", short: "P5" },
    { label: "Complete", short: "✓" },
  ];

  const radarVals = [
    scores.mh / rfiData.must_have.length,
    scores.gth / rfiData.good_to_have.length,
    scores.sb / rfiData.subjective.length,
    Math.min(1, 2223/2500),
    0.75,
    0.85,
  ];

  return (
    <div className="shell">
      <div className="tb">
        <span className="tb-logo">TML<span>/</span>RFI</span>
        <div className="tb-sep"/>
        <span className="tb-project">VIRTUAL DESIGN ENGINEER — 1:1 AGENT EVALUATION</span>
        <div className="tb-chips">
          <span className="chip c-blue">{rfiData.project.name.toUpperCase()}</span>
          <span className="chip c-blue">eAXLE SYSTEM</span>
          {evalStatus === "done" && <span className="chip c-green">COMPLETE</span>}
          {evalStatus === "running" && <span className="chip c-amber">LIVE</span>}
          {evalStatus === "eliminated" && <span className="chip c-red">VETO</span>}
        </div>
      </div>

      {/* LEFT */}
      <div className="lp">
        <div className="sec-lbl">Document Upload</div>
        <div className={`upload-zone ${rfiLoaded?"loaded":""}`}>
          <input type="file" className="upload-input" accept=".xlsx,.xls,.csv,.pdf"
            onChange={e=>{if(e.target.files[0]){setRfiFileName(e.target.files[0].name);setRfiLoaded(true);}}}/>
          {rfiLoaded
            ? <div className="upload-loaded">✓ &nbsp;{rfiFileName}</div>
            : <><div className="upload-icon">📄</div><div className="upload-title">TML RFI Document</div><div className="upload-sub">Only TML agent reads this</div></>
          }
        </div>
        <div className={`upload-zone ${supLoaded?"loaded":""}`}>
          <input type="file" className="upload-input" accept=".xlsx,.xls,.csv,.pdf"
            onChange={e=>{if(e.target.files[0]){setSupFileName(e.target.files[0].name);setSupLoaded(true);}}}/>
          {supLoaded
            ? <div className="upload-loaded">✓ &nbsp;{supFileName}</div>
            : <><div className="upload-icon">🏭</div><div className="upload-title">Supplier Catalogue</div><div className="upload-sub">Only Supplier agent reads this</div></>
          }
        </div>

        <div className="sec-lbl">Agent Status</div>
        <div className="agent-box">
          <div className="agent-av av-tml">TML</div>
          <div className="agent-info">
            <div className="agent-name">TML Design Engineer</div>
            <div className="agent-desc">ACCESS: RFI doc only. No supplier data.</div>
            <div className="agent-status">
              <div className={`a-dot ${agentStatus.tml==="active"?"dot-active":"dot-idle"}`}/>
              <span className="a-st-txt">{agentStatus.tml==="active"?"SPEAKING — GENERATING":"STANDBY"}</span>
            </div>
          </div>
        </div>
        <div className="agent-box">
          <div className="agent-av av-sup">SUP</div>
          <div className="agent-info">
            <div className="agent-name">{supplierData.name} — App. Engineer</div>
            <div className="agent-desc">ACCESS: Supplier catalogue only. No RFI data.</div>
            <div className="agent-status">
              <div className={`a-dot ${agentStatus.sup==="active"?"dot-active":"dot-idle"}`}/>
              <span className="a-st-txt">{agentStatus.sup==="active"?"SPEAKING — GENERATING":"STANDBY"}</span>
            </div>
          </div>
        </div>

        <div className="sec-lbl">Variant Selection ({supplierData.variants.length} available)</div>
        <div className="var-select">
          <div className="var-select-title">Supplier agent will present selected variant:</div>
          <div className="var-grid">
            {supplierData.variants.map((v,i)=>{
              const mhFail=v.mh.some(m=>!m);
              return (
                <div key={v.id} className={`var-btn ${selectedVar===i?"vsel":""} ${mhFail?"vfail":""}`}
                  onClick={()=>{if(!running)setSelectedVar(i);}}>
                  {v.id}
                  <span style={{display:"block",fontSize:"7px",marginTop:"2px",opacity:.7}}>{v.tag}</span>
                  {mhFail&&<span style={{display:"block",fontSize:"6px",marginTop:"1px",color:"#f87171"}}>MH gaps</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rfi-summary">
          <div className="rfi-title">Project {rfiData.project.name}</div>
          {[["Vehicle",rfiData.project.vehicle],["SOP",rfiData.project.sop],["Location",rfiData.project.location],["Market",rfiData.project.market],["Warranty",rfiData.project.warranty]].map(([k,v])=>(
            <div className="rfi-row" key={k}><span className="rk">{k}</span><span className="rv">{v}</span></div>
          ))}
        </div>

        <button className="btn-main btn-start" onClick={startEvaluation} disabled={running||!rfiLoaded||!supLoaded}>
          {running?"⏳  AGENTS RUNNING…":"▶  START EVALUATION"}
        </button>
        <button className="btn-main btn-report" onClick={generateReport} disabled={evalStatus!=="done"||running}>
          📊  GENERATE REPORT
        </button>
      </div>

      {/* CENTER */}
      <div className="cp">
        <div className="phase-ribbon">
          {PHASES.map((ph,i)=>{
            const cls = evalStatus==="eliminated"&&i===phaseIdx?"ph-elim":i<phaseIdx?"ph-done":i===phaseIdx?"ph-active":"";
            return (
              <div key={i} className={`ph-step ${cls}`}>
                <div className="ph-num">{i<phaseIdx?"✓":ph.short}</div>
                {ph.label}
              </div>
            );
          })}
        </div>

        {evalStatus!=="idle"&&(
          <div className="variant-banner">
            <span className="vb-lbl">EVALUATING:</span>
            {supplierData.name} — <strong style={{marginLeft:4}}>{variant?.id} ({variant?.tag})</strong>
            <span style={{marginLeft:"auto",color:"#1e2d45",marginRight:4}}>vs</span>
            <strong style={{color:"#5b9cf6"}}>TML RFI — Project {rfiData.project.name}</strong>
          </div>
        )}

        <div className="chat-area" ref={chatRef}>
          {conv.length===0?(
            <div className="empty-state">
              <div className="es-icon">◎</div>
              <div className="es-text">Upload documents and start evaluation</div>
            </div>
          ):conv.map(msg=>{
            if(msg.type==="divider") return(
              <div key={msg.id} className="divider">
                <div className="div-line"/><div className="div-label">{msg.text}</div><div className="div-line"/>
              </div>
            );
            if(msg.type==="deviation") return(
              <div key={msg.id} className="dev-inline">
                <span className="di-icon">⚠</span>
                <div className="di-body"><strong>DEVIATION RECORDED</strong>{msg.text}</div>
              </div>
            );
            if(msg.type==="negotiated") return(
              <div key={msg.id} className="neg-inline">
                <span style={{flexShrink:0,marginTop:1}}>🔧</span>
                <div className="ni-body"><strong>NEGOTIATION NOTE</strong>{msg.text}</div>
              </div>
            );
            if(msg.type==="veto") return(
              <div key={msg.id} className="veto-inline">
                <div className="veto-t">⛔ MUST HAVE VETO — EVALUATION STOPPED</div>
                <div className="veto-r">{msg.text}</div>
              </div>
            );
            const isTml=msg.role==="tml";
            return(
              <div key={msg.id} className={`msg ${isTml?"tml":"sup"}`}>
                <div className={`m-av ${isTml?"ta":"sa"}`}>{isTml?"TML":"SUP"}</div>
                <div className="m-body">
                  <div className="m-who">{isTml?"TML Virtual Design Engineer":`${supplierData.name} — Application Engineer`}</div>
                  <div className={`m-bub${msg.streaming?" streaming":""}`}
                    dangerouslySetInnerHTML={{__html:(msg.text||"").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>")}}/>
                </div>
              </div>
            );
          })}
          {typing&&(
            <div className={`msg ${typing==="tml"?"tml":"sup"}`}>
              <div className={`m-av ${typing==="tml"?"ta":"sa"}`}>{typing==="tml"?"TML":"SUP"}</div>
              <div className="m-body">
                <div className="m-who">{typing==="tml"?"TML Virtual Design Engineer":`${supplierData.name} — Application Engineer`}</div>
                <div className="m-bub"><div className="typing-wrap"><div className="td"/><div className="td"/><div className="td"/></div></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="rp">
        <div className="sec-lbl">Compliance Tracker</div>
        {evalStatus==="eliminated"?(
          <div className="elim-hero">
            <div className="eh-t">⛔ ELIMINATED</div>
            <div className="eh-r">Failed a Must Have requirement. Evaluation stopped at Phase 2 veto check.</div>
          </div>
        ):(
          <>
            <div className="score-hero">
              <div className="sh-num" style={{color:overallColor}}>{overall}%</div>
              <div className="sh-lbl">OVERALL COMPLIANCE</div>
            </div>
            {[
              {l:"Must Have",v:scores.mh,t:rfiData.must_have.length,c:scores.mh===rfiData.must_have.length?"#22c55e":"#ef4444"},
              {l:"Good to Have",v:scores.gth,t:rfiData.good_to_have.length,c:scores.gth>=5?"#22c55e":"#f59e0b"},
              {l:"Subjective",v:scores.sb,t:rfiData.subjective.length,c:"#5b9cf6"},
            ].map(({l,v,t,c})=>(
              <div key={l} className="bar-row">
                <span className="bar-lbl">{l}</span>
                <div className="bar-bg"><div className="bar-fill" style={{width:`${t>0?(v/t)*100:0}%`,background:c}}/></div>
                <span className="bar-val">{v}/{t}</span>
              </div>
            ))}
          </>
        )}

        <div className="sec-lbl">Must Have ({rfiData.must_have.length})</div>
        <div className="req-list">
          {rfiData.must_have.map((req,i)=>{
            const res=mhResults[i];
            return(
              <div key={req.id} className="rq">
                <div className={`rq-d ${res===true?"d-p":res===false?"d-f":"d-n"}`}/>
                <span className="rq-nm">{req.parameter}</span>
                <span className={`rq-st ${res===true?"s-p":res===false?"s-f":"s-n"}`}>{res===true?"PASS":res===false?"FAIL":"—"}</span>
              </div>
            );
          })}
        </div>

        <div className="sec-lbl">Good to Have ({rfiData.good_to_have.length})</div>
        <div className="req-list">
          {rfiData.good_to_have.map((req,i)=>{
            const res=gthResults[i];
            return(
              <div key={req.id} className="rq">
                <div className={`rq-d ${res===true?"d-p":res===false?"d-w":"d-n"}`}/>
                <span className="rq-nm">{req.parameter}</span>
                <span className={`rq-st ${res===true?"s-p":res===false?"s-w":"s-n"}`}>{res===true?"MATCH":res===false?"MISS":"—"}</span>
              </div>
            );
          })}
        </div>

        {deviations.length>0&&(
          <>
            <div className="sec-lbl">Flagged Deviations ({deviations.length})</div>
            {deviations.map((d,i)=><div key={i} className="dev-tag">⚠ {d}</div>)}
          </>
        )}
      </div>

      {/* REPORT MODAL */}
      {showReport&&(
        <div className="overlay">
          <div className="modal">
            <div className="modal-hdr">
              <div className="modal-ttl">
                RFI Compliance Report — {rfiData.project.name}
                <span className="chip c-blue" style={{fontSize:9}}>AI GENERATED</span>
                {report?.verdict&&<span className={`chip ${report.verdict==="RECOMMENDED"?"c-green":report.verdict==="CONDITIONALLY RECOMMENDED"?"c-amber":"c-red"}`} style={{fontSize:9}}>{report.verdict}</span>}
              </div>
              <div className="modal-acts">
                <button className="m-act" onClick={()=>navigator.clipboard.writeText(JSON.stringify(report,null,2))}>Copy JSON</button>
                <button className="m-act m-close" onClick={()=>setShowReport(false)}>Close</button>
              </div>
            </div>
            <div className="modal-body">
              {genReport?(
                <div className="gen-loader">
                  <div className="typing-wrap"><div className="td"/><div className="td"/><div className="td"/></div>
                  Generating compliance analysis via Claude API…
                </div>
              ):report?.error?(
                <div style={{color:"#f87171",padding:20}}>{report.error}</div>
              ):report?(
                <>
                  <div className="r-sec">
                    <div className="r-sec-t">Executive Summary</div>
                    <p className="r-txt">{report.executive_summary}</p>
                  </div>

                  <div className="r-sec">
                    <div className="r-sec-t">Visual Analysis</div>
                    <div className="chart-grid">
                      <div className="chart-card">
                        <div className="chart-lbl">COMPLIANCE RADAR — {variant?.id}</div>
                        <RadarChart vals={radarVals} label={`${supplierData.name} ${variant?.id}`}/>
                      </div>
                      <div className="chart-card">
                        <div className="chart-lbl">SCORE BREAKDOWN</div>
                        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
                          {[
                            {n:"Must Have",v:rfiData.must_have.length>0?(scores.mh/rfiData.must_have.length)*100:0,c:"#22c55e"},
                            {n:"Good to Have",v:rfiData.good_to_have.length>0?(scores.gth/rfiData.good_to_have.length)*100:0,c:"#f59e0b"},
                            {n:"Subjective",v:rfiData.subjective.length>0?(scores.sb/rfiData.subjective.length)*100:0,c:"#5b9cf6"},
                            {n:"Overall",v:overall,c:overallColor},
                          ].map(({n,v,c})=>(
                            <div key={n} className="bcr-row">
                              <span className="bcr-name">{n}</span>
                              <div className="bcr-bg">
                                <div className="bcr-fill" style={{width:`${Math.round(v)}%`,background:c}}>
                                  <span className="bcr-pct">{Math.round(v)}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="chart-lbl" style={{marginTop:16}}>TRAFFIC LIGHT MATRIX</div>
                        {[
                          ["Driveline",variant?.mh[0]?"PASS":"FAIL"],
                          ["Voltage Range",variant?.mh[1]?"PASS":"DEVIATION"],
                          ["Cooling",variant?.mh[2]?"PASS":"FAIL"],
                          ["Motor Tech",variant?.mh[3]?"PASS":"FAIL"],
                          ["IP Rating",variant?.gth?.[0]?"MATCH":"MISS"],
                          ["Safety (ASIL)",variant?.gth?.[5]?"MATCH":"MISS"],
                          ["EMI/EMC",variant?.gth?.[6]?"MATCH":"MISS"],
                          ["B10 Life","DEVIATION"],
                          ["Weight","DEVIATION"],
                        ].map(([req,st])=>(
                          <div key={req} className="tl-row">
                            <div className="tl-lbl">{req}</div>
                            <div className={`tl-cell ${st==="PASS"||st==="MATCH"?"tl-g":st==="DEVIATION"?"tl-a":"tl-r"}`}>{st}</div>
                            <div/>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="r-sec">
                    <div className="r-sec-t">Requirement Compliance Matrix</div>
                    <table className="r-tbl">
                      <thead><tr><th style={{width:"20%"}}>Parameter</th><th>TML Requirement</th><th>Offered</th><th>Status</th><th>Note</th></tr></thead>
                      <tbody>
                        {report.comparison?.map((row,i)=>(
                          <tr key={i}>
                            <td style={{color:"#2d3f5a",fontFamily:"JetBrains Mono",fontSize:9}}>{row.parameter}</td>
                            <td>{row.requirement}</td>
                            <td>{row.offered}</td>
                            <td className={row.status==="PASS"||row.status==="MATCH"?"c-g":row.status==="DEVIATION"?"c-a":"c-r"}>{row.status}</td>
                            <td style={{fontSize:10,color:"#475569"}}>{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="r-sec">
                    <div className="r-sec-t">Strengths & Critical Gaps</div>
                    <div className="str-gap-grid">
                      <div>
                        <div className="sg-title" style={{color:"#34d399"}}>KEY STRENGTHS</div>
                        {report.key_strengths?.map((s,i)=><div key={i} className="mod-item" style={{borderColor:"#0d3a1e"}}>✓ &nbsp;{s}</div>)}
                      </div>
                      <div>
                        <div className="sg-title" style={{color:"#f87171"}}>CRITICAL GAPS</div>
                        {report.critical_gaps?.map((g,i)=><div key={i} className="mod-item" style={{borderColor:"#2d1010",background:"#100808"}}>✗ &nbsp;{g}</div>)}
                      </div>
                    </div>
                  </div>

                  {report.modifications_required?.length>0&&(
                    <div className="r-sec">
                      <div className="r-sec-t">Modifications Required</div>
                      {report.modifications_required.map((m,i)=>(
                        <div key={i} className="mod-item">
                          <span>🔧</span>
                          <div>
                            <div style={{fontWeight:500,color:"#c8d3e4",marginBottom:2}}>{m.item}</div>
                            <div style={{fontSize:10,color:"#475569"}}>Timeline: {m.timeline} · Feasibility: <span style={{color:m.feasibility==="High"?"#34d399":m.feasibility==="Medium"?"#f59e0b":"#f87171"}}>{m.feasibility}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {report.risks?.length>0&&(
                    <div className="r-sec">
                      <div className="r-sec-t">Risk Assessment</div>
                      {report.risks.map((r,i)=>(
                        <div key={i} className="mod-item">
                          <span>⚠</span>
                          <div>
                            <div style={{fontWeight:500,color:"#c8d3e4",marginBottom:2}}>
                              {r.risk} &nbsp;
                              <span style={{fontFamily:"JetBrains Mono",fontSize:9,padding:"1px 5px",borderRadius:3,background:r.severity==="High"?"#1a0808":"#161000",color:r.severity==="High"?"#f87171":"#f59e0b"}}>{r.severity}</span>
                            </div>
                            <div style={{fontSize:10,color:"#475569"}}>{r.mitigation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="r-sec">
                    <div className="r-sec-t">Final Recommendation</div>
                    <div className="rec-hero">
                      <div className="rec-name">
                        <span style={{fontSize:18}}>{report.verdict==="RECOMMENDED"?"✓":report.verdict==="CONDITIONALLY RECOMMENDED"?"⚡":"✗"}</span>
                        {report.verdict} — {supplierData.name} / {variant?.id}
                      </div>
                      <div className="rec-reason">{report.verdict_reason}</div>
                    </div>
                  </div>
                </>
              ):null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
