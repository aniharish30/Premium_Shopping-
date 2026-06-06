import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./Orders.css";

const STATUS_BADGE = {
  pending: "badge-warning",
  processing: "badge-info",
  shipped: "badge-info",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my").then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page loading-center"><div className="spinner"></div></div>;

  return (
    <div className="page orders-page">
      <div className="container">
        <h1 className="section-title">My Orders</h1>
        <p className="section-subtitle">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>When you place an order, it will appear here.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card fade-in">
                <div className="order-header">
                  <div>
                    <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
                    <div className="order-date">{new Date(order.createdAt).toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"})}</div>
                  </div>
                  <div className="order-header-right">
                    <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
                    <span className="order-total">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="order-items-preview">
                  {order.items.slice(0, 3).map(item => (
                    <img key={item._id} src={item.image || "https://via.placeholder.com/50"} alt={item.name} className="order-thumb" title={item.name} />
                  ))}
                  {order.items.length > 3 && (
                    <div className="order-thumb more">+{order.items.length - 3}</div>
                  )}
                  <span className="order-items-count">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="order-footer">
                  <div className="order-payment">
                    <span className={`badge ${order.isPaid ? "badge-success" : "badge-danger"}`}>
                      {order.isPaid ? "✓ Paid" : "Pending Payment"}
                    </span>
                  </div>
                  <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">View Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
