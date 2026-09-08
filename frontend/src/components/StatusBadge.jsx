import React from "react";

const DOT = { available:"●", "in-use":"●", faulty:"●", "under-repair":"◐", "checked-out":"○", retired:"○" };

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {DOT[status] || "●"} {status}
    </span>
  );
}
