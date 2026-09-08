import React, { useEffect, useState } from "react";
import { Monitor, AlertTriangle, Wrench, ArrowLeftRight, CheckCircle2, RefreshCw } from "lucide-react";
import { api, TYPE_ICONS } from "../utils/api";
import StatusBadge from "../components/StatusBadge";

function StatCard({ icon: Icon, label, value, color, dim }) {
  return (
    <div className="card" style={{ padding:"20px 22px", display:"flex", alignItems:"center", gap:16 }}>
      <div style={{
        width:44, height:44, borderRadius:"var(--r)",
        background: dim, border:`1px solid ${color}33`,
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize:26, fontWeight:700, fontFamily:"var(--mono)", color }}>{value}</div>
        <div style={{ fontSize:12, color:"var(--text-2)" }}>{label}</div>
      </div>
    </div>
  );
}

function LabMap({ assets, onSelect }) {
  const byLocation = assets.reduce((acc, a) => {
    if (!acc[a.location]) acc[a.location] = [];
    acc[a.location].push(a);
    return acc;
  }, {});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {Object.entries(byLocation).map(([loc, items]) => (
        <div key={loc}>
          <div style={{ fontSize:12, color:"var(--text-2)", fontFamily:"var(--mono)", marginBottom:10, letterSpacing:"0.05em" }}>
            📍 {loc} — {items.length} assets
          </div>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(100px, 1fr))",
            gap:8,
          }}>
            {items.map((a) => {
              const colors = {
                available: "var(--available)", "in-use":"var(--inuse)",
                faulty:"var(--faulty)", "under-repair":"var(--repair)",
                "checked-out":"var(--checkout)", retired:"var(--text-3)",
              };
              const c = colors[a.status] || "var(--text-3)";
              return (
                <button key={a._id} onClick={() => onSelect(a)} style={{
                  background:"var(--bg-raised)", border:`1.5px solid ${a.flagged ? "var(--faulty)" : c + "55"}`,
                  borderRadius:"var(--r)", padding:"10px 8px",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                  cursor:"pointer", transition:"border-color .15s, transform .1s",
                  position:"relative",
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=c; e.currentTarget.style.transform="scale(1.03)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=a.flagged?"var(--faulty)":c+"55"; e.currentTarget.style.transform="scale(1)";}}
                >
                  {a.flagged && (
                    <span style={{
                      position:"absolute", top:-5, right:-5,
                      width:14, height:14, borderRadius:"50%",
                      background:"var(--faulty)", border:"2px solid var(--bg-raised)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:8,
                    }}>!</span>
                  )}
                  <span style={{ fontSize:18 }}>{TYPE_ICONS[a.type]}</span>
                  <span style={{
                    fontFamily:"var(--mono)", fontSize:9, fontWeight:500,
                    color: c, textAlign:"center",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    width:"100%",
                  }}>
                    {a.label}
                  </span>
                  <div style={{
                    width:"100%", height:3, borderRadius:2,
                    background: c, opacity: a.status === "retired" ? 0.2 : 0.7,
                  }} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage({ onSelectAsset, liveAssets }) {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.stats().then(j => setStats(j)); }, [liveAssets]);

  const byStatus = stats?.byStatus?.reduce((a, b) => ({ ...a, [b._id]: b.count }), {}) || {};

  return (
    <div style={{ padding:"28px 32px", overflowY:"auto", height:"100%", display:"flex", flexDirection:"column", gap:24 }}>
      {/* Stat strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:12 }}>
        <StatCard icon={CheckCircle2} label="Available"    value={byStatus["available"]     || 0} color="var(--available)" dim="var(--av-dim)" />
        <StatCard icon={Monitor}      label="In Use"        value={byStatus["in-use"]        || 0} color="var(--inuse)"     dim="var(--inuse-dim)" />
        <StatCard icon={AlertTriangle}label="Faulty"        value={byStatus["faulty"]        || 0} color="var(--faulty)"   dim="var(--faulty-dim)" />
        <StatCard icon={Wrench}       label="Under Repair"  value={byStatus["under-repair"]  || 0} color="var(--repair)"   dim="var(--repair-dim)" />
        <StatCard icon={ArrowLeftRight}label="Checked Out"  value={byStatus["checked-out"]   || 0} color="var(--checkout)" dim="var(--checkout-dim)" />
      </div>

      {/* Lab map */}
      <div className="card" style={{ padding:"22px 24px", flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:600 }}>Lab Floor Map</h2>
            <p style={{ fontSize:12, color:"var(--text-2)", marginTop:2 }}>Click any asset to view details or update status</p>
          </div>
          {/* Legend */}
          <div style={{ display:"flex", gap:14 }}>
            {[["available","Available"],["in-use","In Use"],["faulty","Faulty"],["under-repair","Repair"],["checked-out","Out"]].map(([s,l])=>(
              <div key={s} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:`var(--${s==="in-use"?"inuse":s==="under-repair"?"repair":s==="checked-out"?"checkout":s})` }} />
                <span style={{ fontSize:11, color:"var(--text-2)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <LabMap assets={liveAssets} onSelect={onSelectAsset} />
      </div>
    </div>
  );
}
