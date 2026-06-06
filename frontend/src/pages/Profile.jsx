import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { showToast } from "../components/common/Toast";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
  });
  const [pwForm, setPwForm] = useState({ current: "", password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", {
        name: form.name, email: form.email, phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode },
      });
      updateUser(data.user);
      showToast("Profile updated!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) { showToast("Passwords don't match", "error"); return; }
    setSavingPw(true);
    try {
      await api.put("/auth/profile", { password: pwForm.password });
      showToast("Password changed!", "success");
      setPwForm({ current: "", password: "", confirm: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally { setSavingPw(false); }
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="page" style={{paddingTop: 100}}>
      <div className="container" style={{maxWidth: 760}}>
        <h1 className="section-title">My Profile</h1>

        {/* User card */}
        <div style={{background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding: 24, display:"flex", alignItems:"center", gap: 20, marginBottom: 32}}>
          <div style={{width: 64, height: 64, borderRadius:"50%", background:"var(--accent)", color:"#1a1408", fontSize: 24, fontWeight: 700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{fontSize: 18, fontWeight: 700}}>{user?.name}</div>
            <div style={{fontSize: 14, color:"var(--text-muted)"}}>{user?.email}</div>
          </div>
          <span className={`badge ${user?.role === "admin" ? "badge-accent" : "badge-info"}`} style={{marginLeft:"auto"}}>{user?.role}</span>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfile} style={{background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding: 32, marginBottom: 24}}>
          <h3 style={{fontSize: 16, fontWeight: 700, marginBottom: 24}}>Personal Information</h3>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16, marginBottom: 24}}>
            {field("Full Name", "name", "text", "Jane Smith")}
            {field("Email", "email", "email", "jane@example.com")}
            {field("Phone", "phone", "tel", "+1 555 000 0000")}
          </div>
          <h3 style={{fontSize: 16, fontWeight: 700, marginBottom: 20}}>Shipping Address</h3>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16}}>
            <div style={{gridColumn:"1/-1"}}>{field("Street", "street", "text", "123 Main St")}</div>
            {field("City", "city", "text", "New York")}
            {field("State", "state", "text", "NY")}
            {field("ZIP Code", "zipCode", "text", "10001")}
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{marginTop: 24}}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Password Form */}
        <form onSubmit={handlePassword} style={{background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding: 32}}>
          <h3 style={{fontSize: 16, fontWeight: 700, marginBottom: 24}}>Change Password</h3>
          <div style={{display:"flex", flexDirection:"column", gap: 16, maxWidth: 400}}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" required value={pwForm.password} onChange={e => setPwForm(f => ({...f, password: e.target.value}))} placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" required value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} placeholder="Repeat password" />
            </div>
          </div>
          <button type="submit" disabled={savingPw} className="btn btn-secondary" style={{marginTop: 24}}>
            {savingPw ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
