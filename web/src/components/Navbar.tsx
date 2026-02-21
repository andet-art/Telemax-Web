import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { user, logout } = useAuth();

  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const currentLang = lang === "de" ? "de" : "en";

  const toggleLanguage = () => {
    const newLang = currentLang === "de" ? "en" : "de";
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);
  };

  const [open, setOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShrink(currentScroll > 20);
      setShowNavbar(currentScroll < lastScrollY || currentScroll < 10);
      setLastScrollY(currentScroll);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/signin");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const go = (to: string) => {
    scrollToTop();
    setOpen(false);
    navigate(to);
  };

  const links = [
    { to: "/home", label: t("home") },
    { to: "/about", label: t("about") },
    { to: "/orders", label: t("orders") },
    { to: "/contact", label: t("contact") },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Cormorant+Garamond:wght@300;400;500&display=swap');

        .navbar-root {
          font-family: 'Cormorant Garamond', serif;
        }

        .navbar-bg {
          background: linear-gradient(
            to bottom,
            rgba(15, 9, 4, 0.97) 0%,
            rgba(22, 13, 6, 0.95) 100%
          );
          border-bottom: 1px solid rgba(180, 120, 60, 0.18);
          box-shadow: 0 2px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(180,120,60,0.08) inset;
        }

        .brand-logo {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #e8c98a;
          font-size: 1.35rem;
          text-shadow: 0 1px 8px rgba(180,120,40,0.25);
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .brand-logo:hover {
          color: #f5dfa5;
        }

        .brand-pipe-icon {
          width: 20px;
          height: 20px;
          opacity: 0.85;
        }

        .nav-link {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a8917a;
          transition: color 0.25s ease;
          position: relative;
          padding-bottom: 2px;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, #c8922a, #e8c98a);
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: #e8c98a;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .nav-link.active {
          color: #e8c98a;
        }

        .ornament {
          color: rgba(180,120,60,0.35);
          font-size: 0.7rem;
          letter-spacing: 0.3em;
        }

        .lang-btn {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.8rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7a6550;
          border: 1px solid rgba(180,120,60,0.2);
          padding: 4px 10px;
          border-radius: 2px;
          transition: all 0.25s ease;
          background: transparent;
          cursor: pointer;
        }

        .lang-btn:hover {
          color: #e8c98a;
          border-color: rgba(200,146,42,0.5);
          background: rgba(180,120,60,0.07);
        }

        .btn-outline-warm {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          border: 1px solid rgba(180,120,60,0.3);
          background: transparent;
          color: #a8917a;
          padding: 6px 16px;
          border-radius: 2px;
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .btn-outline-warm:hover {
          border-color: rgba(200,146,42,0.6);
          color: #e8c98a;
          background: rgba(180,120,60,0.08);
        }

        .btn-gold {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, #8b5e1a 0%, #c8922a 50%, #a0711f 100%);
          color: #f5e6c8;
          padding: 6px 18px;
          border-radius: 2px;
          border: 1px solid rgba(200,146,42,0.4);
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(180,120,40,0.2);
        }

        .btn-gold:hover {
          background: linear-gradient(135deg, #a0711f 0%, #d9a030 50%, #b07820 100%);
          box-shadow: 0 4px 20px rgba(200,146,42,0.35);
          transform: translateY(-1px);
        }

        .mobile-menu-bg {
          background: linear-gradient(
            to bottom,
            rgba(12, 7, 3, 0.99),
            rgba(18, 10, 4, 0.99)
          );
          border-top: 1px solid rgba(180,120,60,0.12);
        }

        .mobile-link {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #7a6550;
          border-bottom: 1px solid rgba(180,120,60,0.08);
          padding: 14px 0;
          display: block;
          transition: color 0.25s;
        }

        .mobile-link.active,
        .mobile-link:hover {
          color: #e8c98a;
        }

        .decorative-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,146,42,0.4), transparent);
          margin: 12px 0;
        }

        .hamburger-btn {
          color: #7a6550;
          transition: color 0.25s;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .hamburger-btn:hover {
          color: #e8c98a;
        }
      `}</style>

      <motion.nav
        className="navbar-root navbar-bg fixed top-0 left-0 right-0 z-50"
        animate={{
          y: showNavbar ? 0 : -100,
          height: shrink ? 56 : 68,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/home"
            className="brand-logo"
            onClick={scrollToTop}
          >
            {/* Pipe SVG icon inline */}
            <svg className="brand-pipe-icon" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 18 C2 18, 8 18, 12 14 C16 10, 18 6, 24 6 L34 6" stroke="#c8922a" strokeWidth="2.5" strokeLinecap="round"/>
              <rect x="30" y="3" width="8" height="10" rx="2" stroke="#c8922a" strokeWidth="1.8" fill="none"/>
              <path d="M1 18 L5 18" stroke="#c8922a" strokeWidth="3" strokeLinecap="round"/>
              <path d="M32 1 Q35 0 36 3" stroke="#c8922a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
            </svg>
            Pfeifenhaus
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <span className="ornament">✦</span>
            {links.map((link) => (
              <button
                key={link.to}
                onClick={() => go(link.to)}
                className={`nav-link ${location.pathname === link.to ? "active" : ""}`}
              >
                {link.label}
              </button>
            ))}
            <span className="ornament">✦</span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button className="lang-btn" onClick={toggleLanguage}>
              {currentLang === "de" ? "EN" : "DE"}
            </button>

            {user ? (
              <>
                <button className="btn-outline-warm" onClick={() => go("/profile")}>
                  {t("profile")}
                </button>
                <button className="btn-gold" onClick={handleLogout}>
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <button className="btn-outline-warm" onClick={() => go("/signin")}>
                  {t("signin")}
                </button>
                <button className="btn-gold" onClick={() => go("/signup")}>
                  {t("join")}
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="hamburger-btn md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="mobile-menu-bg md:hidden px-6 pb-6"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="decorative-rule" />

              {links.map((link) => (
                <button
                  key={link.to}
                  onClick={() => go(link.to)}
                  className={`mobile-link w-full text-left ${location.pathname === link.to ? "active" : ""}`}
                >
                  {link.label}
                </button>
              ))}

              <div className="decorative-rule" />

              <div className="flex items-center gap-3 pt-3 flex-wrap">
                <button className="lang-btn" onClick={toggleLanguage}>
                  {currentLang === "de" ? "EN" : "DE"}
                </button>

                {user ? (
                  <>
                    <button className="btn-outline-warm" onClick={() => go("/profile")}>
                      {t("profile")}
                    </button>
                    <button className="btn-gold" onClick={handleLogout}>
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-outline-warm" onClick={() => go("/signin")}>
                      {t("signin")}
                    </button>
                    <button className="btn-gold" onClick={() => go("/signup")}>
                      {t("join")}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;