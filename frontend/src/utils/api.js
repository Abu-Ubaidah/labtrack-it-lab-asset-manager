const tok = () => localStorage.getItem("labtrack_token");

const h = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${tok()}`,
});

async function r(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method, headers: h(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || "Request failed");
  return j;
}

export const api = {
  login:       (d)        => r("POST", "/auth/login", d),
  me:          ()         => r("GET",  "/auth/me"),
  assets:      (q = {})   => r("GET",  "/assets?" + new URLSearchParams(q)),
  stats:       ()         => r("GET",  "/assets/stats"),
  asset:       (id)       => r("GET",  `/assets/${id}`),
  createAsset: (d)        => r("POST", "/assets", d),
  updateAsset: (id, d)    => r("PATCH", `/assets/${id}`, d),
  setStatus:   (id, d)    => r("PATCH", `/assets/${id}/status`, d),
  flag:        (id, d)    => r("PATCH", `/assets/${id}/flag`, d),
  checkout:    (id, d)    => r("PATCH", `/assets/${id}/checkout`, d),
  checkin:     (id, d)    => r("PATCH", `/assets/${id}/checkin`, d),
  retire:      (id)       => r("DELETE", `/assets/${id}`),
  assetLogs:   (id)       => r("GET",  `/logs/${id}`),
  recentLogs:  (n = 30)   => r("GET",  `/logs?limit=${n}`),
};

export const STATUS_COLORS = {
  available:     "var(--available)",
  "in-use":      "var(--inuse)",
  faulty:        "var(--faulty)",
  "under-repair":"var(--repair)",
  "checked-out": "var(--checkout)",
  retired:       "var(--text-3)",
};

export const TYPE_ICONS = {
  pc: "🖥️", printer: "🖨️", projector: "📽️",
  switch: "🔌", peripheral: "🔧", other: "📦",
};

export function relTime(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60)   return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return new Date(d).toLocaleDateString();
}

export function fmtDate(d) {
  return d ? new Date(d).toLocaleString() : "—";
}
