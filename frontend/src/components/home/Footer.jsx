function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="container footer-grid">
        <a className="brand" href="#top" aria-label="PEN2PRO homepage">
          <span className="brand-mark" aria-hidden="true">P2P</span>
          <span className="brand-name">PEN2PRO</span>
        </a>

        <nav className="footer-links" aria-label="Footer links">
          <a href="#">Contact</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
          <a href="#">LinkedIn</a>
          <a href="#">X</a>
        </nav>

        <p className="copyright">Copyright {year} PEN2PRO. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
