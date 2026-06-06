import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { showToast } from "../../components/common/Toast";
import "./Admin.css";

const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];
const STATUS_BADGE = { pending: "badge-warning", processing: "badge-info", shipped: "badge-info", delivered: "badge-success", cancelled: "badge-danger" };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 20 });
      if (filter !== "all") q.set("status", filter);
      const { data } = await api.get(`/orders/admin/all?${q}`);
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter, page]);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      showToast(`Order updated to "${status}"`, "success");
      fetchOrders();
    } catch { showToast("Update failed", "error"); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="page admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="section-title">Orders</h1>
            <p className="section-subtitle">{total} orders total</p>
          </div>
        </div>

        <div className="admin-controls">
          <div style={{display:"flex", gap: 6}}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-secondary"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{textAlign:"center", padding:40}}><div className="spinner" style={{margin:"0 auto"}}></div></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{textAlign:"center", padding:40, color:"var(--text-muted)"}}>No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order._id}>
                  <td className="order-id-cell">#{order._id.slice(-8).toUpperCase()}</td>
                  <td>
                    <div style={{fontSize:14, fontWeight:500, color:"var(--text)"}}>{order.user?.name || "—"}</div>
                    <div style={{fontSize:12, color:"var(--text-faint)"}}>{order.user?.email}</div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.items?.length}</td>
                  <td><strong style={{color:"var(--text)"}}>${order.totalPrice?.toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${order.isPaid ? "badge-success" : "badge-danger"}`}>
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span></td>
                  <td>
                    <div style={{display:"flex", gap:6, alignItems:"center"}}>
                      <select
                        className="form-input form-select"
                        style={{padding:"6px 28px 6px 10px", fontSize:12, minWidth:120}}
                        value={order.status}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                      >
                        {["pending","processing","shipped","delivered","cancelled"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm">View</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="admin-pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="btn btn-secondary btn-sm">← Prev</button>
            <span>Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(p => p+1)} className="btn btn-secondary btn-sm">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
