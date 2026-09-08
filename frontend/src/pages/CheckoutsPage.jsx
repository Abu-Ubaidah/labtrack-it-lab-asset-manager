import React from "react";
import { ArrowLeftRight, Clock } from "lucide-react";
import { TYPE_ICONS, fmtDate } from "../utils/api";

export default function CheckoutsPage({ assets, onSelect }) {
  const checkedOut = assets.filter(a => a.status === "checked-out");

  function isOverdue(a) {
    return a.expectedReturn && new Date(a.expectedReturn) < new Date();
  }

  return (
    <div style={{ padding:"28px 32px", overflowY:"auto", height:"100%", display:"flex", flexDirection:"column", gap:16 }}>
      <div>
        <h2 style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Active Checkouts</h2>
        <p style={{ fontSize:13, color:"var(--text-2)" }}>
          Equipment currently borrowed — peripherals, cables, adapters, and portables.
        </p>
      </div>

      {checkedOut.length === 0 ? (
        <div className="card" style={{
          padding:"60px 32px", textAlign:"center",
          display:"flex", flexDirection:"column", alignItems:"center", gap:12,
        }}>
          <div style={{
            width:56, height:56, borderRadius:"50%",
            background:"var(--checkout-dim)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <ArrowLeftRight size={24} color="var(--checkout)" />
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Nothing checked out</div>
            <div style={{ fontSize:13, color:"var(--text-2)" }}>All equipment is currently in the lab.</div>
          </div>
        </div>
      ) : (
        <>
          {/* Overdue banner */}
          {checkedOut.some(isOverdue) && (
            <div style={{
              padding:"12px 16px",
              background:"var(--faulty-dim)", border:"1px solid var(--faulty)55",
              borderRadius:"var(--r)",
              display:"flex", alignItems:"center", gap:10,
              color:"var(--faulty)", fontSize:13,
            }}>
              <Clock size={15} />
              <span>
                <strong>{checkedOut.filter(isOverdue).length}</strong> item{checkedOut.filter(isOverdue).length > 1 ? "s are" : " is"} overdue for return.
              </span>
            </div>
          )}

          {/* Cards grid */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",
            gap:12,
          }}>
            {checkedOut.map(a => {
              const overdue = isOverdue(a);
              return (
                <div key={a._id} className="card" onClick={() => onSelect(a)}
                  style={{
                    padding:"18px 20px", cursor:"pointer",
                    borderColor: overdue ? "var(--faulty)55" : "var(--checkout)33",
                    transition:"border-color .15s, transform .1s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = overdue ? "var(--faulty)" : "var(--checkout)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = overdue ? "var(--faulty)55" : "var(--checkout)33";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Top row */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{
                      width:38, height:38, borderRadius:"var(--r)",
                      background:"var(--checkout-dim)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:18, flexShrink:0,
                    }}>
                      {TYPE_ICONS[a.type]}
                    </div>
                    <div>
                      <div style={{ fontFamily:"var(--mono)", fontWeight:600, fontSize:14 }}>{a.label}</div>
                      <div style={{ fontSize:11, color:"var(--text-2)", marginTop:2 }}>{a.location} · {a.type}</div>
                    </div>
                    {overdue && (
                      <span style={{
                        marginLeft:"auto",
                        background:"var(--faulty-dim)", color:"var(--faulty)",
                        border:"1px solid var(--faulty)55",
                        borderRadius:20, fontSize:10, padding:"2px 8px",
                        fontFamily:"var(--mono)", fontWeight:600,
                      }}>OVERDUE</span>
                    )}
                  </div>

                  {/* Borrower */}
                  <div style={{
                    padding:"10px 12px",
                    background:"var(--bg-raised)", borderRadius:"var(--r)",
                    marginBottom:12,
                  }}>
                    <div style={{ fontSize:11, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:4 }}>BORROWED BY</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--checkout)" }}>{a.checkedOutTo}</div>
                    {a.checkoutNote && (
                      <div style={{ fontSize:12, color:"var(--text-2)", marginTop:4 }}>{a.checkoutNote}</div>
                    )}
                  </div>

                  {/* Dates */}
                  <div style={{ display:"flex", gap:16 }}>
                    <div>
                      <div style={{ fontSize:10, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:2 }}>CHECKED OUT</div>
                      <div style={{ fontSize:12, color:"var(--text-2)" }}>{fmtDate(a.checkedOutAt)}</div>
                    </div>
                    {a.expectedReturn && (
                      <div>
                        <div style={{ fontSize:10, color:"var(--text-3)", fontFamily:"var(--mono)", marginBottom:2 }}>RETURN BY</div>
                        <div style={{ fontSize:12, color: overdue ? "var(--faulty)" : "var(--text-2)" }}>
                          {fmtDate(a.expectedReturn)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
