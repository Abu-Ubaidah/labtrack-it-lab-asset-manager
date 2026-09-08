import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { api, TYPE_ICONS, relTime } from "../utils/api";

const ACTION_COLOR = {
  created:          "var(--available)",
  status_changed:   "var(--inuse)",
  checked_out:      "var(--checkout)",
  checked_in:       "var(--available)",
  flagged:          "var(--faulty)",
  unflagged:        "var(--available)",
  repaired:         "var(--repair)",
  specs_updated:    "var(--text-2)",
  note_added:       "var(--text-2)",
  condition_changed:"var(--repair)",
};

const ACTION_LABEL = {
  created:          "Added",
  status_changed:   "Status →",
  checked_out:      "Checked out to",
  checked_in:       "Checked in",
  flagged:          "Flagged",
  unflagged:        "Unflagged",
  repaired:         "Repaired",
  specs_updated:    "Updated",
  note_added:       "Note added",
  condition_changed:"Condition →",
};

export default function ActivityPage({ onSelectAsset, liveAssets }) {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.recentLogs(50)
      .then(j => setLogs(j.logs))
      .finally(() => setLoading(false));
  }, []);

  // reload when assets change (real-time update came in)
  useEffect(() => { load(); }, [load, liveAssets]);

  function getAsset(log) {
    return liveAssets.find(a => a._id === (log.asset?._id || log.asset)) || log.asset;
  }

  return (
    <div style={{ padding:"28px 32px", overflowY:"auto", height:"100%", display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h2 style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Activity Log</h2>
          <p style={{ fontSize:13, color:"var(--text-2)" }}>
            Every status change, repair, checkout, and update — across all assets.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load}
          style={{ display:"flex", alignItems:"center", gap:6 }}>
          <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        {loading && logs.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"var(--text-3)", fontFamily:"var(--mono)", fontSize:12 }}>
            loading activity…
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"var(--text-3)", fontFamily:"var(--mono)", fontSize:12 }}>
            No activity recorded yet.
          </div>
        ) : (
          <div style={{ position:"relative" }}>
            {/* Timeline line */}
            <div style={{
              position:"absolute", left:55, top:0, bottom:0,
              width:1, background:"var(--border-lo)",
            }} />

            {logs.map((log, i) => {
              const asset    = getAsset(log);
              const color    = ACTION_COLOR[log.action] || "var(--text-2)";
              const label    = ACTION_LABEL[log.action] || log.action;

              return (
                <div key={log._id} style={{
                  display:"flex", gap:0,
                  padding:"14px 20px",
                  borderBottom: i < logs.length - 1 ? "1px solid var(--border-lo)" : "none",
                  cursor: asset ? "pointer" : "default",
                  transition:"background .1s",
                }}
                onClick={() => { if(asset?._id) { const a = liveAssets.find(x=>x._id===asset._id); if(a) onSelectAsset(a); }}}
                onMouseEnter={e => { if(asset) e.currentTarget.style.background="var(--bg-hover)"; }}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  {/* Dot + icon column */}
                  <div style={{ width:70, flexShrink:0, display:"flex", alignItems:"flex-start", paddingTop:2, gap:0 }}>
                    <div style={{
                      width:10, height:10, borderRadius:"50%",
                      background: color, marginTop:4, marginRight:10, flexShrink:0,
                      boxShadow:`0 0 6px ${color}66`,
                    }} />
                    <span style={{ fontSize:18 }}>{asset?.type ? TYPE_ICONS[asset.type] : "📦"}</span>
                  </div>

                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                      <span style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:600, color }}>
                        {label}
                      </span>
                      {log.to && (
                        <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--text)" }}>
                          {log.to}
                        </span>
                      )}
                      {asset && (
                        <span style={{ fontSize:12, color:"var(--text-2)" }}>
                          on <strong style={{color:"var(--text)"}}>{asset.label || asset}</strong>
                          {asset.location && ` (${asset.location})`}
                        </span>
                      )}
                    </div>
                    {log.note && (
                      <div style={{ fontSize:12, color:"var(--text-2)", marginTop:2 }}>{log.note}</div>
                    )}
                    <div style={{ display:"flex", gap:12, marginTop:4 }}>
                      {log.performedBy && (
                        <span style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)" }}>
                          {log.performedBy.name} · {log.performedBy.role}
                        </span>
                      )}
                      <span style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)" }}>
                        {relTime(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
