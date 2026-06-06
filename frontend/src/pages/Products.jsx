import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/common/ProductCard";
import "./Products.css";

const CATEGORIES = ["all","Electronics","Fashion","Home & Garden","Sports","Accessories","Books","Beauty","Toys","Other"];
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "price-low",  label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating",     label: "Best Rated" },
  { value: "popular",    label: "Most Popular" },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const keyword  = params.get("keyword")  || "";
  const category = params.get("category") || "all";
  const sort     = params.get("sort")     || "newest";
  const page     = parseInt(params.get("page") || "1");
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const featured = params.get("featured") || "";

  const setParam = (key, value) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value); else p.delete(key);
    if (key !== "page") p.delete("page");
    setParams(p);
  };

  // ── FIX: abort previous request when params change ──
  const fetchProducts = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ page, limit: 12, sort });
      if (keyword)              q.set("keyword",  keyword);
      if (category !== "all")   q.set("category", category);
      if (minPrice)             q.set("minPrice", minPrice);
      if (maxPrice)             q.set("maxPrice", maxPrice);
      if (featured)             q.set("featured", featured);

      const { data } = await api.get(`/products?${q}`, { signal });
      setProducts(data.products || []);
      setTotal(data.total   || 0);
      setPages(data.pages   || 1);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      setError(err.response?.data?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, page, minPrice, maxPrice, featured]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  const clearFilters = () => { setParams({}); setSidebarOpen(false); };

  return (
    <div className="page products-page">
      <div className="container">
        <div className="products-header">
          <div>
            <h1 className="section-title">
              {keyword   ? `Results for "${keyword}"` :
               featured  ? "Featured Products"        :
               category !== "all" ? category          : "All Products"}
            </h1>
            <p className="section-subtitle">{total} products found</p>
          </div>
          <div className="header-controls">
            <select className="form-input form-select sort-select" value={sort} onChange={e => setParam("sort", e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ⊟ Filters
            </button>
          </div>
        </div>

        <div className={`products-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
          {/* Sidebar */}
          <aside className={`filters-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="btn btn-ghost btn-sm">Clear All</button>
            </div>
            <div className="filter-section">
              <h4 className="filter-label">Category</h4>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setParam("category", cat === "all" ? "" : cat)}
                  className={`filter-option ${(!category || category === "all") && cat === "all" ? "active" : category === cat ? "active" : ""}`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
            <div className="filter-section">
              <h4 className="filter-label">Price Range</h4>
              <div className="price-inputs">
                <input type="number" placeholder="Min $" value={minPrice} onChange={e => setParam("minPrice", e.target.value)} className="form-input price-input" min="0" />
                <span className="price-sep">—</span>
                <input type="number" placeholder="Max $" value={maxPrice} onChange={e => setParam("maxPrice", e.target.value)} className="form-input price-input" min="0" />
              </div>
            </div>
            <div className="filter-section">
              <h4 className="filter-label">Type</h4>
              <button onClick={() => setParam("featured", featured ? "" : "true")} className={`filter-option ${featured ? "active" : ""}`}>
                ✦ Featured Only
              </button>
            </div>
          </aside>

          {/* Products */}
          <div className="products-main">
            {loading && (
              <div className="loading-center"><div className="spinner"></div></div>
            )}

            {!loading && error && (
              <div className="no-results">
                <div className="no-results-icon">⚠</div>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button onClick={() => fetchProducts(new AbortController().signal)} className="btn btn-primary">
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">◎</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <div className="product-grid">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button disabled={page <= 1} onClick={() => setParam("page", page - 1)} className="btn btn-secondary btn-sm">← Prev</button>
                    <div className="page-nums">
                      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setParam("page", p)} className={`page-num ${p === page ? "active" : ""}`}>{p}</button>
                      ))}
                    </div>
                    <button disabled={page >= pages} onClick={() => setParam("page", page + 1)} className="btn btn-secondary btn-sm">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
