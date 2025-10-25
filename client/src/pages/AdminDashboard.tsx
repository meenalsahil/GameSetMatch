import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [players, setPlayers] = useState([]);

  // Load all players
  const fetchPlayers = async () => {
    const res = await fetch("/api/admin/players");
    const data = await res.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // API helpers
  const handleApprove = async (id: number) => {
    await fetch(`/api/admin/approve/${id}`, { method: "POST" });
    fetchPlayers();
  };

  const handleReject = async (id: number) => {
    await fetch(`/api/admin/reject/${id}`, { method: "POST" });
    fetchPlayers();
  };

  const handleDeactivate = async (id: number) => {
    await fetch(`/api/admin/deactivate/${id}`, { method: "POST" });
    fetchPlayers();
  };

  const handleActivate = async (id: number) => {
    await fetch(`/api/admin/activate/${id}`, { method: "POST" });
    fetchPlayers();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/delete/${id}`, { method: "DELETE" });
    fetchPlayers();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p: any) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.name}</td>
              <td className="border px-4 py-2">{p.status}</td>
              <td className="border px-4 py-2 space-x-2">
                <button onClick={() => handleApprove(p.id)}>Approve</button>
                <button onClick={() => handleReject(p.id)}>Reject</button>
                <button onClick={() => handleDeactivate(p.id)}>
                  Deactivate
                </button>
                <button onClick={() => handleActivate(p.id)}>Activate</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
