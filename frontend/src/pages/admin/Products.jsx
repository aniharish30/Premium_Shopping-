import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { showToast } from "../../components/common/Toast";
import "./Admin.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15 });
      if (search) q.set("keyword", search);
      const { data } = await api.get(`/products?${q}`);
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      showToast(`"${name}" deleted`, "success");
      fetchProducts();
    } catch { showToast("Delete failed", "error"); }
    finally { setDeleting(null); }
  };

  return (
    <div className="page admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="section-title">Products</h1>
            <p className="section-subtitle">{total} products total</p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary">+ New Product</Link>
        </div>

        <div className="admin-controls">
          <div className="admin-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="form-input admin-search" placeholder="Search products..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{textAlign:"center", padding: 40}}><div className="spinner" style={{margin:"0 auto"}}></div></td></tr>
              ) : products.map(p => (
                <tr key={p._id}>
                  <td>
                    <img src={p.images?.[0] || "https://via.placeholder.com/48"} alt={p.name} className="product-img-cell" />
                  </td>
                  <td>
                    <div style={{fontWeight: 500, color: "var(--text)", maxWidth: 220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{p.name}</div>
                    <div style={{fontSize: 11, color:"var(--text-faint)"}}>{p.brand}</div>
                  </td>
                  <td><span className="badge badge-info">{p.category}</span></td>
                  <td>
                    <strong style={{color:"var(--text)"}}>${p.price.toFixed(2)}</strong>
                    {p.originalPrice > p.price && <div style={{fontSize:11, color:"var(--text-faint)", textDecoration:"line-through"}}>${p.originalPrice.toFixed(2)}</div>}
                  </td>
                  <td>
                    <span className={p.stock === 0 ? "badge badge-danger" : p.stock < 10 ? "badge badge-warning" : "badge badge-success"}>
                      {p.stock}
                    </span>
                  </td>
                  <td>{p.rating?.toFixed(1)} ★</td>
                  <td>
                    {p.featured ? <span className="badge badge-accent">✦ Yes</span> : <span style={{color:"var(--text-faint)"}}>—</span>}
                  </td>
                  <td>
                    <div style={{display:"flex", gap: 6}}>
                      <Link to={`/admin/products/${p._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={deleting === p._id}
                        className="btn btn-danger btn-sm"
                      >{deleting === p._id ? "..." : "Del"}</button>
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
