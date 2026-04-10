"use client";

import { useState } from "react";
import QiTorusField from "../components/QiTorusField";
import type { Register } from "../page";

const PI = Math.PI;

export default function TorusPage() {
  const [register, setRegister] = useState<Register>("breathing");
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [rotZ, setRotZ] = useState(0);
  const [scale, setScale] = useState(0.8);

  const labelStyle: React.CSSProperties = {
    fontFamily: "ui-monospace, Menlo, monospace",
    fontSize: "11px",
    color: "#F5F2E8",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "2px",
  };

  const toDeg = (r: number) => Math.round(r * 180 / PI) + "°";

  return (
    <div className="relative min-h-screen">
      <QiTorusField
        register={register}
        devRotX={rotX}
        devRotY={rotY}
        devRotZ={rotZ}
        ringScale={scale}
      />

      {/* Dev panel */}
      <div
        className="fixed top-4 right-4 z-50 p-4 rounded-xl"
        style={{
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(12px)",
          width: "260px",
          fontFamily: "ui-monospace, Menlo, monospace",
        }}
      >
        <div style={{ color: "#7cf", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", marginBottom: "12px" }}>
          TORUS DEV TOOLS
        </div>

        <div style={{ marginBottom: "10px" }}>
          <div style={labelStyle}><span>rotate X (tilt)</span><span>{toDeg(rotX)}</span></div>
          <input type="range" min={-PI} max={PI} step="0.01" value={rotX} onChange={e => setRotX(+e.target.value)} style={{ width: "100%", accentColor: "#7cf" }} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <div style={labelStyle}><span>rotate Y (turn)</span><span>{toDeg(rotY)}</span></div>
          <input type="range" min={-PI} max={PI} step="0.01" value={rotY} onChange={e => setRotY(+e.target.value)} style={{ width: "100%", accentColor: "#7cf" }} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <div style={labelStyle}><span>rotate Z (roll)</span><span>{toDeg(rotZ)}</span></div>
          <input type="range" min={-PI} max={PI} step="0.01" value={rotZ} onChange={e => setRotZ(+e.target.value)} style={{ width: "100%", accentColor: "#7cf" }} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <div style={labelStyle}><span>scale</span><span>{scale.toFixed(2)}</span></div>
          <input type="range" min="0.2" max="2.0" step="0.01" value={scale} onChange={e => setScale(+e.target.value)} style={{ width: "100%", accentColor: "#7cf" }} />
        </div>

        <button
          onClick={() => { setRotX(0); setRotY(0); setRotZ(0); setScale(0.8); }}
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)",
            color: "#888",
            fontSize: "10px",
            fontFamily: "ui-monospace, Menlo, monospace",
            cursor: "pointer",
            marginTop: "4px",
            marginBottom: "14px",
          }}
        >
          reset
        </button>

        <div style={{ color: "#7cf", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", marginBottom: "8px" }}>
          REGISTER
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {(["breathing", "listening", "thinking", "talking", "settling"] as Register[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegister(r)}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "10px",
                fontFamily: "ui-monospace, Menlo, monospace",
                fontWeight: 600,
                background: register === r ? "#7cf" : "rgba(255,255,255,0.1)",
                color: register === r ? "#000" : "#888",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
