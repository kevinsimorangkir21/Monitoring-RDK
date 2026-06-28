"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ClipboardList,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export default function Hero() {
  const cards = [
    {
      icon: ClipboardList,
      title: "Total OP",
      value: "1.245",
    },
    {
      icon: Activity,
      title: "Monitoring",
      value: "956",
    },
    {
      icon: BarChart3,
      title: "Progress",
      value: "78%",
    },
    {
      icon: ShieldCheck,
      title: "Completed",
      value: "107",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white">

      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-red-300 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
              Operational Monitoring System
            </span>

            <h1 className="mt-6 text-5xl lg:text-6xl font-extrabold leading-tight">
              Monitoring
              <span className="text-red-200"> Operational Process</span>
            </h1>

            <p className="mt-6 text-red-100 text-lg leading-8 max-w-xl">
              Platform monitoring operasional untuk memantau status OP,
              progres pekerjaan, serta laporan secara real-time dalam satu
              dashboard terintegrasi.
            </p>

            <div className="flex gap-4 mt-10">

              <Link
                href="/dashboard"
                className="px-7 py-3 rounded-xl bg-white text-red-700 font-semibold hover:scale-105 transition"
              >
                Dashboard
              </Link>

              <Link
                href="/monitoring"
                className="px-7 py-3 rounded-xl border border-white/30 hover:bg-white/10 transition"
              >
                Monitoring OP
              </Link>

            </div>

          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
            className="grid grid-cols-2 gap-5"
          >

            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-6"
              >
                <card.icon
                  size={36}
                  className="text-red-200"
                />

                <h3 className="mt-6 text-sm text-red-100">
                  {card.title}
                </h3>

                <p className="mt-2 text-4xl font-bold">
                  {card.value}
                </p>
              </div>
            ))}

          </motion.div>

        </div>

      </div>

      {/* Bottom Wave */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 120"
        fill="none"
      >
        <path
          fill="#f9fafb"
          d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,53.3C1120,53,1280,75,1360,85.3L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
        />
      </svg>

    </section>
  );
}