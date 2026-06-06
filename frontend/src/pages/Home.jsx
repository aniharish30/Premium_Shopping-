import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/common/ProductCard";
import "./Home.css";

const categories = [
  { name: "Electronics", icon: "⚡", color: "#5a9fd4" },
  { name: "Fashion", icon: "✦", color: "#c8a96e" },
  { name: "Home & Garden", icon: "⌂", color: "#5cb88a" },
  { name: "Sports", icon: "◎", color: "#e09450" },
  { name: "Accessories", icon: "◇", color: "#9b8fd4" },
  { name: "Beauty", icon: "✿", color: "#e05c8a" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  // ── BUG FIX #9: Track error state so infinite spinner can't happen ──
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/products?featured=true&limit=8");
        if (!cancelled) {
          setFeatured(data.products || []);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err.response?.data?.message || "Failed to load products";
          setError(msg);
          setFeatured([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFeatured();
    return () => { cancelled = true; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge badge badge-accent">✦ New Collection 2025</div>
          <h1 className="hero-title">
            Discover <span className="gradient-text">Premium</span><br />
            Products You'll Love
          </h1>
          <p className="hero-subtitle">
            Curated selection of the finest products. Quality guaranteed, delivered to your door.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-wrap">
              <svg className="search-icon-hero" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text" placeholder="Search for anything..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="hero-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Search</button>
          </form>
          <div className="hero-cta-links">
            <Link to="/products" className="btn btn-secondary btn-lg">Browse All Products</Link>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">12k+</span><span className="stat-label">Products</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num">50k+</span><span className="stat-label">Happy Customers</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num">4.9★</span><span className="stat-label">Rating</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Find exactly what you're looking for</p>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link key={cat.name} to={`/products?category=${cat.name}`} className="category-card">
                <span className="cat-icon" style={{ color: cat.color }}>{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cat-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Hand-picked for exceptional quality</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-secondary">View All →</Link>
          </div>

          {loading && (
            <div className="loading-center">
              <div className="spinner"></div>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-error" style={{maxWidth: 480, margin: "0 auto"}}>
              <span>⚠</span>
              <span>{error}</span>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary btn-sm"
                style={{marginLeft: "auto"}}
              >Retry</button>
            </div>
          )}

          {!loading && !error && featured.length === 0 && (
            <div className="loading-center" style={{flexDirection:"column", gap:12}}>
              <p style={{color:"var(--text-muted)"}}>No featured products yet.</p>
              <Link to="/products" className="btn btn-primary btn-sm">Browse all products</Link>
            </div>
          )}

          {!loading && !error && featured.length > 0 && (
            <div className="product-grid">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Value Props */}
      <section className="values-section">
        <div className="container">
          <div className="values-grid">
            {[
              { icon: "🚚", title: "Free Shipping", desc: "On orders over $100" },
              { icon: "↩", title: "Easy Returns", desc: "30-day return policy" },
              { icon: "🔒", title: "Secure Payment", desc: "256-bit SSL encryption" },
              { icon: "💬", title: "24/7 Support", desc: "Always here to help" },
            ].map((v) => (
              <div key={v.title} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
