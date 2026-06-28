"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-red-100"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <motion.img
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: "spring" }}
            src="#"
            alt="Monitoring OP"
            className="w-12 h-12 rounded-xl"
          />

          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Monitoring OP
            </h1>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm font-medium transition ${
                  active
                    ? "text-red-700"
                    : "text-gray-700 hover:text-red-600"
                }`}
              >
                {item.label}

                {active && (
                  <motion.span
                    layoutId="activeLink"
                    className="absolute left-0 -bottom-1 h-[2px] w-full rounded-full bg-red-700"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <button
              onClick={() => {
                localStorage.setItem("user", "admin");
                setIsLoggedIn(true);
              }}
              className="hidden md:flex px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold transition"
            >
              Login
            </button>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="hidden md:flex px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold transition"
              >
                Dashboard
              </Link>

              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  setIsLoggedIn(false);
                }}
                className="hidden md:block text-red-600 hover:text-red-700"
              >
                Logout
              </button>

              <img
                src="https://i.pravatar.cc/100"
                alt="avatar"
                className="w-10 h-10 rounded-full border-2 border-red-200"
              />
            </>
          )}

          {/* Mobile Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 rounded-xl border border-red-200 hover:bg-red-50 flex items-center justify-center"
          >
            {menuOpen ? "✕" : "☰"}
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
            className="md:hidden bg-white border-t border-red-100 shadow-xl"
          >
            <div className="flex flex-col gap-2 p-5">
              {navLinks.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl font-medium transition ${
                      active
                        ? "bg-red-700 text-white"
                        : "hover:bg-red-50 text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {!isLoggedIn ? (
                <button
                  onClick={() => {
                    localStorage.setItem("user", "admin");
                    setIsLoggedIn(true);
                    setMenuOpen(false);
                  }}
                  className="mt-3 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold"
                >
                  Login
                </button>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="mt-3 py-3 rounded-xl bg-red-700 text-white text-center font-semibold"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      setIsLoggedIn(false);
                      setMenuOpen(false);
                    }}
                    className="py-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-semibold"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}