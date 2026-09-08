import React from "react";
import { AlertTriangle } from "lucide-react";
import { TYPE_ICONS, relTime } from "../utils/api";
import StatusBadge from "../components/StatusBadge";

export default function FlaggedPage({ assets, onSelect }) {
  const flagged = assets.filter(a => a.flagged);

  return (
    <div style={{ padding:"28px 32px", overflowY:"auto", height:"100%", display:"flex", flexDirection:"column", gap:16 }}>
      <div>
        <h2 style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Flagged Assets</h2>
        <p style={{ fontSize:13, color:"var(--text-2)" }}>
          Assets marked as needing attention — faults, damage, or issues reported.
        </p>
      </div>

      {flagged.length === 0 ? (
        <div className="card" style={{
          padding:"60px 32px", textAlign:"center",
          display:"flex", flexDirection:"column", alignItems:"center", gap:12,
        }}>
          <div style={{
            width:56, height:56, borderRadius:"50%",
            background:"var(--av-dim)", border:"1px solid var(--available)33",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <AlertTriangle size={24} color="var(--available)" />
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>All clear</div>
            <div style={{ fontSize:13, color:"var(--text-2)" }}>No assets are currently flagged.</div>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {flagged.map(a => (
            <div key={a._id} className="card" onClick={() => onSelect(a)}
              style={{
                padding:"16px 20px", cursor:"pointer",
                borderColor:"var(--faulty)44",
                display:"flex", alignItems:"center", gap:16,
                transition:"border-color .15s, background .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="var(--faulty)"; e.currentTarget.style.background="rgba(244,63,94,.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--faulty)44"; e.currentTarget.style.background="var(--bg-card)"; }}
            >
              {/* Icon */}
              <div style={{
                width:44, height:44, borderRadius:"var(--r)",
                background:"var(--faulty-dim)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:20, flexShrink:0,
              }}>
                {TYPE_ICONS[a.type]}
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontFamily:"var(--mono)", fontWeight:600, fontSize:14 }}>{a.label}</span>
                  <StatusBadge status={a.status} />
                </div>
                <div style={{
                  fontSize:13, color:"var(--faulty)",
                  background:"var(--faulty-dim)", border:"1px solid var(--faulty)33",
                  borderRadius:"var(--r)", padding:"6px 10px",
                  display:"inline-block",
                }}>
                  ⚑ {a.flagReason || "Issue flagged"}
                </div>
              </div>

              {/* Meta */}
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:12, color:"var(--text-2)", marginBottom:4 }}>{a.location}</div>
                <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)" }}>
                  {a.type} · {a.condition}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
