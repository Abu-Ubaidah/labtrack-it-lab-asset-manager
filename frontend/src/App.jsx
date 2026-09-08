import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./utils/api";
import LoginPage     from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssetsPage    from "./pages/AssetsPage";
import FlaggedPage   from "./pages/FlaggedPage";
import CheckoutsPage from "./pages/CheckoutsPage";
import ActivityPage  from "./pages/ActivityPage";
import Sidebar       from "./components/Sidebar";
import AssetDrawer   from "./components/AssetDrawer";
import AddAssetModal from "./components/AddAssetModal";

function Main() {
  const { user, ready } = useAuth();

  if (!ready) return (
    <div style={{
      height:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"var(--bg)",
    }}>
      <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--text-3)" }}>loading…</span>
    </div>
  );

  if (!user) return <LoginPage />;
  return <App />;
}

function App() {
  const { user } = useAuth();
  const isTech = user?.role === "technician";

  const [page,         setPage]         = useState("dashboard");
  const [assets,       setAssets]       = useState([]);
  const [selected,     setSelected]     = useState(null);   // asset in drawer
  const [showAdd,      setShowAdd]      = useState(false);

  // Load all assets
  const loadAssets = useCallback(() => {
    api.assets().then(j => setAssets(j.assets)).catch(console.error);
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  // Socket.IO — live updates
  useEffect(() => {
    const token = localStorage.getItem("labtrack_token");
    if (!token) return;
    const socket = io("/", { auth: { token }, transports: ["websocket"] });

    socket.on("asset:created", (a) => {
      setAssets(prev => [a, ...prev]);
    });
    socket.on("asset:updated", (a) => {
      setAssets(prev => prev.map(x => x._id === a._id ? a : x));
      // also update drawer if it's open on this asset
      setSelected(prev => prev?._id === a._id ? a : prev);
    });

    return () => socket.disconnect();
  }, []);

  // Counts
  const flagCount = assets.filter(a => a.flagged).length;

  function handleAssetUpdated(updated) {
    setAssets(prev => prev.map(a => a._id === updated._id ? updated : a));
  }

  function handleAssetAdded(newAsset) {
    setAssets(prev => [newAsset, ...prev]);
  }

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <Sidebar page={page} setPage={setPage} flagCount={flagCount} />

      <main style={{
        flex:1, overflow:"hidden", display:"flex", flexDirection:"column",
        background:"var(--bg)",
      }}>
        {/* Page header bar */}
        <div style={{
          height:"var(--header)", flexShrink:0,
          borderBottom:"1px solid var(--border)",
          background:"var(--bg-panel)",
          display:"flex", alignItems:"center",
          padding:"0 32px",
          gap:12,
        }}>
          <span style={{ fontSize:15, fontWeight:600 }}>
            {{ dashboard:"Dashboard", assets:"All Assets", flagged:"Flagged", checkouts:"Checkouts", activity:"Activity Log" }[page]}
          </span>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{
              width:7, height:7, borderRadius:"50%", background:"var(--available)",
              boxShadow:"0 0 6px var(--available)",
            }} />
            <span style={{ fontSize:11, color:"var(--text-2)", fontFamily:"var(--mono)" }}>
              {assets.length} assets tracked
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflow:"hidden" }}>
          {page === "dashboard" && (
            <DashboardPage
              onSelectAsset={setSelected}
              liveAssets={assets}
            />
          )}
          {page === "assets" && (
            <AssetsPage
              assets={assets}
              onSelect={setSelected}
              onAdd={() => setShowAdd(true)}
              isTech={isTech}
            />
          )}
          {page === "flagged" && (
            <FlaggedPage assets={assets} onSelect={setSelected} />
          )}
          {page === "checkouts" && (
            <CheckoutsPage assets={assets} onSelect={setSelected} />
          )}
          {page === "activity" && (
            <ActivityPage onSelectAsset={setSelected} liveAssets={assets} />
          )}
        </div>
      </main>

      {/* Asset detail drawer */}
      {selected && (
        <AssetDrawer
          asset={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleAssetUpdated}
        />
      )}

      {/* Add asset modal */}
      {showAdd && (
        <AddAssetModal
          onClose={() => setShowAdd(false)}
          onAdded={handleAssetAdded}
        />
      )}
    </div>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
