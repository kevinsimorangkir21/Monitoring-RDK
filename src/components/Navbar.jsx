"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  LogIn,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/about",
      label: "About",
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-white/80 backdrop-blur-2xl border-b border-red-100 shadow-sm"
        : "bg-white"
        }`}
    >
      <div className="max-w-7xl mx-auto h-20 px-5 sm:px-8 flex items-center justify-between">
        {/* Logo */}

        <Link
          href="/"
          className="group flex items-center"
        >
          <motion.img
            whileHover={{
              scale: 1.08,
              rotate: 3,
            }}
            transition={{
              type: "spring",
              stiffness: 250,
            }}
            src="#"
            alt="Logo"
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}

        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-2"
        >
          {navLinks.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative overflow-hidden rounded-xl px-5 py-2 font-medium transition-all duration-300 ${active
                  ? "bg-red-700 text-white"
                  : "bg-transparent text-gray-700 hover:bg-red-600 hover:text-white"
                  }`}
              >
                <span
                  className={`transition-colors duration-300 ${active
                    ? "text-white"
                    : "text-gray-700 group-hover:text-white"
                    }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right */}

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="hidden lg:flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <LogIn size={18} />
              Login
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="hidden lg:flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white transition hover:bg-red-800"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          )}

          {/* Mobile Button */}

          <button
            aria-label="Open Menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2.5 rounded-xl border border-gray-200 hover:bg-red-50 transition"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.25,
            }}
            className="lg:hidden border-t border-red-100 bg-white shadow-xl"
          >
            <div className="px-5 py-6 space-y-2">
              {navLinks.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-xl px-5 py-4 font-medium transition ${active
                      ? "bg-red-700 text-white"
                      : "text-gray-700 hover:bg-red-50"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {!isLoggedIn ? (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-4 font-semibold text-white transition duration-300 hover:from-red-700 hover:to-red-800"
                >
                  <LogIn size={18} />
                  Login
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-700 py-4 text-white font-semibold"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setMenuOpen(false);
                    }}
                    className="w-full mt-3 rounded-xl border border-red-200 py-4 text-red-700 font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>

                  <div className="mt-5 flex items-center gap-3 border rounded-2xl p-3">
                    <img
                      src="https://i.pravatar.cc/100"
                      className="w-12 h-12 rounded-full"
                      alt="avatar"
                    />

                    <div>
                      <h3 className="font-semibold">
                        Admin
                      </h3>

                      <p className="text-sm text-gray-500">
                        Online
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}