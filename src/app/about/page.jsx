"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  BarChart3,
  Database,
  MonitorSmartphone,
  Clock3,
} from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: Activity,
      title: "Real-Time Monitoring",
      desc: "Memantau seluruh Operational Process secara langsung dengan informasi yang selalu diperbarui.",
    },
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      desc: "Visualisasi data operasional dalam bentuk statistik dan grafik yang mudah dipahami.",
    },
    {
      icon: Database,
      title: "Centralized Data",
      desc: "Seluruh data OP tersimpan dalam satu sistem yang terintegrasi dan mudah diakses.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Access",
      desc: "Hak akses pengguna dikelola untuk menjaga keamanan data operasional.",
    },
    {
      icon: Clock3,
      title: "Operational Tracking",
      desc: "Melacak progres setiap Operational Process mulai dari awal hingga selesai.",
    },
    {
      icon: MonitorSmartphone,
      title: "Responsive System",
      desc: "Dapat digunakan melalui desktop maupun perangkat mobile.",
    },
  ];

  return (
    <main className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-red-500 text-white">

        <div className="max-w-7xl mx-auto px-6 py-28">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >

            <span className="px-4 py-2 rounded-full bg-white/20 text-sm">
              About Monitoring OP
            </span>

            <h1 className="text-5xl font-bold mt-6">
              Operational Monitoring System
            </h1>

            <p className="mt-6 text-red-100 max-w-3xl text-lg leading-8">
              Monitoring OP merupakan sistem yang dirancang untuk membantu
              perusahaan memonitor seluruh Operational Process secara
              terintegrasi, cepat, aman, dan real-time.
            </p>

          </motion.div>

        </div>

      </section>

      {/* About */}

      <section className="py-24">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >

              <h2 className="text-4xl font-bold text-gray-900">
                Tentang Sistem
              </h2>

              <p className="mt-6 text-gray-600 leading-8">
                Monitoring OP adalah platform yang digunakan untuk membantu
                proses pemantauan aktivitas operasional secara efisien.
                Seluruh data dapat dipantau melalui dashboard sehingga
                mempermudah proses analisis dan pengambilan keputusan.
              </p>

              <p className="mt-5 text-gray-600 leading-8">
                Dengan sistem ini, pengguna dapat mengetahui status pekerjaan,
                progres penyelesaian, serta menghasilkan laporan operasional
                secara lebih cepat dan akurat.
              </p>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-xl p-10"
            >

              <div className="space-y-8">

                <div className="flex justify-between">

                  <span>Total Operational Process</span>

                  <strong className="text-red-700">
                    1.245
                  </strong>

                </div>

                <div className="flex justify-between">

                  <span>Monitoring Active</span>

                  <strong className="text-green-600">
                    956
                  </strong>

                </div>

                <div className="flex justify-between">

                  <span>Completion Rate</span>

                  <strong className="text-blue-600">
                    87%
                  </strong>

                </div>

                <div className="flex justify-between">

                  <span>System Status</span>

                  <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    Online
                  </span>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* Features */}

      <section className="pb-24">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">

            <h2 className="text-4xl font-bold text-gray-900">
              Fitur Utama
            </h2>

            <p className="mt-4 text-gray-500">
              Monitoring OP menyediakan berbagai fitur untuk mendukung
              pengelolaan operasional perusahaan.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {features.map((feature, index) => (

              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                }}
                className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
              >

                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">

                  <feature.icon
                    size={30}
                    className="text-red-700"
                  />

                </div>

                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-4 text-gray-600 leading-7">
                  {feature.desc}
                </p>

              </motion.div>

            ))}

          </div>

        </div>

      </section>

    </main>
  );
}