"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Activity,
  Clock3,
  CheckCircle2,
} from "lucide-react";

export default function Impact() {
  const stats = [
    {
      title: "Total OP",
      value: "1.245",
      icon: ClipboardList,
      color: "bg-red-100 text-red-700",
    },
    {
      title: "OP Aktif",
      value: "956",
      icon: Activity,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Pending",
      value: "182",
      icon: Clock3,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Selesai",
      value: "107",
      icon: CheckCircle2,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <section className="bg-gray-50 py-24">

      <div className="max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex px-4 py-2 rounded-full bg-red-100 text-red-700 font-semibold text-sm">
            Dashboard Overview
          </span>

          <h2 className="mt-5 text-4xl font-bold text-gray-900">
            Statistik Monitoring OP
          </h2>

          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Pantau seluruh proses operasional secara real-time melalui
            dashboard yang cepat, akurat, dan terintegrasi.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {stats.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${item.color}`}
              >
                <item.icon size={30} />
              </div>

              <h3 className="mt-8 text-gray-500 font-medium">
                {item.title}
              </h3>

              <p className="text-4xl font-bold text-gray-900 mt-2">
                {item.value}
              </p>

              <div className="mt-6 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full"
                  style={{
                    width: `${65 + index * 10}%`,
                  }}
                />
              </div>
            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}