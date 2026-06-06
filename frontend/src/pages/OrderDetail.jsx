import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];
const STATUS_BADGE = { pending: "badge-warning", processing: "badge-info", shipped: "badge-info", delivered: "badge-success", cancelled: "badge-danger" };

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page loading-center"><div className="spinner"></div></div>;
  if (!order) return <div className="page"><div className="container"><p>Order not found.</p></div></div>;

  const statusIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="page" style={{paddingTop: 100}}>
      <div className="container" style={{maxWidth: 860}}>
        <div style={{display:"flex", alignItems:"center", gap: 12, marginBottom: 24}}>
          <Link to="/orders" className="btn btn-ghost btn-sm">← Back</Link>
          <h1 className="section-title" style={{margin:0}}>Order #{order._id.slice(-8).toUpperCase()}</h1>
          <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
        </div>

        {/* Progress tracker */}
        {order.status !== "cancelled" && (
          <div className="order-progress" style={{background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding: 28, marginBottom: 24}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              {STATUS_STEPS.map((s, i) => (
                <div key={s} style={{display:"flex", alignItems:"center", flex: i < STATUS_STEPS.length-1 ? 1 : "none"}}>
                  <div style={{textAlign:"center", minWidth:80}}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px",
                      background: i <= statusIdx ? "var(--accent-dim)" : "var(--bg-3)",
                      border: `2px solid ${i <= statusIdx ? "var(--accent)" : "var(--border)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color: i <= statusIdx ? "var(--accent)" : "var(--text-faint)",
                      fontSize: 14, fontWeight: 700
                    }}>{i < statusIdx ? "✓" : i + 1}</div>
                    <div style={{fontSize: 11, textTransform:"uppercase", letterSpacing:"0.5px", color: i <= statusIdx ? "var(--text)" : "var(--text-faint)", fontWeight: 600}}>{s}</div>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{flex:1, height: 2, background: i < statusIdx ? "var(--accent)" : "var(--border)", margin: "0 8px", marginBottom: 24}} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display:"grid", gridTemplateColumns:"1fr 300px", gap: 24}}>
          <div style={{display:"flex", flexDirection:"column", gap: 20}}>
            {/* Items */}
            <div className="card" style={{padding: 24}}>
              <h3 style={{fontSize: 15, fontWeight: 700, marginBottom: 20}}>Items Ordered</h3>
              {order.items.map(item => (
                <div key={item._id} style={{display:"flex", gap: 14, alignItems:"center", paddingBottom: 16, marginBottom: 16, borderBottom:"1px solid var(--border)"}}>
                  <img src={item.image} alt={item.name} style={{width: 60, height: 60, borderRadius: 8, objectFit:"cover"}} />
                  <div style={{flex:1}}>
                    <div style={{fontSize: 14, fontWeight: 500}}>{item.name}</div>
                    <div style={{fontSize: 13, color:"var(--text-muted)"}}>Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                  </div>
                  <div style={{fontWeight: 700}}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Shipping */}
            <div className="card" style={{padding: 24}}>
              <h3 style={{fontSize: 15, fontWeight: 700, marginBottom: 16}}>Shipping Address</h3>
              <p style={{color:"var(--text-muted)", fontSize: 14, lineHeight: 1.8}}>
                {order.shippingAddress.fullName}<br/>
                {order.shippingAddress.street}<br/>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br/>
                {order.shippingAddress.country}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{padding: 24, height:"fit-content"}}>
            <h3 style={{fontSize: 15, fontWeight: 700, marginBottom: 20}}>Order Summary</h3>
            {[
              ["Subtotal", `$${order.itemsPrice.toFixed(2)}`],
              ["Shipping", order.shippingPrice === 0 ? "Free" : `$${order.shippingPrice.toFixed(2)}`],
              ["Tax", `$${order.taxPrice.toFixed(2)}`],
            ].map(([k,v]) => (
              <div key={k} style={{display:"flex", justifyContent:"space-between", fontSize:14, color:"var(--text-muted)", marginBottom: 12}}><span>{k}</span><span>{v}</span></div>
            ))}
            <hr className="divider" />
            <div style={{display:"flex", justifyContent:"space-between", fontWeight: 700, fontSize: 16}}><span>Total</span><span>${order.totalPrice.toFixed(2)}</span></div>
            <hr className="divider" />
            <div style={{fontSize: 13, color:"var(--text-muted)"}}>
              <div style={{marginBottom:8}}>Payment: <span style={{color:"var(--text)"}}>{order.paymentMethod}</span></div>
              <div>Placed: <span style={{color:"var(--text)"}}>{new Date(order.createdAt).toLocaleDateString()}</span></div>
              {order.isPaid && <div style={{marginTop:8}}><span className="badge badge-success">✓ Paid</span></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
