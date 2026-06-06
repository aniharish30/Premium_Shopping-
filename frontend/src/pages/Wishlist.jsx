import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { showToast } from "../components/common/Toast";
import ProductCard from "../components/common/ProductCard";

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const products = wishlist?.products || [];

  return (
    <div className="page" style={{paddingTop: 100}}>
      <div className="container">
        <h1 className="section-title">My Wishlist</h1>
        <p className="section-subtitle">{products.length} saved item{products.length !== 1 ? "s" : ""}</p>

        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">♡</div>
            <h3>Your wishlist is empty</h3>
            <p>Save products you love to revisit them later.</p>
            <Link to="/products" className="btn btn-primary">Discover Products</Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
