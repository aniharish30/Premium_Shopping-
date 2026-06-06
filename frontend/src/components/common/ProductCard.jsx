import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "./Toast";
import "./ProductCard.css";

const StarRating = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={`star ${s <= Math.round(rating) ? "" : "empty"}`}>★</span>
    ))}
  </div>
);

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { showToast("Please login to add to cart", "info"); return; }
    const result = await addToCart(product._id);
    if (result.success) showToast(`${product.name} added to cart`, "success");
    else showToast(result.error, "error");
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { showToast("Please login to use wishlist", "info"); return; }
    const action = await toggleWishlist(product._id);
    showToast(action === "added" ? "Added to wishlist" : "Removed from wishlist", action === "added" ? "success" : "info");
  };

  const wishlisted = isAuthenticated && isWishlisted(product._id);

  return (
    <Link to={`/products/${product._id}`} className="product-card fade-in">
      <div className="product-img-wrap">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        {discount > 0 && <span className="product-discount">−{discount}%</span>}
        {product.stock === 0 && <span className="product-oos">Out of Stock</span>}
        <button onClick={handleWishlist} className={`wishlist-btn ${wishlisted ? "active" : ""}`} title="Wishlist">
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-meta">
          <StarRating rating={product.rating} />
          <span className="product-reviews">({product.numReviews})</span>
        </div>
        <div className="product-footer">
          <div className="product-price">
            <span className="price-current">${product.price.toFixed(2)}</span>
            {product.originalPrice > product.price && (
              <span className="price-original">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || loading}
            className="add-btn"
          >
            {product.stock === 0 ? "Sold Out" : "+"}
          </button>
        </div>
      </div>
    </Link>
  );
}
