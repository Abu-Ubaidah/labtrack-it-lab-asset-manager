import React, { useState } from "react";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { TYPE_ICONS } from "../utils/api";
import StatusBadge from "../components/StatusBadge";

const STATUSES = ["", "available","in-use","faulty","under-repair","checked-out","retired"];
const TYPES    = ["", "pc","printer","projector","switch","peripheral","other"];

export default function AssetsPage({ assets, onSelect, onAdd, isTech }) {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [type,   setType]     = useState("");

  const sel = {
    background:"var(--bg-raised)", border:"1px solid var(--border)",
    borderRadius:"var(--r)", color:"var(--text)", padding:"7px 10px",
    fontSize:13, outline:"none", cursor:"pointer",
  };

  const filtered = assets.filter(a => {
    if (status && a.status !== status) return false;
    if (type   && a.type   !== type)   return false;
    if (search) {
      const q = search.toLowerCase();
      return a.label.toLowerCase().includes(q)
          || a.location.toLowerCase().includes(q)
          || (a.serialNo||"").toLowerCase().includes(q)
          || (a.specs||"").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ padding:"28px 32px", display:"flex", flexDirection:"column", gap:16, height:"100%", overflowY:"auto" }}>
      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }} />
          <input className="inp" style={{ paddingLeft:32 }} placeholder="Search assets…"
            value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select style={sel} value={status} onChange={e=>setStatus(e.target.value)}>
          {STATUSES.map(s=><option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
        <select style={sel} value={type} onChange={e=>setType(e.target.value)}>
          {TYPES.map(t=><option key={t} value={t}>{t ? `${TYPE_ICONS[t]} ${t}` : "All types"}</option>)}
        </select>
        {isTech && (
          <button className="btn btn-primary" onClick={onAdd} style={{ display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
            <Plus size={14} /> Add Asset
          </button>
        )}
      </div>

      <div style={{ fontSize:12, color:"var(--text-2)", fontFamily:"var(--mono)" }}>
        {filtered.length} / {assets.length} assets
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:"hidden", flex:1 }}>
        <div style={{ overflowY:"auto", height:"100%" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid var(--border)" }}>
                {["Asset","Type","Location","Serial No","Specs","Status","Condition"].map(h=>(
                  <th key={h} style={{
                    padding:"11px 16px", textAlign:"left",
                    fontSize:11, color:"var(--text-2)", fontFamily:"var(--mono)",
                    letterSpacing:"0.05em", fontWeight:500,
                    background:"var(--bg-panel)", whiteSpace:"nowrap",
                    position:"sticky", top:0,
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a._id}
                  onClick={() => onSelect(a)}
                  style={{
                    borderBottom:"1px solid var(--border-lo)",
                    cursor:"pointer",
                    background: a.flagged ? "rgba(244,63,94,.04)" : i%2===0 ? "transparent" : "rgba(255,255,255,.01)",
                    transition:"background .1s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"}
                  onMouseLeave={e=>e.currentTarget.style.background=a.flagged?"rgba(244,63,94,.04)":i%2===0?"transparent":"rgba(255,255,255,.01)"}
                >
                  <td style={{ padding:"11px 16px", whiteSpace:"nowrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {a.flagged && <span title={a.flagReason} style={{ color:"var(--faulty)", fontSize:12 }}>⚑</span>}
                      <span style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:500 }}>{a.label}</span>
                    </div>
                  </td>
                  <td style={{ padding:"11px 16px" }}>
                    <span style={{ fontSize:13 }}>{TYPE_ICONS[a.type]} {a.type}</span>
                  </td>
                  <td style={{ padding:"11px 16px", color:"var(--text-2)", fontSize:13 }}>{a.location}</td>
                  <td style={{ padding:"11px 16px", fontFamily:"var(--mono)", fontSize:12, color:"var(--text-3)" }}>{a.serialNo || "—"}</td>
                  <td style={{ padding:"11px 16px", color:"var(--text-2)", fontSize:12, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.specs || "—"}</td>
                  <td style={{ padding:"11px 16px" }}><StatusBadge status={a.status} /></td>
                  <td style={{ padding:"11px 16px" }}>
                    <span style={{
                      fontSize:11, fontFamily:"var(--mono)",
                      color: a.condition==="good"?"var(--available)":a.condition==="fair"?"var(--repair)":"var(--faulty)",
                    }}>
                      {a.condition}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding:"40px", textAlign:"center", color:"var(--text-3)", fontFamily:"var(--mono)" }}>
                  No assets match your filters
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
