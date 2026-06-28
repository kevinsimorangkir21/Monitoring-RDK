"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem("theme") === "dark";
    setIsDark(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f15] transition-colors duration-500 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200/60 dark:border-white/10 backdrop-blur-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Daftar Akun Baru 🎉
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Mulai perjalanan kariermu bersama MagangHub
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-white"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition duration-300"
          >
            Daftar Sekarang
          </motion.button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 bg-white dark:bg-gray-900 text-gray-500">
              atau daftar dengan
            </span>
          </div>
        </div>

        {/* Tombol Google */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full flex items-center justify-center gap-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <FcGoogle className="w-5 h-5" />
          Daftar dengan Google
        </motion.button>

        <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
