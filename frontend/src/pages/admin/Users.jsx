import { useState, useEffect } from "react";
import api from "../../utils/api";
import { showToast } from "../../components/common/Toast";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleRole = async (userId, currentRole) => {
    if (userId === currentUser._id) { showToast("You cannot change your own role", "error"); return; }
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      showToast(`Role updated to ${newRole}`, "success");
      fetchUsers();
    } catch { showToast("Update failed", "error"); }
  };

  const handleToggleActive = async (userId, isActive) => {
    if (userId === currentUser._id) { showToast("You cannot deactivate yourself", "error"); return; }
    try {
      await api.put(`/users/${userId}`, { isActive: !isActive });
      showToast(isActive ? "User deactivated" : "User activated", "success");
      fetchUsers();
    } catch { showToast("Update failed", "error"); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="section-title">Users</h1>
            <p className="section-subtitle">{users.length} users total</p>
          </div>
        </div>

        <div className="admin-controls">
          <div className="admin-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="form-input admin-search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{textAlign:"center", padding:40}}><div className="spinner" style={{margin:"0 auto"}}></div></td></tr>
              ) : filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{display:"flex", alignItems:"center", gap:10}}>
                      <div style={{width:34, height:34, borderRadius:"50%", background:"var(--accent)", color:"#1a1408", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0}}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:14, fontWeight:500, color:"var(--text)"}}>{u.name}</div>
                        {u._id === currentUser._id && <span style={{fontSize:11, color:"var(--accent)"}}>You</span>}
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "badge-accent" : "badge-info"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{display:"flex", gap:6}}>
                      <button
                        onClick={() => handleToggleRole(u._id, u.role)}
                        disabled={u._id === currentUser._id}
                        className="btn btn-secondary btn-sm"
                      >
                        {u.role === "admin" ? "→ User" : "→ Admin"}
                      </button>
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        disabled={u._id === currentUser._id}
                        className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-secondary"}`}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
