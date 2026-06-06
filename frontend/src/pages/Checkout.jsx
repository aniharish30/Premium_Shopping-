import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { showToast } from "../components/common/Toast";
import "./Checkout.css";

const STEPS = ["Shipping", "Payment", "Review"];

export default function Checkout() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: user?.name || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: user?.phone || "",
  });
  const [payment, setPayment] = useState({
    method: "card",
    cardNumber: "4111 1111 1111 1111",
    cardName: user?.name || "",
    expiry: "12/26",
    cvv: "123",
  });

  const shippingCost = cartTotal > 100 ? 0 : 9.99;
  const tax = cartTotal * 0.1;
  const total = cartTotal + shippingCost + tax;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const required = ["fullName", "street", "city", "state", "zipCode"];
    if (required.some(f => !shipping[f])) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setStep(1);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        shippingAddress: shipping,
        paymentMethod: payment.method,
      });
      showToast("Order placed successfully! 🎉", "success");
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Order failed", "error");
      setPlacing(false);
    }
  };

  if (!cart.items?.length) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="page checkout-page">
      <div className="container">
        <h1 className="section-title">Checkout</h1>

        {/* Step Progress */}
        <div className="steps-progress">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-item ${i <= step ? "active" : ""} ${i < step ? "done" : ""}`}>
              <div className="step-circle">{i < step ? "✓" : i + 1}</div>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <form onSubmit={handleShippingSubmit} className="checkout-form fade-in">
                <h3 className="form-section-title">Shipping Address</h3>
                <div className="form-grid-2">
                  <div className="form-group" style={{gridColumn: "1/-1"}}>
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={shipping.fullName} onChange={e => setShipping(s => ({...s, fullName: e.target.value}))} placeholder="John Doe" />
                  </div>
                  <div className="form-group" style={{gridColumn: "1/-1"}}>
                    <label className="form-label">Street Address *</label>
                    <input className="form-input" required value={shipping.street} onChange={e => setShipping(s => ({...s, street: e.target.value}))} placeholder="123 Main St, Apt 4B" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="form-input" required value={shipping.city} onChange={e => setShipping(s => ({...s, city: e.target.value}))} placeholder="New York" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input className="form-input" required value={shipping.state} onChange={e => setShipping(s => ({...s, state: e.target.value}))} placeholder="NY" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code *</label>
                    <input className="form-input" required value={shipping.zipCode} onChange={e => setShipping(s => ({...s, zipCode: e.target.value}))} placeholder="10001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={shipping.phone} onChange={e => setShipping(s => ({...s, phone: e.target.value}))} placeholder="+1 555 000 0000" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{marginTop: 12}}>Continue to Payment →</button>
              </form>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <form onSubmit={handlePaymentSubmit} className="checkout-form fade-in">
                <h3 className="form-section-title">Payment Method</h3>
                <div className="payment-methods">
                  {[
                    { id: "card", label: "Credit / Debit Card", icon: "💳" },
                    { id: "paypal", label: "PayPal", icon: "🅿" },
                    { id: "apple", label: "Apple Pay", icon: "🍎" },
                  ].map(m => (
                    <label key={m.id} className={`payment-option ${payment.method === m.id ? "selected" : ""}`}>
                      <input type="radio" name="method" value={m.id} checked={payment.method === m.id} onChange={e => setPayment(p => ({...p, method: e.target.value}))} />
                      <span className="payment-icon">{m.icon}</span>
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>

                {payment.method === "card" && (
                  <div className="card-form">
                    <div className="demo-notice">
                      <span>🔒</span> Demo mode — pre-filled test card
                    </div>
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input className="form-input" value={payment.cardNumber} onChange={e => setPayment(p => ({...p, cardNumber: e.target.value}))} placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cardholder Name</label>
                      <input className="form-input" value={payment.cardName} onChange={e => setPayment(p => ({...p, cardName: e.target.value}))} />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Expiry (MM/YY)</label>
                        <input className="form-input" value={payment.expiry} onChange={e => setPayment(p => ({...p, expiry: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input className="form-input" value={payment.cvv} onChange={e => setPayment(p => ({...p, cvv: e.target.value}))} type="password" maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" onClick={() => setStep(0)} className="btn btn-secondary">← Back</button>
                  <button type="submit" className="btn btn-primary btn-lg">Review Order →</button>
                </div>
              </form>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="checkout-form fade-in">
                <h3 className="form-section-title">Review Your Order</h3>

                <div className="review-section">
                  <div className="review-row">
                    <div>
                      <h4>Shipping to</h4>
                      <p>{shipping.fullName}</p>
                      <p>{shipping.street}, {shipping.city}, {shipping.state} {shipping.zipCode}</p>
                    </div>
                    <button onClick={() => setStep(0)} className="btn btn-ghost btn-sm">Edit</button>
                  </div>
                  <div className="review-row">
                    <div>
                      <h4>Payment</h4>
                      <p>{payment.method === "card" ? `Card ending in ${payment.cardNumber.slice(-4)}` : payment.method}</p>
                    </div>
                    <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm">Edit</button>
                  </div>
                </div>

                <div className="order-items-review">
                  {cart.items.map(item => (
                    <div key={item._id} className="review-item">
                      <img src={item.product?.images?.[0] || "https://via.placeholder.com/60"} alt={item.product?.name} />
                      <span className="review-item-name">{item.product?.name}</span>
                      <span className="review-item-qty">×{item.quantity}</span>
                      <span className="review-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">← Back</button>
                  <button onClick={handlePlaceOrder} disabled={placing} className="btn btn-primary btn-lg">
                    {placing ? <><span className="spinner spinner-sm"></span> Placing Order...</> : `Place Order · $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h3 className="summary-title">Summary</h3>
            {cart.items.map(item => (
              <div key={item._id} className="summary-item">
                <img src={item.product?.images?.[0] || "https://via.placeholder.com/50"} alt={item.product?.name} />
                <div className="summary-item-info">
                  <span className="summary-item-name">{item.product?.name}</span>
                  <span className="summary-item-qty">Qty: {item.quantity}</span>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr className="divider" />
            <div className="summary-lines">
              <div className="summary-line"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
              <div className="summary-line"><span>Shipping</span><span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span></div>
              <div className="summary-line"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
            </div>
            <hr className="divider" />
            <div className="summary-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
