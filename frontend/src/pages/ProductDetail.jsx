import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/common/Toast";
import "./ProductDetail.css";

const StarRating = ({ rating, size = 16 }) => (
  <div className="stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={`star ${s <= Math.round(rating) ? "" : "empty"}`} style={{fontSize: size}}>★</span>
    ))}
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { showToast("Please login to add to cart", "info"); return; }
    setAddingToCart(true);
    const result = await addToCart(product._id, quantity);
    if (result.success) showToast(`${product.name} added to cart!`, "success");
    else showToast(result.error, "error");
    setAddingToCart(false);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { showToast("Please login to use wishlist", "info"); return; }
    const action = await toggleWishlist(product._id);
    showToast(action === "added" ? "Added to wishlist!" : "Removed from wishlist", action === "added" ? "success" : "info");
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { showToast("Please login to review", "info"); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      showToast("Review submitted!", "success");
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Review failed", "error");
    } finally { setSubmittingReview(false); }
  };

  const discount = product?.originalPrice > product?.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  if (loading) return <div className="page loading-center"><div className="spinner"></div></div>;
  if (!product) return null;

  const wishlisted = isAuthenticated && isWishlisted(product._id);

  return (
    <div className="page product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span>
          <Link to="/products">Products</Link> <span>/</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link> <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="detail-grid">
          {/* Images */}
          <div className="detail-images">
            <div className="main-image">
              <img
                src={product.images?.[activeImg] || "https://via.placeholder.com/600x500?text=No+Image"}
                alt={product.name}
              />
              {discount > 0 && <span className="detail-discount badge badge-accent">−{discount}% OFF</span>}
            </div>
            {product.images?.length > 1 && (
              <div className="thumbnail-row">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`thumb ${i === activeImg ? "active" : ""}`}>
                    <img src={img} alt={`${product.name} ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-brand">{product.brand}</div>
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-rating">
              <StarRating rating={product.rating} size={18} />
              <span className="rating-num">{product.rating?.toFixed(1)}</span>
              <span className="rating-count">({product.numReviews} reviews)</span>
            </div>

            <div className="detail-price">
              <span className="detail-price-main">${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="detail-price-orig">${product.originalPrice.toFixed(2)}</span>
              )}
              {discount > 0 && <span className="badge badge-accent">Save {discount}%</span>}
            </div>

            <div className="detail-stock">
              {product.stock > 0 ? (
                <span className="badge badge-success">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="badge badge-danger">✕ Out of Stock</span>
              )}
            </div>

            <div className="detail-category">
              <span className="detail-meta-label">Category</span>
              <Link to={`/products?category=${product.category}`} className="detail-meta-val link">{product.category}</Link>
            </div>

            {product.tags?.length > 0 && (
              <div className="detail-tags">
                {product.tags.map(tag => (
                  <Link key={tag} to={`/products?keyword=${tag}`} className="tag-chip">#{tag}</Link>
                ))}
              </div>
            )}

            {/* Qty + Actions */}
            {product.stock > 0 && (
              <div className="detail-qty">
                <div className="qty-control">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn">−</button>
                  <span className="qty-num">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="qty-btn">+</button>
                </div>
                <span className="qty-label">Quantity</span>
              </div>
            )}

            <div className="detail-actions">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="btn btn-primary btn-lg"
              >
                {addingToCart ? <><span className="spinner spinner-sm"></span> Adding...</> : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button onClick={handleWishlist} className={`btn btn-secondary btn-lg wishlist-action ${wishlisted ? "wishlisted" : ""}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            </div>

            <div className="detail-perks">
              <div className="perk"><span>🚚</span><span>Free shipping over $100</span></div>
              <div className="perk"><span>↩</span><span>30-day returns</span></div>
              <div className="perk"><span>🔒</span><span>Secure checkout</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <div className="tab-nav">
            {["description", "reviews"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? "active" : ""}`}>
                {tab === "description" ? "Description" : `Reviews (${product.numReviews})`}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="tab-content fade-in">
              <p className="detail-description">{product.description}</p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="tab-content fade-in">
              {product.reviews?.length > 0 ? (
                <div className="reviews-list">
                  {product.reviews.map(r => (
                    <div key={r._id} className="review-card">
                      <div className="review-header">
                        <div className="review-avatar">{r.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div className="review-name">{r.name}</div>
                          <div className="review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                        <StarRating rating={r.rating} size={14} />
                      </div>
                      <p className="review-comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
              )}

              {isAuthenticated && (
                <form onSubmit={handleReview} className="review-form">
                  <h4>Write a Review</h4>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <div className="rating-picker">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))}
                          className={`rating-star ${s <= reviewForm.rating ? "active" : ""}`}>★</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea
                      className="form-input" rows={4} required
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
                      placeholder="Share your experience with this product..."
                    />
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn btn-primary">
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
