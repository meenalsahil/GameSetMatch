import React, { useEffect, useState } from "react";

type Player = {
  id: string;
  email: string;
  fullName: string;
  location: string;
  approvalStatus: "pending" | "approved" | "rejected";
  active?: boolean; // false = deactivated
};

export default function AdminDashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch("/api/admin/players");
      if (!res.ok) throw new Error("Failed to load players (admin)");
      const data = await res.json();
      setPlayers(data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(url: string, method: "POST" | "DELETE" = "POST") {
    const res = await fetch(url, { method });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Request failed: ${url}`);
    }
    return res.json().catch(() => ({}));
  }

  const approve = (id: string) =>
    post(`/api/admin/players/${id}/approve`).then(load);
  const reject = (id: string) =>
    post(`/api/admin/players/${id}/reject`).then(load);
  const deactivate = (id: string) =>
    post(`/api/admin/players/${id}/deactivate`).then(load);
  const activate = (id: string) =>
    post(`/api/admin/players/${id}/activate`).then(load);
  const del = (id: string) =>
    post(`/api/admin/players/${id}`, "DELETE").then(load);

  const approved = players.filter((p) => p.approvalStatus === "approved");
  const pending = players.filter((p) => p.approvalStatus === "pending");
  const rejected = players.filter((p) => p.approvalStatus === "rejected");
  const activeApproved = approved.filter((p) => p.active !== false);
  const inactiveApproved = approved.filter((p) => p.active === false);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {loading && <div className="mb-4 text-gray-500">Loading…</div>}
      {err && <div className="mb-4 text-red-600">{err}</div>}

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">
            Pending ({pending.length})
          </h2>
          <ul className="space-y-2 mb-6">
            {pending.map((p) => (
              <li
                key={p.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{p.fullName}</div>
                  <div className="text-sm text-gray-500">{p.email}</div>
                </div>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white"
                    onClick={() => approve(p.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-gray-700 text-white"
                    onClick={() => reject(p.id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Active approved */}
      <h2 className="text-xl font-semibold mb-2">
        Active Players ({activeApproved.length})
      </h2>
      <ul className="space-y-2 mb-6">
        {activeApproved.map((p) => (
          <li
            key={p.id}
            className="border rounded p-3 flex items-center justify-between bg-green-50"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-600 text-white">
                Active
              </span>
              <div>
                <div className="font-medium">{p.fullName}</div>
                <div className="text-sm text-gray-500">{p.email}</div>
              </div>
            </div>
            <div className="space-x-2">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => deactivate(p.id)}
              >
                Deactivate
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={() => del(p.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Inactive approved */}
      <h2 className="text-xl font-semibold mb-2">
        Inactive Players ({inactiveApproved.length})
      </h2>
      <ul className="space-y-2 mb-6">
        {inactiveApproved.map((p) => (
          <li
            key={p.id}
            className="border rounded p-3 flex items-center justify-between bg-gray-100 opacity-70"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-600 text-white">
                Inactive
              </span>
              <div>
                <div className="font-medium text-gray-700">{p.fullName}</div>
                <div className="text-sm text-gray-500">{p.email}</div>
              </div>
            </div>
            <div className="space-x-2">
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white"
                onClick={() => activate(p.id)}
              >
                Activate
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={() => del(p.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Rejected */}
      {rejected.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">
            Rejected ({rejected.length})
          </h2>
          <ul className="space-y-2">
            {rejected.map((p) => (
              <li
                key={p.id}
                className="border rounded p-3 flex items-center justify-between bg-red-50"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-red-600 text-white">
                    Rejected
                  </span>
                  <div>
                    <div className="font-medium">{p.fullName}</div>
                    <div className="text-sm text-gray-500">{p.email}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
