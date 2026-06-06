import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span style={{color: "var(--accent)"}}>◆</span> ShopVerse
            </Link>
            <p className="footer-tagline">Premium e-commerce experience. Curated products, seamless shopping.</p>
            <div className="footer-socials">
              {["Twitter", "Instagram", "GitHub"].map(s => (
                <a key={s} href="#" className="social-link">{s[0]}</a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=Electronics">Electronics</Link>
            <Link to="/products?category=Fashion">Fashion</Link>
            <Link to="/products?featured=true">Featured</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/wishlist">Wishlist</Link>
          </div>
          <div className="footer-col">
            <h4>Info</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopVerse. Built with the MERN Stack.</p>
          <p className="footer-tech">React · Node.js · MongoDB · Express</p>
        </div>
      </div>
    </footer>
  );
}
