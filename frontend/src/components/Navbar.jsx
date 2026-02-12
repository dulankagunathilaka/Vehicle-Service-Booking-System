import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ transparent = false }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  const useTransparent = transparent && isHome;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      if (isHome) {
        const ids = ["services", "features"];
        let found = "";
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el) {
            const r = el.getBoundingClientRect();
            if (r.top <= 100 && r.bottom > 100) found = id;
          }
        }
        setActiveSection(found);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowUserMenu(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const smoothScroll = useCallback(
    (id) => {
      setMobileOpen(false);
      if (isHome) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/#" + id);
      }
    },
    [isHome, navigate],
  );

  const goTo = useCallback(
    (path) => {
      setShowUserMenu(false);
      setMobileOpen(false);
      navigate(path);
    },
    [navigate],
  );

  const handleLogout = useCallback(() => {
    setShowUserMenu(false);
    setMobileOpen(false);
    logout();
    navigate("/");
  }, [logout, navigate]);

  const navLinks = [
    { label: "Services", id: "services" },
    { label: "Features", id: "features" },
    { label: "About", href: "/learn-more" },
  ];

  const solid = !useTransparent || scrolled;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid
            ? "bg-white/90 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-200/60"
            : "bg-transparent"
        }`}
      >

        <div
          className={`h-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 transition-opacity duration-500 ${
            solid ? "opacity-100" : "opacity-0"
          }`}
        />

        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-[68px]">

          <button
            onClick={() => goTo("/")}
            className="flex items-center group shrink-0"
          >
            <h1
              className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${
                solid ? "text-gray-900" : "text-white"
              }`}
            >
              Auto
              <span
                className={`transition-colors duration-300 ${solid ? "text-blue-600" : "text-blue-400"}`}
              >
                Serve
              </span>
            </h1>
          </button>

          <div className="hidden md:flex items-center">
            <div
              className={`flex items-center gap-0.5 p-1 rounded-full transition-all duration-300 ${
                solid ? "bg-gray-100/70" : "bg-white/[0.07] backdrop-blur-sm"
              }`}
            >
              {navLinks.map((link) => {
                const isActive =
                  (link.id && isHome && activeSection === link.id) ||
                  (link.href && location.pathname === link.href);
                return (
                  <button
                    key={link.label}
                    onClick={() =>
                      link.id ? smoothScroll(link.id) : goTo(link.href)
                    }
                    className={`relative px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-300 ${
                      isActive
                        ? solid
                          ? "bg-white text-blue-700 shadow-sm"
                          : "bg-white/20 text-white"
                        : solid
                          ? "text-gray-500 hover:text-gray-900 hover:bg-white/60"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full transition-all duration-300 ${
                    solid ? "hover:bg-gray-100" : "hover:bg-white/10"
                  } ${
                    showUserMenu ? (solid ? "bg-gray-100" : "bg-white/10") : ""
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow ring-2 ring-white/40">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span
                    className={`text-[13px] font-semibold hidden sm:block transition-colors duration-300 ${
                      solid ? "text-gray-700" : "text-white"
                    }`}
                  >
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-all duration-300 ${
                      solid ? "text-gray-400" : "text-gray-300"
                    } ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-black/8 border border-gray-200/80 overflow-hidden transition-all duration-200 origin-top-right ${
                    showUserMenu
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >

                  <div className="px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/30">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-blue-200 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <button
                      onClick={() => goTo(isAdmin ? "/admin" : "/dashboard")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-500" />
                      {isAdmin ? "Admin Panel" : "My Dashboard"}
                    </button>
                    {!isAdmin && (
                      <>
                        <button
                          onClick={() => goTo("/booking")}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition"
                        >
                          <CalendarCheck className="w-4 h-4 text-violet-500" />
                          Book a Service
                        </button>
                        <button
                          onClick={() => goTo("/payments")}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition"
                        >
                          <CreditCard className="w-4 h-4 text-emerald-500" />
                          Payments
                        </button>
                      </>
                    )}
                  </div>
                  <div className="border-t border-gray-100 p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
                {showUserMenu && (
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setShowUserMenu(false)}
                  />
                )}
              </div>
            ) : (

              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => goTo("/signin")}
                  className={`px-4 py-2 text-[13px] font-semibold rounded-full transition-all duration-300 ${
                    solid
                      ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      : "text-gray-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => goTo("/signup")}
                  className={`px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-300 hover:-translate-y-[1px] ${
                    solid
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
                      : "bg-white/95 text-gray-900 shadow-md shadow-black/5 hover:bg-white"
                  }`}
                >
                  Get Started
                </button>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${
                solid
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>

        <div
          className={`md:hidden fixed inset-x-0 top-[calc(4rem+2px)] bottom-0 z-40 transition-all duration-300 ${
            mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`relative mx-3 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden transition-all duration-300 ${
              mobileOpen ? "translate-y-0" : "-translate-y-3"
            }`}
          >
            <div className="p-2 space-y-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() =>
                    link.id ? smoothScroll(link.id) : goTo(link.href)
                  }
                  className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition ${
                    (link.id && isHome && activeSection === link.id) ||
                    (link.href && location.pathname === link.href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 p-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => goTo(isAdmin ? "/admin" : "/dashboard")}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />{" "}
                    {isAdmin ? "Admin Panel" : "Dashboard"}
                  </button>
                  {!isAdmin && (
                    <button
                      onClick={() => goTo("/payments")}
                      className="w-full py-2.5 text-emerald-600 text-sm font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-50 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" /> Payments
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => goTo("/signin")}
                    className="w-full py-2.5 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => goTo("/signup")}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {!useTransparent && <div className="h-16 lg:h-[70px]" />}
    </>
  );
}
