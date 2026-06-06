import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/common/Toast";
import "./Auth.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { showToast("Passwords don't match", "error"); return; }
    if (form.password.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      showToast("Account created! Welcome to ShopVerse 🎉", "success");
      navigate("/");
    } else {
      showToast(result.error, "error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/" style={{fontFamily:"var(--font-display)", fontSize:"1.4rem", fontWeight:700, display:"flex", alignItems:"center", gap:8, textDecoration:"none", color:"var(--text)"}}>
            <span style={{color:"var(--accent)"}}>◆</span> ShopVerse
          </Link>
        </div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Join thousands of happy shoppers</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Jane Smith" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="jane@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="Min. 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" required value={form.confirm} onChange={e => setForm(f => ({...f, confirm: e.target.value}))} placeholder="Repeat password" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
            {loading ? <><span className="spinner spinner-sm"></span> Creating...</> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
