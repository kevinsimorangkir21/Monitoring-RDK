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
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-gradient-to-br from-red-950 via-red-800 to-red-600 text-white">

      {/* Background */}
      <div className="absolute inset-0">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.15),transparent_35%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [.25, .45, .25],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute -left-44 top-10 h-[420px] w-[420px] rounded-full bg-red-400 blur-[120px]"
        />

        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [.2, .4, .2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
          className="absolute -right-24 bottom-0 h-[500px] w-[500px] rounded-full bg-white blur-[150px]"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl items-center px-6 py-24 lg:py-32">

        <div className="grid lg:grid-cols-2 gap-14 items-center w-full">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
              Operational Monitoring System
            </span>

            <h1 className="mt-6 text-5xl font-black leading-tight lg:text-7xl">
              Monitoring
              <span className="bg-gradient-to-r from-red-200 via-white to-red-100 bg-clip-text text-transparent"> Operational Process</span>
            </h1>

            <p className="mt-6 text-red-100 text-lg leading-8 max-w-xl">
              Platform monitoring operasional untuk memantau status OP,
              progres pekerjaan, serta laporan secara real-time dalam satu
              dashboard terintegrasi.
            </p>

            <div className="mt-12 flex flex-wrap gap-5">

              <Link
                href="/monitoring"
                className="rounded-2xl border border-white/30 bg-white/5 px-8 py-4 font-semibold backdrop-blur transition hover:bg-white/10"
              >
                Monitoring OP
              </Link>

            </div>

            <div className="mt-12 flex flex-wrap gap-10">

              <div>
                <h2 className="text-3xl font-black">1.245+</h2>
                <p className="text-red-100">
                  Operational Process
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-black">98%</h2>
                <p className="text-red-100">
                  Monitoring Accuracy
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-black">24/7</h2>
                <p className="text-red-100">
                  Real-time Monitoring
                </p>
              </div>

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
              <motion.div
                key={card.title}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                }}
                className="group rounded-3xl border border-white/10 bg-white/10 p-7 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-3 hover:border-white/30 hover:bg-white/20"
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
              </motion.div>
            ))}

          </motion.div>

        </div>

      </div>

      {/* Bottom Transition */}
      <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-b from-transparent to-slate-50" />
    </section>
  );
}