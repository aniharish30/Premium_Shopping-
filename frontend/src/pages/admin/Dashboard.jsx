import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import "./Admin.css";

const StatCard = ({ label, value, icon, color, link }) => (
  <Link to={link || "#"} className="stat-card" style={{"--stat-color": color}}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </Link>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/products/admin/stats"),
      api.get("/orders/admin/stats"),
      api.get("/users/stats"),
      api.get("/orders/admin/all?limit=5"),
    ]).then(([products, orders, users, recentOrdersRes]) => {
      setStats({
        products: products.data.stats,
        orders: orders.data.stats,
        users: users.data.stats,
      });
      setRecentOrders(recentOrdersRes.data.orders);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page loading-center"><div className="spinner"></div></div>;

  return (
    <div className="page admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="section-subtitle">Welcome back! Here's your store overview.</p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard label="Total Products" value={stats?.products.total || 0} icon="📦" color="#c8a96e" link="/admin/products" />
          <StatCard label="Total Orders" value={stats?.orders.totalOrders || 0} icon="🛍" color="#5a9fd4" link="/admin/orders" />
          <StatCard label="Revenue" value={`$${(stats?.orders.revenue || 0).toFixed(2)}`} icon="💰" color="#5cb88a" />
          <StatCard label="Total Users" value={stats?.users.total || 0} icon="👥" color="#e09450" link="/admin/users" />
          <StatCard label="Pending Orders" value={stats?.orders.pending || 0} icon="⏳" color="#e09450" link="/admin/orders" />
          <StatCard label="Delivered" value={stats?.orders.delivered || 0} icon="✓" color="#5cb88a" link="/admin/orders" />
          <StatCard label="Out of Stock" value={stats?.products.outOfStock || 0} icon="⚠" color="#e05c5c" link="/admin/products" />
          <StatCard label="New Users (Mo)" value={stats?.users.newThisMonth || 0} icon="🆕" color="#9b8fd4" link="/admin/users" />
        </div>

        {/* Quick Links */}
        <div className="admin-quick-links">
          {[
            { to: "/admin/products", label: "Manage Products", icon: "📦", desc: "Add, edit, delete products" },
            { to: "/admin/orders", label: "Manage Orders", icon: "🛍", desc: "View and update order status" },
            { to: "/admin/users", label: "Manage Users", icon: "👥", desc: "View and manage users" },
          ].map(l => (
            <Link key={l.to} to={l.to} className="quick-link-card">
              <span className="ql-icon">{l.icon}</span>
              <div>
                <div className="ql-label">{l.label}</div>
                <div className="ql-desc">{l.desc}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="order-id-cell">#{order._id.slice(-8).toUpperCase()}</td>
                    <td>{order.user?.name || "—"}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td><strong>${order.totalPrice.toFixed(2)}</strong></td>
                    <td><span className={`badge ${order.status === "delivered" ? "badge-success" : order.status === "cancelled" ? "badge-danger" : "badge-warning"}`}>{order.status}</span></td>
                    <td><Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
