// OrderSuccess.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order));
  }, [id]);

  return (
    <div className="page success-page">
      <div className="container success-container">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Order Confirmed!</h1>
        <p className="success-subtitle">Thank you for your purchase. Your order has been received and is being processed.</p>
        {order && (
          <div className="success-details">
            <div className="success-info-grid">
              <div><span className="info-label">Order ID</span><span className="info-val">#{order._id.slice(-8).toUpperCase()}</span></div>
              <div><span className="info-label">Total</span><span className="info-val">${order.totalPrice.toFixed(2)}</span></div>
              <div><span className="info-label">Status</span><span className="badge badge-success">{order.status}</span></div>
              <div><span className="info-label">Payment</span><span className="badge badge-success">Paid</span></div>
            </div>
            <div className="success-items">
              {order.items.map(item => (
                <div key={item._id} className="success-item">
                  <img src={item.image || "https://via.placeholder.com/50"} alt={item.name} />
                  <span className="success-item-name">{item.name}</span>
                  <span className="success-item-qty">×{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="success-actions">
          <Link to={`/orders/${id}`} className="btn btn-primary btn-lg">View Order Details</Link>
          <Link to="/products" className="btn btn-secondary btn-lg">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
