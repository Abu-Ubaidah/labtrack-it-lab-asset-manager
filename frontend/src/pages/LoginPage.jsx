import React, { useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    try { login(await api.login(form)); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--bg)", padding:24,
    }}>
      <div className="card" style={{ width:"100%", maxWidth:380, padding:"40px 36px" }}>
        {/* Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
          <div style={{
            width:40, height:40, borderRadius:"var(--r)",
            background:"var(--accent-dim)", border:"1px solid var(--accent-glow)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{
              color:"var(--accent)", fontFamily:"var(--mono)",
              fontSize:16, fontWeight:700, letterSpacing:"-0.08em",
            }}>LT</span>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:20, letterSpacing:"-0.02em" }}>LabTrack</div>
            <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)" }}>IT Lab Asset Manager</div>
          </div>
        </div>

        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:24 }}>Sign in</h2>

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <input className="inp" placeholder="Username" value={form.username}
            onChange={(e)=>setForm(f=>({...f, username:e.target.value}))} required autoFocus />
          <input className="inp" type="password" placeholder="Password" value={form.password}
            onChange={(e)=>setForm(f=>({...f, password:e.target.value}))} required />

          {err && <div style={{
            padding:"9px 12px", background:"var(--danger-dim)",
            border:"1px solid var(--danger)", borderRadius:"var(--r)",
            color:"var(--danger)", fontSize:13,
          }}>{err}</div>}

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ marginTop:4 }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{
          marginTop:20, padding:"12px 14px",
          background:"var(--bg-raised)", borderRadius:"var(--r)",
          fontSize:12, color:"var(--text-2)", fontFamily:"var(--mono)",
          lineHeight:1.8,
        }}>
          <div style={{ color:"var(--accent)", marginBottom:4, fontSize:11 }}>DEMO ACCOUNTS</div>
          tech / tech1234 &nbsp;→&nbsp; <span style={{color:"var(--available)"}}>Technician</span><br/>
          viewer / viewer1234 &nbsp;→&nbsp; <span style={{color:"var(--inuse)"}}>Viewer</span>
        </div>
      </div>
    </div>
  );
}
