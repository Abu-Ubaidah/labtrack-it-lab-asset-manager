import React, { useState } from "react";
import { X } from "lucide-react";
import { api } from "../utils/api";

export default function AddAssetModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    label:"", type:"pc", location:"", serialNo:"", specs:"", notes:"", condition:"good",
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  const s = e => k => setForm(f=>({...f,[k]:e.target.value}));

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const { asset } = await api.createAsset(form);
      onAdded(asset);
      onClose();
    } catch(e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  const inp = { className:"inp" };
  const sel = { background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:"var(--r)", color:"var(--text)", padding:"9px 12px", width:"100%", fontSize:14, outline:"none" };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:100,
      background:"rgba(10,10,15,.8)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:24,
    }} onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="card" style={{ width:"100%", maxWidth:480, padding:"28px 28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h3 style={{ fontSize:16, fontWeight:600 }}>Add New Asset</h3>
          <button onClick={onClose} style={{ color:"var(--text-3)" }}><X size={16}/></button>
        </div>

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:5 }}>LABEL *</div>
              <input {...inp} placeholder="e.g. PC-A21" value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} required autoFocus />
            </div>
            <div>
              <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:5 }}>TYPE *</div>
              <select style={sel} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {["pc","printer","projector","switch","peripheral","other"].map(t=>(
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:5 }}>LOCATION *</div>
            <input {...inp} placeholder="e.g. Lab A, Server Room" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} required />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:5 }}>SERIAL NO</div>
              <input {...inp} placeholder="Optional" value={form.serialNo} onChange={e=>setForm(f=>({...f,serialNo:e.target.value}))} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:5 }}>CONDITION</div>
              <select style={sel} value={form.condition} onChange={e=>setForm(f=>({...f,condition:e.target.value}))}>
                {["good","fair","poor"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:5 }}>SPECS</div>
            <input {...inp} placeholder="e.g. Intel i5-10th, 8GB RAM, 256GB SSD" value={form.specs} onChange={e=>setForm(f=>({...f,specs:e.target.value}))} />
          </div>
          <div>
            <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:5 }}>NOTES</div>
            <textarea {...inp} placeholder="Any additional notes…" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{resize:"vertical"}} />
          </div>

          {err && <div style={{ color:"var(--danger)", fontSize:13 }}>{err}</div>}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Adding…" : "Add Asset"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
