"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, SendHorizonal } from "lucide-react";

export default function LupaKataSandiPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSuccess(true);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Form */}
      <section className="flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-700">
              <span className="text-sm font-bold text-white">OP</span>
            </div>
            <span className="text-lg font-bold text-gray-800">
              Monitoring OP
            </span>
          </div>

          {/* Heading */}
          <div className="mt-10">
            <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your registered email and we'll send you a reset link.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative mt-2">
                <Mail
                  size={20}
                  className="absolute left-4 top-4 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-800"
                />
              </div>
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
              >
                Password reset link has been sent to your email.
              </motion.div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-700 font-semibold text-white shadow-lg transition hover:bg-red-800"
            >
              <SendHorizonal size={18} />
              Send Reset Link
            </motion.button>
          </form>

          {/* Back to Login */}
          <Link
            href="/login"
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-red-700 transition hover:gap-3"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </motion.div>
      </section>

      {/* Right Side - Illustration */}
      <section
        className="hidden lg:flex relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute bottom-16 left-16 right-16">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-10 text-white backdrop-blur-xl">
            <h2 className="text-4xl font-bold">Reset Password</h2>
            <p className="mt-5 leading-8 text-white/80">
              Enter your registered email address. We'll send you a secure
              password reset link to regain access to your Operational
              Monitoring account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
