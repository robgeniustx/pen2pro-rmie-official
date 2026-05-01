import { navLinks } from "./content";

function Header({ onPrimaryCta, onNavClick, activeNav }) {
  return (
    <header className="site-header" aria-label="Primary navigation">
      <div className="container nav-shell">
        <a className="brand" href="#top" aria-label="PEN2PRO homepage">
          <span className="brand-mark" aria-hidden="true">P2P</span>
          <span className="brand-name">PEN2PRO</span>
        </a>

        <nav className="nav-links" aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`nav-link${activeNav === link.href ? " nav-link-active" : ""}`}
              onClick={(event) => onNavClick(event, link)}
              aria-current={activeNav === link.href ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button type="button" className="btn btn-primary nav-cta" onClick={onPrimaryCta}>
          Start Your Roadmap
        </button>
      </div>
    </header>
  );
}

export default Header;
