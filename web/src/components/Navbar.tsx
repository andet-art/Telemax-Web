import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === "de" ? "en" : "de";
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);
  };

  const { user, logout } = useAuth();

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

    window.addEventListener("scroll", handleScroll);
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

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const scrollToTopAndNavigate = (to: string) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-stone-950/80 border-b border-[#2d221a] shadow-sm transition-all duration-300 ${
        showNavbar ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      } ${shrink ? "py-2" : "py-4"}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/" className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0 })}>
            <img src="/logo.svg" alt="Logo" className="h-7 w-7" />
            <span className="text-xl font-bold text-white">Telemax</span>
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <motion.div
              key={link.to}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                to={link.to}
                onClick={() => scrollToTopAndNavigate(link.to)}
                className={`text-sm font-medium transition ${
                  location.pathname === link.to
                    ? "text-white border-b-2 border-amber-500 pb-1"
                    : "text-stone-400 hover:text-white hover:border-b hover:border-amber-500 pb-1"
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <motion.div
          className="hidden md:flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={toggleLanguage}
            className="px-3 text-white hover:text-amber-400 transition"
          >
            {currentLang === "de" ? "EN" : "DE"}
          </Button>

          {user ? (
            <>
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-stone-700 hover:border-amber-500/60 bg-stone-900/50 hover:bg-stone-800/60 transition-all duration-200 group"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-stone-300 group-hover:text-white transition-colors">
                    {user.first_name}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300 transition-all duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-56 bg-stone-950 border border-stone-800/80 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3.5 border-b border-stone-800/80">
                        <p className="text-sm font-semibold text-white tracking-tight">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1.5">
                        {[
                          { label: "Overview", sub: "", path: "/profile/overview" },
                          { label: "Addresses", sub: "", path: "/profile/addresses" },
                          { label: "Settings", sub: "", path: "/profile/settings" },
                        ].map((item) => (
                          <button
                            key={item.path}
                            onClick={() => {
                              setIsProfileOpen(false);
                              scrollToTopAndNavigate(item.path);
                            }}
                            className="flex flex-col px-4 py-2.5 w-full text-left hover:bg-stone-800/40 transition-colors group"
                          >
                            <span className="text-sm font-medium text-stone-200 group-hover:text-white transition-colors">
                              {item.label}
                            </span>
                            <span className="text-xs text-stone-600 group-hover:text-stone-400 transition-colors mt-0.5">
                              {item.sub}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-stone-800/80 py-1.5">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 w-full text-left hover:bg-red-500/8 transition-colors group"
                        >
                          <span className="text-sm font-medium text-stone-400 group-hover:text-red-400 transition-colors">
                            {t("logout")}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" className="hover:border-amber-500">
                  {t("signin")}
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="default" className="hover:bg-amber-700">
                  {t("join")}
                </Button>
              </Link>
            </>
          )}
        </motion.div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          {open ? (
            <X className="text-white h-6 w-6" onClick={() => setOpen(false)} />
          ) : (
            <Menu className="text-white h-6 w-6" onClick={() => setOpen(true)} />
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden px-6 pt-2 pb-4 bg-stone-950/90 rounded-b-xl shadow-md border-t border-[#3a2c22]"
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => scrollToTopAndNavigate(link.to)}
                className={`block py-2 text-sm border-b ${
                  location.pathname === link.to
                    ? "text-white font-semibold"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="text-white hover:text-amber-400"
              >
                {currentLang === "de" ? "EN" : "DE"}
              </Button>

              {user ? (
                <>
                  <div className="space-y-2 border-t border-stone-800 pt-2">
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => scrollToTopAndNavigate("/profile/overview")}
                    >
                      Overview
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => scrollToTopAndNavigate("/profile/addresses")}
                    >
                      Addresses
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => scrollToTopAndNavigate("/profile/settings")}
                    >
                      Settings
                    </Button>
                  </div>
                  <Button
                    className="w-full"
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    {t("logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setOpen(false)}>
                    <Button className="w-full" variant="outline">
                      {t("signin")}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full" variant="default">
                      {t("join")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;