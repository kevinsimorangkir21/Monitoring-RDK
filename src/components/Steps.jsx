"use client";

import { motion } from "framer-motion";
import {
  ClipboardPlus,
  SearchCheck,
  CheckCircle2,
} from "lucide-react";

export default function Steps() {
  const steps = [
    {
      num: "01",
      icon: ClipboardPlus,
      title: "Input Data OP",
      desc: "Masukkan data Operational Process (OP) yang akan dipantau ke dalam sistem monitoring.",
    },
    {
      num: "02",
      icon: SearchCheck,
      title: "Monitoring Progress",
      desc: "Pantau status pekerjaan, progres penyelesaian, dan aktivitas setiap OP secara real-time.",
    },
    {
      num: "03",
      icon: CheckCircle2,
      title: "Laporan & Evaluasi",
      desc: "Analisis hasil monitoring dan hasilkan laporan sebagai dasar evaluasi operasional.",
    },
  ];

  return (
    <section className="bg-white py-24">

      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-3xl"
        >
          <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            Workflow
          </span>

          <h2 className="mt-5 text-4xl font-black text-gray-900 lg:text-5xl">
            Alur Monitoring
            <span className="text-red-700"> Operational Process</span>
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-500">
            Sistem Monitoring OP membantu proses pencatatan, pemantauan,
            hingga pelaporan operasional secara cepat, akurat, dan
            terintegrasi dalam satu dashboard.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3">

          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="relative bg-white rounded-3xl shadow-lg border border-gray-100 p-8"
            >
              {/* Number */}
              <div className="absolute -top-6 left-8 w-14 h-14 rounded-2xl bg-red-700 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                {step.num}
              </div>

              {/* Icon */}
              <div className="mt-10 w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                <step.icon
                  size={30}
                  className="text-red-700"
                />
              </div>

              <h3 className="mt-8 text-2xl font-bold text-gray-900">
                {step.title}
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                {step.desc}
              </p>

              <div className="mt-8 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-red-600 w-full rounded-full"></div>
              </div>
            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}