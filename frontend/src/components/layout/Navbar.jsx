import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import "./Navbar.css";

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">ShopVerse</span>
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <div className="nav-links">
          <Link to="/products" className="nav-link">Shop</Link>
          {isAdmin && <Link to="/admin" className="nav-link nav-admin">Dashboard</Link>}
        </div>

        <div className="nav-actions">
          {isAuthenticated && (
            <>
              <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
              </Link>
              <Link to="/cart" className="nav-icon-btn" title="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-btn">
                <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user?.name?.split(" ")[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Profile
                </Link>
                <Link to="/orders" className="dropdown-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
                  My Orders
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="dropdown-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                    Admin Panel
                  </Link>
                )}
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item danger">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={menuOpen ? "open" : ""}></span>
            <span className={menuOpen ? "open" : ""}></span>
            <span className={menuOpen ? "open" : ""}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <form className="mobile-search" onSubmit={handleSearch}>
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <Link to="/products" className="mobile-link">Shop</Link>
        {isAuthenticated ? (
          <>
            <Link to="/cart" className="mobile-link">Cart {cartCount > 0 && `(${cartCount})`}</Link>
            <Link to="/wishlist" className="mobile-link">Wishlist</Link>
            <Link to="/orders" className="mobile-link">My Orders</Link>
            <Link to="/profile" className="mobile-link">Profile</Link>
            {isAdmin && <Link to="/admin" className="mobile-link">Admin</Link>}
            <button onClick={handleLogout} className="mobile-link danger">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-link">Login</Link>
            <Link to="/register" className="mobile-link">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
