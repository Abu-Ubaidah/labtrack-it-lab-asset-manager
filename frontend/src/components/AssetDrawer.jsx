import React, { useState, useEffect } from "react";
import { X, Flag, Wrench, ArrowLeftRight, CheckCircle2, Trash2, Edit2 } from "lucide-react";
import { api, TYPE_ICONS, relTime, fmtDate, STATUS_COLORS } from "../utils/api";
import StatusBadge from "./StatusBadge";
import { useAuth } from "../context/AuthContext";

const LOG_LABELS = {
  created:"Created", status_changed:"Status changed", condition_changed:"Condition changed",
  checked_out:"Checked out", checked_in:"Checked in", flagged:"Flagged", unflagged:"Unflagged",
  repaired:"Repaired", note_added:"Note added", specs_updated:"Updated",
};

function Field({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize:10, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:3, letterSpacing:"0.06em" }}>{label}</div>
      <div style={{ fontSize:13, fontFamily: mono ? "var(--mono)" : "var(--sans)", color:"var(--text)" }}>{value || "—"}</div>
    </div>
  );
}

export default function AssetDrawer({ asset: initial, onClose, onUpdated }) {
  const { user } = useAuth();
  const isTech = user?.role === "technician";

  const [asset,  setAsset]  = useState(initial);
  const [logs,   setLogs]   = useState([]);
  const [tab,    setTab]    = useState("info"); // info | history
  const [action, setAction] = useState(null);  // "status" | "flag" | "checkout" | "edit"

  // action form state
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  useEffect(() => {
    setAsset(initial); setTab("info"); setAction(null); setErr("");
    api.assetLogs(initial._id).then(j => setLogs(j.logs)).catch(()=>{});
  }, [initial._id]);

  async function doAction() {
    setBusy(true); setErr("");
    try {
      let res;
      if (action === "status")   res = await api.setStatus(asset._id, form);
      if (action === "flag")     res = await api.flag(asset._id, form);
      if (action === "unflag")   res = await api.flag(asset._id, { flagged: false });
      if (action === "checkout") res = await api.checkout(asset._id, form);
      if (action === "checkin")  res = await api.checkin(asset._id, form);
      if (action === "edit")     res = await api.updateAsset(asset._id, form);
      if (action === "retire")   res = await api.retire(asset._id);
      setAsset(res.asset);
      onUpdated(res.asset);
      setAction(null);
      const j = await api.assetLogs(asset._id);
      setLogs(j.logs);
    } catch(e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  const s = asset;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:50,
      background:"rgba(10,10,15,.75)",
      display:"flex", justifyContent:"flex-end",
    }} onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{
        width:480, height:"100vh", background:"var(--bg-panel)",
        borderLeft:"1px solid var(--border)",
        display:"flex", flexDirection:"column", overflowY:"auto",
        animation:"slideIn .2s ease",
      }}>
        {/* Header */}
        <div style={{
          padding:"20px 24px", borderBottom:"1px solid var(--border)",
          display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          flexShrink:0,
        }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontSize:22 }}>{TYPE_ICONS[s.type]}</span>
              <span style={{ fontFamily:"var(--mono)", fontSize:18, fontWeight:600 }}>{s.label}</span>
              {s.flagged && <span style={{
                background:"var(--faulty-dim)", color:"var(--faulty)",
                border:"1px solid var(--faulty)", borderRadius:4, fontSize:10, padding:"2px 7px", fontFamily:"var(--mono)",
              }}>FLAGGED</span>}
            </div>
            <StatusBadge status={s.status} />
          </div>
          <button onClick={onClose} style={{ color:"var(--text-3)", padding:4 }}
            onMouseEnter={e=>e.currentTarget.style.color="var(--text)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--text-3)"}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
          {["info","history"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"11px 20px", fontSize:13, fontWeight: tab===t ? 600 : 400,
              color: tab===t ? "var(--accent)" : "var(--text-2)",
              borderBottom: tab===t ? "2px solid var(--accent)" : "2px solid transparent",
              transition:"color .1s",
            }}>
              {t === "info" ? "Details" : "History"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, padding:"20px 24px", overflowY:"auto" }}>

          {tab === "info" && (
            <>
              {/* Info grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
                <Field label="TYPE"       value={`${TYPE_ICONS[s.type]} ${s.type}`} />
                <Field label="LOCATION"   value={s.location} />
                <Field label="SERIAL NO"  value={s.serialNo} mono />
                <Field label="CONDITION"  value={s.condition} />
                <Field label="SPECS" value={s.specs} />
                <Field label="NOTES" value={s.notes} />
              </div>

              {/* Checkout info */}
              {s.status === "checked-out" && (
                <div style={{
                  padding:"14px 16px", marginBottom:16,
                  background:"var(--checkout-dim)", border:"1px solid var(--checkout)33",
                  borderRadius:"var(--r)",
                }}>
                  <div style={{ fontSize:11, color:"var(--checkout)", fontFamily:"var(--mono)", marginBottom:8 }}>CHECKED OUT</div>
                  <div style={{ fontSize:13 }}>To: <strong>{s.checkedOutTo}</strong></div>
                  {s.checkoutNote && <div style={{ fontSize:13, color:"var(--text-2)", marginTop:4 }}>{s.checkoutNote}</div>}
                  <div style={{ fontSize:11, color:"var(--text-2)", marginTop:6, fontFamily:"var(--mono)" }}>
                    Since {fmtDate(s.checkedOutAt)}
                    {s.expectedReturn && ` · Return by ${fmtDate(s.expectedReturn)}`}
                  </div>
                </div>
              )}

              {/* Flag reason */}
              {s.flagged && s.flagReason && (
                <div style={{
                  padding:"12px 14px", marginBottom:16,
                  background:"var(--faulty-dim)", border:"1px solid var(--faulty)44",
                  borderRadius:"var(--r)", fontSize:13, color:"var(--faulty)",
                }}>
                  ⚑ {s.flagReason}
                </div>
              )}

              {/* Tech actions */}
              {isTech && !action && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>
                  <button className="btn btn-ghost" style={{ display:"flex", alignItems:"center", gap:6 }}
                    onClick={()=>{ setForm({ status: s.status, note:"" }); setAction("status"); }}>
                    <Wrench size={13} /> Change Status
                  </button>
                  {!s.flagged
                    ? <button className="btn btn-ghost" style={{ display:"flex", alignItems:"center", gap:6, color:"var(--faulty)" }}
                        onClick={()=>{ setForm({ flagged:true, flagReason:"" }); setAction("flag"); }}>
                        <Flag size={13} /> Flag Issue
                      </button>
                    : <button className="btn btn-ghost" style={{ display:"flex", alignItems:"center", gap:6 }}
                        onClick={()=>{ setForm({ flagged:false }); setAction("unflag"); doAction(); }}>
                        <Flag size={13} /> Unflag
                      </button>
                  }
                  {s.status !== "checked-out"
                    ? <button className="btn btn-ghost" style={{ display:"flex", alignItems:"center", gap:6 }}
                        onClick={()=>{ setForm({ checkedOutTo:"", checkoutNote:"", expectedReturn:"" }); setAction("checkout"); }}>
                        <ArrowLeftRight size={13} /> Check Out
                      </button>
                    : <button className="btn btn-ghost" style={{ display:"flex", alignItems:"center", gap:6 }}
                        onClick={()=>{ setForm({ note:"" }); setAction("checkin"); }}>
                        <CheckCircle2 size={13} /> Check In
                      </button>
                  }
                  <button className="btn btn-ghost" style={{ display:"flex", alignItems:"center", gap:6 }}
                    onClick={()=>{ setForm({ label:s.label, location:s.location, serialNo:s.serialNo, specs:s.specs, notes:s.notes, condition:s.condition }); setAction("edit"); }}>
                    <Edit2 size={13} /> Edit
                  </button>
                  {s.status !== "retired" && (
                    <button className="btn btn-ghost" style={{ display:"flex", alignItems:"center", gap:6, color:"var(--danger)" }}
                      onClick={()=>{ setAction("retire"); }}>
                      <Trash2 size={13} /> Retire
                    </button>
                  )}
                </div>
              )}

              {/* Action forms */}
              {action && action !== "unflag" && (
                <div style={{
                  marginTop:16, padding:"16px", background:"var(--bg-raised)",
                  border:"1px solid var(--border)", borderRadius:"var(--r)",
                }}>
                  <div style={{ fontSize:12, fontFamily:"var(--mono)", color:"var(--accent)", marginBottom:12 }}>
                    {action === "status"   ? "CHANGE STATUS"
                   : action === "flag"     ? "FLAG ISSUE"
                   : action === "checkout" ? "CHECK OUT ASSET"
                   : action === "checkin"  ? "CHECK IN ASSET"
                   : action === "edit"     ? "EDIT ASSET"
                   : action === "retire"   ? "RETIRE ASSET" : ""}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {action === "status" && (
                      <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                        {["available","in-use","faulty","under-repair","retired"].map(s=>(
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                    {action === "flag" && (
                      <input className="inp" placeholder="Describe the issue…" value={form.flagReason}
                        onChange={e=>setForm(f=>({...f,flagReason:e.target.value}))} autoFocus />
                    )}
                    {action === "checkout" && (<>
                      <input className="inp" placeholder="Borrower name *" value={form.checkedOutTo}
                        onChange={e=>setForm(f=>({...f,checkedOutTo:e.target.value}))} autoFocus required />
                      <input className="inp" placeholder="Note (optional)" value={form.checkoutNote}
                        onChange={e=>setForm(f=>({...f,checkoutNote:e.target.value}))} />
                      <input className="inp" type="datetime-local" value={form.expectedReturn}
                        onChange={e=>setForm(f=>({...f,expectedReturn:e.target.value}))}
                        title="Expected return date/time" />
                    </>)}
                    {action === "checkin" && (
                      <input className="inp" placeholder="Return note (optional)" value={form.note}
                        onChange={e=>setForm(f=>({...f,note:e.target.value}))} autoFocus />
                    )}
                    {action === "edit" && (<>
                      <input className="inp" placeholder="Label" value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} />
                      <input className="inp" placeholder="Location" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} />
                      <input className="inp" placeholder="Serial No" value={form.serialNo} onChange={e=>setForm(f=>({...f,serialNo:e.target.value}))} />
                      <input className="inp" placeholder="Specs" value={form.specs} onChange={e=>setForm(f=>({...f,specs:e.target.value}))} />
                      <textarea className="inp" placeholder="Notes" rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{resize:"vertical"}} />
                      <select className="inp" value={form.condition} onChange={e=>setForm(f=>({...f,condition:e.target.value}))}>
                        {["good","fair","poor"].map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </>)}
                    {action === "retire" && (
                      <p style={{ fontSize:13, color:"var(--text-2)" }}>
                        This will mark the asset as <strong style={{color:"var(--text-3)"}}>retired</strong>. It will remain in the records for history purposes.
                      </p>
                    )}
                    {action !== "status" && (
                      <div style={{ fontSize:12, color:"var(--text-2)" }}>
                        {action === "status" && ""} {/* covered above */}
                        {["checkin","flag","checkout","edit"].includes(action)
                          ? null
                          : action === "retire" && <></>}
                      </div>
                    )}
                    {err && <div style={{ color:"var(--danger)", fontSize:12 }}>{err}</div>}
                    <div style={{ display:"flex", gap:8, marginTop:4 }}>
                      <button className="btn btn-primary" onClick={doAction} disabled={busy}>
                        {busy ? "Saving…" : "Confirm"}
                      </button>
                      <button className="btn btn-ghost" onClick={()=>{ setAction(null); setErr(""); }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "history" && (
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {logs.length === 0 && <div style={{ color:"var(--text-3)", fontFamily:"var(--mono)", fontSize:12 }}>No history yet</div>}
              {logs.map((log, i) => (
                <div key={log._id} style={{
                  padding:"12px 14px",
                  background: i%2===0 ? "transparent" : "rgba(255,255,255,.01)",
                  borderRadius:"var(--r)",
                  borderLeft: `2px solid ${
                    log.action.includes("flag") ? "var(--faulty)"
                    : log.action.includes("check") ? "var(--checkout)"
                    : log.action === "created" ? "var(--available)"
                    : "var(--border)"
                  }`,
                  marginLeft: 8,
                }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>
                      {LOG_LABELS[log.action] || log.action}
                    </span>
                    <span style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)" }}>
                      {relTime(log.createdAt)}
                    </span>
                  </div>
                  {log.from && log.to && (
                    <div style={{ fontSize:12, color:"var(--text-2)", fontFamily:"var(--mono)" }}>
                      {log.from} → {log.to}
                    </div>
                  )}
                  {log.note && <div style={{ fontSize:12, color:"var(--text-2)", marginTop:3 }}>{log.note}</div>}
                  {log.performedBy && (
                    <div style={{ fontSize:11, color:"var(--text-3)", marginTop:4 }}>
                      by {log.performedBy.name} ({log.performedBy.role})
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
