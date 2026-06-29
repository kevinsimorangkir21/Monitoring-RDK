"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-gray-100">

      {/* LEFT */}
      <section className="flex items-center justify-center bg-white px-8 py-12">

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .6 }}
          className="w-full max-w-md"
        >

          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">

            <img
              src="#"
              alt="logo"
              className="w-12 h-12 rounded-xl"
            />

          </div>

          {/* Heading */}

          <h2 className="text-5xl font-bold text-gray-900">
            Welcome Back
          </h2>

          <p className="mt-4 text-gray-500 leading-7">
            Sign in to access the Operational Monitoring Dashboard.
          </p>

          {/* Form */}

          <form className="mt-10 space-y-6">

            <div>

              <label className="text-sm font-medium text-gray-700">
                Username
              </label>

              <div className="relative mt-2">

                <User
                  size={20}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
                />

              </div>

            </div>

            <div>

              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative mt-2">

                <Lock
                  size={20}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-12 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-red-600"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  className="accent-red-600"
                />

                Remember me
              </label>

              <Link
                href="/forgot-password"
                className="font-medium text-red-600 transition hover:text-red-700 hover:underline"
              >
                Forgot Password?
              </Link>

            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: .98 }}
              className="w-full h-14 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-semibold shadow-lg"
            >
              Login
            </motion.button>

          </form>

          <p className="mt-16 text-center text-sm text-gray-400">
            © 2026 Monitoring OP
          </p>

        </motion.div>

      </section>

      {/* RIGHT */}

      <section
        className="hidden lg:flex relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80')",
        }}
      >

        <div className="absolute inset-0 bg-black/25" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .3 }}
          className="absolute bottom-16 left-16 right-16"
        >

          <div className="rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 p-10 text-white">

            <span className="inline-block w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin mb-6"></span>

            <h2 className="text-4xl font-bold leading-tight">
              Operational Monitoring
              <br />
              Dashboard
            </h2>

            <p className="mt-5 text-white/80 leading-8">
              Monitor operational activities, performance,
              and system status in one centralized dashboard
              with real-time updates.
            </p>

            <div className="mt-8 flex gap-8">

              <div>
                <p className="text-3xl font-bold">
                  99.9%
                </p>
                <span className="text-sm text-white/70">
                  Uptime
                </span>
              </div>

              <div>
                <p className="text-3xl font-bold">
                  24/7
                </p>
                <span className="text-sm text-white/70">
                  Monitoring
                </span>
              </div>

              <div>
                <p className="text-3xl font-bold">
                  Live
                </p>
                <span className="text-sm text-white/70">
                  Status
                </span>
              </div>

            </div>

          </div>

        </motion.div>
      </section>

    </main>
  );
}