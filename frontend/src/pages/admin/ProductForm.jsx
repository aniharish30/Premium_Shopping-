import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import { showToast } from "../../components/common/Toast";
import "./Admin.css";

const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Sports", "Accessories", "Books", "Beauty", "Toys", "Other"];

const emptyForm = {
  name: "", description: "", price: "", originalPrice: "", category: "Electronics",
  brand: "", stock: "", images: "", featured: false, tags: "",
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name, description: p.description, price: p.price,
          originalPrice: p.originalPrice || "", category: p.category,
          brand: p.brand || "", stock: p.stock, images: p.images?.join(",") || "",
          featured: p.featured || false, tags: p.tags?.join(",") || "",
        });
        if (p.images?.[0]) setImagePreview(p.images[0]);
      });
    }
  }, [id]);

  const set = (key, val) => setForm(f => ({...f, [key]: val}));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setImagePreview(data.imageUrl);
      const existing = form.images ? form.images.split(",").map(s => s.trim()).filter(Boolean) : [];
      set("images", [data.imageUrl, ...existing].join(", "));
      showToast("Image uploaded!", "success");
    } catch { showToast("Upload failed", "error"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || 0,
      stock: Number(form.stock),
      images: form.images.split(",").map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        showToast("Product updated!", "success");
      } else {
        await api.post("/products", payload);
        showToast("Product created!", "success");
      }
      navigate("/admin/products");
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const inp = (label, key, type = "text", placeholder = "", required = false) => (
    <div className="form-group">
      <label className="form-label">{label}{required && " *"}</label>
      <input className="form-input" type={type} required={required} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="page admin-page">
      <div className="container" style={{maxWidth: 860}}>
        <div style={{display:"flex", alignItems:"center", gap: 12, marginBottom: 32}}>
          <Link to="/admin/products" className="btn btn-ghost btn-sm">← Back</Link>
          <h1 className="section-title" style={{margin:0}}>{isEdit ? "Edit Product" : "New Product"}</h1>
        </div>

        <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap: 24}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 24}}>
            {/* Left Column */}
            <div style={{display:"flex", flexDirection:"column", gap: 20}}>
              <div style={{background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding: 24}}>
                <h3 style={{fontSize:15, fontWeight:700, marginBottom: 20}}>Basic Info</h3>
                <div style={{display:"flex", flexDirection:"column", gap: 16}}>
                  {inp("Product Name", "name", "text", "e.g. Premium Wireless Headphones", true)}
                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea className="form-input" rows={5} required value={form.description} onChange={e => set("description", e.target.value)} placeholder="Detailed product description..." style={{resize:"vertical"}} />
                  </div>
                  {inp("Brand", "brand", "text", "e.g. Sony")}
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-input form-select" required value={form.category} onChange={e => set("category", e.target.value)}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {inp("Tags (comma separated)", "tags", "text", "wireless, bluetooth, audio")}
                  <div className="form-group">
                    <label className="form-label" style={{display:"flex", alignItems:"center", gap: 10, cursor:"pointer"}}>
                      <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} style={{width:16, height:16}} />
                      Mark as Featured Product
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{display:"flex", flexDirection:"column", gap: 20}}>
              <div style={{background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding: 24}}>
                <h3 style={{fontSize:15, fontWeight:700, marginBottom: 20}}>Pricing & Stock</h3>
                <div style={{display:"flex", flexDirection:"column", gap: 16}}>
                  {inp("Price ($) *", "price", "number", "0.00", true)}
                  {inp("Original Price ($) — for discount display", "originalPrice", "number", "0.00")}
                  {inp("Stock Quantity *", "stock", "number", "0", true)}
                </div>
              </div>

              <div style={{background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding: 24}}>
                <h3 style={{fontSize:15, fontWeight:700, marginBottom: 20}}>Images</h3>
                {imagePreview && (
                  <div style={{marginBottom: 16, borderRadius: 10, overflow:"hidden", border:"1px solid var(--border)", aspectRatio:"16/9", background:"var(--bg-3)"}}>
                    <img src={imagePreview} alt="Preview" style={{width:"100%", height:"100%", objectFit:"cover"}} />
                  </div>
                )}
                <div style={{marginBottom: 16}}>
                  <label className="form-label">Upload Image</label>
                  <label style={{display:"block", border:"2px dashed var(--border)", borderRadius:8, padding:20, textAlign:"center", cursor:"pointer", transition:"var(--transition)"}} className="upload-zone">
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:"none"}} />
                    <div style={{fontSize:24, marginBottom:8}}>📁</div>
                    <div style={{fontSize:13, color:"var(--text-muted)"}}>
                      {uploading ? "Uploading..." : "Click to upload (max 5MB)"}
                    </div>
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Or paste Image URLs (comma separated)</label>
                  <textarea className="form-input" rows={3} value={form.images} onChange={e => set("images", e.target.value)} placeholder="https://example.com/image1.jpg, https://..." style={{resize:"vertical", fontSize:12}} />
                </div>
              </div>
            </div>
          </div>

          <div style={{display:"flex", gap: 12, justifyContent:"flex-end"}}>
            <Link to="/admin/products" className="btn btn-secondary btn-lg">Cancel</Link>
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
              {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
