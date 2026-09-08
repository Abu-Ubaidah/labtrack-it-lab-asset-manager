import React from "react";
import { LayoutDashboard, Monitor, AlertTriangle, ArrowLeftRight, ClipboardList, LogOut, Layers } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { key:"dashboard",  label:"Dashboard",    icon: LayoutDashboard },
  { key:"assets",     label:"All Assets",   icon: Monitor },
  { key:"flagged",    label:"Flagged",      icon: AlertTriangle },
  { key:"checkouts",  label:"Checkouts",    icon: ArrowLeftRight },
  { key:"activity",   label:"Activity Log", icon: ClipboardList },
];

export default function Sidebar({ page, setPage, flagCount }) {
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width:"var(--sidebar)", flexShrink:0,
      background:"var(--bg-panel)", borderRight:"1px solid var(--border)",
      display:"flex", flexDirection:"column", height:"100vh",
    }}>
      {/* Brand */}
      <div style={{
        height:"var(--header)", padding:"0 18px",
        display:"flex", alignItems:"center", gap:10,
        borderBottom:"1px solid var(--border)", flexShrink:0,
      }}>
        <div style={{
          width:30, height:30, borderRadius:"var(--r)",
          background:"var(--accent-dim)", border:"1px solid var(--accent-glow)",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Layers size={15} color="var(--accent)" />
        </div>
        <span style={{ fontWeight:700, fontSize:15, letterSpacing:"-0.01em" }}>LabTrack</span>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto" }}>
        <div style={{ fontSize:10, color:"var(--text-3)", fontFamily:"var(--mono)", padding:"6px 10px 8px", letterSpacing:"0.08em" }}>
          NAVIGATION
        </div>
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = page === key;
          return (
            <button key={key} onClick={() => setPage(key)} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              width:"100%", padding:"8px 10px", borderRadius:"var(--r)",
              background: active ? "var(--accent-dim)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-2)",
              marginBottom:2, textAlign:"left", gap:8,
              transition:"background .1s, color .1s",
            }}
            onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="var(--bg-hover)"; e.currentTarget.style.color="var(--text)"; }}}
            onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-2)"; }}}
            >
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <Icon size={15} />
                <span style={{ fontSize:13, fontWeight: active ? 600 : 400 }}>{label}</span>
              </div>
              {key === "flagged" && flagCount > 0 && (
                <span style={{
                  background:"var(--faulty)", color:"#fff",
                  fontSize:10, fontWeight:700,
                  padding:"1px 6px", borderRadius:10,
                  fontFamily:"var(--mono)",
                }}>{flagCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        borderTop:"1px solid var(--border)", padding:"12px 14px",
        display:"flex", alignItems:"center", gap:10, flexShrink:0,
      }}>
        <div style={{
          width:30, height:30, borderRadius:"50%",
          background: user?.role === "technician" ? "var(--accent-dim)" : "var(--inuse-dim)",
          border:`1px solid ${user?.role === "technician" ? "var(--accent)" : "var(--inuse)"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"var(--mono)", fontSize:12, fontWeight:600,
          color: user?.role === "technician" ? "var(--accent)" : "var(--inuse)",
          flexShrink:0,
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {user?.name}
          </div>
          <div style={{ fontSize:10, fontFamily:"var(--mono)", color: user?.role === "technician" ? "var(--accent)" : "var(--text-3)" }}>
            {user?.role}
          </div>
        </div>
        <button onClick={logout} style={{ color:"var(--text-3)", padding:4 }}
          onMouseEnter={e=>e.currentTarget.style.color="var(--danger)"}
          onMouseLeave={e=>e.currentTarget.style.color="var(--text-3)"}
          title="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
