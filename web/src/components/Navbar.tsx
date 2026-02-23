import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const go = (to: string) => {
    setOpen(false);
    setIsProfileOpen(false);
    scrollToTop();
    navigate(to);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    setIsProfileOpen(false);
    navigate("/signin");
  };

  const links = [
    { to: "/home", label: t("navbar.links.home") },
    { to: "/about", label: t("navbar.links.about") },
    { to: "/orders", label: t("navbar.links.orders") },
    { to: "/contact", label: t("navbar.links.contact") },
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

        .brand-logo:hover { color: #f5dfa5; }

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

        .nav-link:hover { color: #e8c98a; }
        .nav-link:hover::after,
        .nav-link.active::after { width: 100%; }
        .nav-link.active { color: #e8c98a; }

        .lang-btn {
          font-size: 0.8rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7a6550;
          border: 1px solid rgba(180,120,60,0.2);
          padding: 4px 10px;
          border-radius: 2px;
          background: transparent;
          cursor: pointer;
        }

        .mobile-menu-bg {
          background: linear-gradient(
            to bottom,
            rgba(12, 7, 3, 0.99),
            rgba(18, 10, 4, 0.99)
          );
          border-top: 1px solid rgba(180,120,60,0.12);
        }
      `}</style>

      <motion.nav
        className="navbar-root navbar-bg fixed top-0 left-0 right-0 z-50"
        animate={{ y: showNavbar ? 0 : -100, height: shrink ? 56 : 68 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/home" className="brand-logo" onClick={scrollToTop}>
            Pfeifenhaus
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <button
                key={link.to}
                onClick={() => go(link.to)}
                className={`nav-link ${location.pathname === link.to ? "active" : ""}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="lang-btn" onClick={toggleLanguage}>
              {currentLang === "de" ? "EN" : "DE"}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="px-3 py-2 border border-stone-700 bg-stone-900 rounded-lg text-stone-300 hover:border-amber-500"
                >
                  Account
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-56 bg-stone-950 border border-stone-800 rounded-xl shadow-2xl"
                    >
                      <div className="py-2">
                        <button
                          onClick={() => go("/profile/overview")}
                          className="block w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-800"
                        >
                          {t("navbar.profile.overview", { defaultValue: "Overview" })}
                        </button>

                        <button
                          onClick={() => go("/profile/settings")}
                          className="block w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-800"
                        >
                          {t("navbar.profile.settings", { defaultValue: "Settings" })}
                        </button>
                      </div>

                      <div className="border-t border-stone-800">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          {t("navbar.actions.logout", { defaultValue: "Logout" })}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button variant="outline" onClick={() => go("/signin")}>
                  {t("navbar.actions.signin", { defaultValue: "Sign in" })}
                </Button>
                <Button onClick={() => go("/signup")}>
                  {t("navbar.actions.join", { defaultValue: "Join" })}
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setOpen((v) => !v)} className="text-white">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;