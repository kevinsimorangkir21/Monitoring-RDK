"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Activity,
  Clock3,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

export default function Impact() {
  const stats = [
    {
      title: "Total OP",
      value: "1.245",
      icon: ClipboardList,
      iconGradient: "from-red-600 to-red-700",
      color: "from-red-500 to-red-700",
      progress: 92,
      increase: "+18%",
    },
    {
      title: "OP Aktif",
      value: "956",
      icon: Activity,
      iconGradient: "from-emerald-500 to-green-600",
      color: "from-emerald-500 to-green-600",
      progress: 78,
      increase: "+12%",
    },
    {
      title: "Pending",
      value: "182",
      icon: Clock3,
      iconGradient: "from-amber-400 to-yellow-500",
      color: "from-amber-400 to-yellow-500",
      progress: 45,
      increase: "-5%",
    },
    {
      title: "Selesai",
      value: "107",
      icon: CheckCircle2,
      iconGradient: "from-blue-500 to-indigo-600",
      color: "from-blue-500 to-indigo-600",
      progress: 100,
      increase: "+24%",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-28">

      <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none">
        <div className="h-72 w-72 rounded-full bg-red-50 blur-3xl opacity-60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="mx-auto mb-20 max-w-3xl text-center"
        >

          <span className="inline-flex rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-700">
            Dashboard Overview
          </span>

          <h2 className="mt-6 text-4xl font-black text-slate-900 lg:text-5xl">
            Statistik Monitoring OP
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-500">
            Pantau seluruh proses operasional secara real-time melalui dashboard
            yang cepat, akurat, dan terintegrasi.
          </p>

        </motion.div>

        {/* Cards */}

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: index * 0.12,
              }}
              whileHover={{
                y: -12,
              }}
              className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white p-7 shadow-xl transition-all duration-500 hover:shadow-2xl"
            >

              {/* Glow */}

              <div
                className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${item.color} opacity-10 blur-3xl`}
              />

              {/* Header */}

              <div className="flex items-start justify-between">

                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.iconGradient} shadow-lg`}
                >
                  <item.icon
                    className="text-white"
                    size={30}
                    strokeWidth={2.2}
                  />
                </div>

                <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                  <ArrowUpRight size={14} />
                  {item.increase}
                </div>

              </div>

              {/* Content */}

              <h4 className="mt-8 text-base font-medium text-slate-500">
                {item.title}
              </h4>

              <h3 className="mt-2 text-5xl font-black tracking-tight text-slate-900">
                {item.value}
              </h3>

              {/* Progress */}

              <div className="mt-8">

                <div className="mb-2 flex justify-between text-sm text-slate-500">
                  <span>Progress</span>
                  <span>{item.progress}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 shadow-inner">

                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    whileInView={{
                      width: `${item.progress}%`,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 1,
                      delay: index * .15,
                    }}
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  />

                </div>

              </div>

              <p className="mt-4 text-sm font-medium text-slate-400">
                Realtime Monitoring
              </p>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}