"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-red-900/20 bg-slate-950 text-gray-300">

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid lg:grid-cols-4 gap-12">

          {/* Logo */}
          <div>

            <motion.img
              whileHover={{
                scale: 1.05,
                rotate: 3,
              }}
              transition={{
                type: "spring",
              }}
              src="#"
              alt="Logo"
              className="h-14 w-auto object-contain"
            />

            <p className="mt-6 max-w-sm leading-7 text-gray-400">
              Platform monitoring operasional yang membantu proses
              pencatatan, pemantauan, dan pelaporan secara real-time
              dalam satu dashboard terintegrasi.
            </p>

          </div>

          {/* Menu */}
          <div>

            <h3 className="text-white font-semibold mb-5">
              Menu
            </h3>

            <ul className="space-y-3">

              <li>
                <Link
                  href="/"
                  className="text-gray-400 transition hover:translate-x-1 hover:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="text-gray-400 transition hover:translate-x-1 hover:text-white"
                >
                  About
                </Link>
              </li>

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-white font-semibold mb-5">
              Contact
            </h3>

            <div className="space-y-4">

              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">

                <MapPin
                  size={18}
                  className="text-red-500"
                />

                <span className="text-sm">
                  Jakarta, Indonesia
                </span>

              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">

                <Mail
                  size={18}
                  className="text-red-500"
                />

                <span className="text-sm">
                  support@monitoringop.com
                </span>

              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">

                <Phone
                  size={18}
                  className="text-red-500"
                />

                <span className="text-sm">
                  (021) 1234 5678
                </span>

              </div>

            </div>

          </div>

          {/* Status */}

          <div>

            <h3 className="text-white font-semibold mb-5">
              System Status
            </h3>

            <div className="rounded-2xl border border-green-900/30 bg-green-950/20 p-5">

              <div className="flex items-center gap-3">

                <ShieldCheck
                  size={22}
                  className="text-green-400"
                />

                <div>

                  <h4 className="font-semibold text-white">
                    All Systems Operational
                  </h4>

                  <p className="mt-1 text-sm text-gray-400">
                    Monitoring service is running normally.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm md:flex-row">

          <p className="text-gray-500">
            © 2026 Monitoring OP. All rights reserved.
          </p>

          <div className="flex items-center gap-6">

            <span className="text-gray-500">
              Version 1.0.0
            </span>

            <div className="flex items-center gap-2 rounded-full bg-green-950 px-3 py-1 text-green-400">

              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />

              Online

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}