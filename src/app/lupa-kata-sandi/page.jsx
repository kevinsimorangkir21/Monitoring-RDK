"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function LupaKataSandiPage() {
  const [email, setEmail] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [message, setMessage] = useState("");

  // Deteksi mode awal dari localStorage
  useEffect(() => {
    const darkMode = localStorage.getItem("theme") === "dark";
    setIsDark(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  // Ganti mode
  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // Simulasi submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() === "") {
      setMessage("Masukkan alamat email terlebih dahulu.");
      return;
    }
    setMessage("🔗 Link reset kata sandi telah dikirim ke email Anda.");
    setEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white dark:from-[#0b0f15] dark:to-[#111827] transition-all duration-500">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200/40 dark:border-white/10"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Lupa Kata Sandi 🔐
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 transition hover:scale-105"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M12 3v1m0 16v1m9-9h1M3 12H2m15.364 6.364l.707.707M6.343 6.343l-.707-.707m0 12.728l.707-.707m12.728 0l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M21.752 15.002A9.718 9.718 0 0112 21a9.718 9.718 0 01-9.752-5.998A9.96 9.96 0 0012 2a9.96 9.96 0 009.752 13.002z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-white"
              required
            />
          </div>

          {message && (
            <p className="text-sm text-center text-blue-600 dark:text-blue-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition duration-300 shadow-sm"
          >
            Kirim Link Reset
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Sudah ingat kata sandi?{" "}
            <a
              href="/login"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Masuk di sini
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
