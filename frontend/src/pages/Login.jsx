import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/common/Toast";
import "./Auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      showToast("Welcome back! 👋", "success");
      navigate("/");
    } else {
      showToast(result.error, "error");
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") setForm({ email: "admin@shopverse.com", password: "admin123" });
    else setForm({ email: "jane@example.com", password: "user123" });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/" className="nav-logo" style={{fontFamily:"var(--font-display)", fontSize:"1.4rem", fontWeight:700, display:"flex", alignItems:"center", gap:8, textDecoration:"none", color:"var(--text)"}}>
            <span style={{color:"var(--accent)"}}>◆</span> ShopVerse
          </Link>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {/* Demo Accounts */}
        <div className="demo-accounts">
          <p className="demo-label">Quick demo login:</p>
          <div className="demo-btns">
            <button onClick={() => fillDemo("user")} className="demo-btn">
              <span>👤</span> User Demo
            </button>
            <button onClick={() => fillDemo("admin")} className="demo-btn admin">
              <span>🛡</span> Admin Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@example.com" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
            {loading ? <><span className="spinner spinner-sm"></span> Signing in...</> : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
}
