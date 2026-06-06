import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { showToast } from "../components/common/Toast";
import "./Cart.css";

export default function Cart() {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const shipping = cartTotal > 100 ? 0 : 9.99;
  const tax = cartTotal * 0.1;
  const total = cartTotal + shipping + tax;

  const handleRemove = async (itemId, name) => {
    await removeFromCart(itemId);
    showToast(`${name} removed from cart`, "info");
  };

  if (!cart.items?.length) {
    return (
      <div className="page cart-page">
        <div className="container">
          <h1 className="section-title">Shopping Cart</h1>
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <div className="container">
        <div className="cart-header">
          <h1 className="section-title">Shopping Cart</h1>
          <span className="cart-count">{cart.items.length} item{cart.items.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item._id} className="cart-item fade-in">
                <Link to={`/products/${item.product?._id}`} className="item-img-wrap">
                  <img
                    src={item.product?.images?.[0] || "https://via.placeholder.com/100?text=?"}
                    alt={item.product?.name || item.name}
                  />
                </Link>
                <div className="item-details">
                  <Link to={`/products/${item.product?._id}`} className="item-name">
                    {item.product?.name || "Product"}
                  </Link>
                  <div className="item-price-unit">${item.price?.toFixed(2)} each</div>
                  {item.product?.stock === 0 && (
                    <span className="badge badge-danger">Out of Stock</span>
                  )}
                </div>
                <div className="item-qty">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="qty-btn" disabled={item.quantity <= 1}
                  >−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="qty-btn" disabled={item.quantity >= (item.product?.stock || 99)}
                  >+</button>
                </div>
                <div className="item-subtotal">${(item.price * item.quantity).toFixed(2)}</div>
                <button onClick={() => handleRemove(item._id, item.product?.name)} className="item-remove" title="Remove">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                  </svg>
                </button>
              </div>
            ))}

            <div className="cart-actions">
              <Link to="/products" className="btn btn-ghost btn-sm">← Continue Shopping</Link>
              <button onClick={() => { clearCart(); showToast("Cart cleared", "info"); }} className="btn btn-danger btn-sm">
                Clear Cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="free-ship">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-line">
                <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
              </div>
            </div>
            {cartTotal < 100 && (
              <div className="free-shipping-hint">
                Add ${(100 - cartTotal).toFixed(2)} more for free shipping!
              </div>
            )}
            <hr className="divider" />
            <div className="summary-total">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <button onClick={() => navigate("/checkout")} className="btn btn-primary btn-block btn-lg" style={{marginTop: 20}}>
              Proceed to Checkout →
            </button>
            <div className="secure-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Secure SSL Encrypted Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
