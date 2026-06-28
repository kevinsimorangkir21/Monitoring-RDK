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
    <footer className="bg-[#111827] text-gray-300 border-t border-gray-800">

      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid lg:grid-cols-4 gap-12">

          {/* Logo */}
          <div>

            <div className="flex items-center gap-3">

              <motion.img
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring" }}
                src="#"
                alt="Monitoring OP"
                className="w-12 h-12 rounded-xl"
              />

              <div>

                <h2 className="text-xl font-bold text-white">
                  Monitoring OP
                </h2>

              </div>

            </div>

            <p className="mt-6 leading-7 text-gray-400">
              Monitoring OP merupakan platform untuk memantau seluruh proses
              operasional secara real-time, mulai dari status pekerjaan,
              progres, hingga laporan dalam satu dashboard terintegrasi.
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
                  className="hover:text-red-400 transition"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="hover:text-red-400 transition"
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

              <div className="flex gap-3">

                <MapPin
                  size={20}
                  className="text-red-500"
                />

                <span>Jakarta, Indonesia</span>

              </div>

              <div className="flex gap-3">

                <Mail
                  size={20}
                  className="text-red-500"
                />

                <span>support@monitoringop.com</span>

              </div>

              <div className="flex gap-3">

                <Phone
                  size={20}
                  className="text-red-500"
                />

                <span>(021) 1234 5678</span>

              </div>

            </div>

          </div>

          {/* Status */}

          <div>

            <h3 className="text-white font-semibold mb-5">
              System Status
            </h3>

            <div className="flex gap-3">

              <ShieldCheck
                size={22}
                className="text-green-500 mt-1"
              />

              <div>

                <p className="font-semibold text-white">
                  All Systems Operational
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Monitoring service is running normally.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-gray-800">

        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3">

          <p className="text-sm text-gray-500">
            © 2026 Monitoring OP. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500">

            <span>Version 1.0.0</span>

            <span className="text-green-500">
              ● Online
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}