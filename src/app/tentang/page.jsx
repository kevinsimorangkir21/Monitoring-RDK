"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Briefcase,
  Globe2,
  Mail,
  Rocket,
  Sparkles,
  HeartHandshake,
  Lightbulb,
} from "lucide-react";

export default function Tentang() {
  const keunggulan = [
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "Jaringan Luas",
      desc: "Terhubung dengan ratusan perusahaan nasional dan startup yang membuka program magang setiap periode.",
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: "Seleksi Tepat Sasaran",
      desc: "Sistem seleksi berbasis profil dan minat mahasiswa agar magang lebih relevan dengan kompetensi.",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-blue-500" />,
      title: "Pendampingan Profesional",
      desc: "Setiap peserta mendapatkan mentor dan progress monitoring selama masa magang berlangsung.",
    },
    {
      icon: <Globe2 className="w-6 h-6 text-blue-500" />,
      title: "Akses Nasional",
      desc: "Platform digital yang menjangkau seluruh wilayah Indonesia untuk mempertemukan mahasiswa dan industri.",
    },
  ];

  const nilai = [
    {
      icon: <HeartHandshake className="w-6 h-6 text-pink-500" />,
      title: "Kolaboratif",
      desc: "Kami percaya pada kekuatan kolaborasi antara mahasiswa, kampus, dan industri.",
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-yellow-400" />,
      title: "Inovatif",
      desc: "Selalu berinovasi dalam menciptakan solusi untuk pengalaman magang yang lebih baik.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
      title: "Inspiratif",
      desc: "Menjadi inspirasi bagi generasi muda untuk berani memulai perjalanan kariernya.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0b0f15] dark:to-[#0b0f15] text-gray-900 dark:text-gray-100 pt-28 pb-24 transition-colors duration-500">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto px-6 mb-24"
      >
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent mb-6">
          Tentang <span className="text-blue-500">MagangHub</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Platform digital yang mempertemukan mahasiswa dan perusahaan untuk menciptakan ekosistem magang yang
          berkelanjutan, profesional, dan berdampak nyata bagi masa depan karier.
        </p>
      </motion.section>

      {/* VISI & MISI */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6 mb-24 grid md:grid-cols-2 gap-10"
      >
        <Card title="Visi" color="blue">
          Menjadi platform ekosistem magang terintegrasi yang menghubungkan dunia pendidikan dengan dunia kerja
          melalui kolaborasi digital yang berkelanjutan dan inovatif.
        </Card>

        <Card title="Misi" color="blue">
          <ul className="list-disc pl-5 text-base text-gray-600 dark:text-gray-400 space-y-2">
            <li>Meningkatkan kesiapan kerja mahasiswa melalui pengalaman magang berkualitas.</li>
            <li>Mendukung perusahaan dalam menemukan talenta muda potensial.</li>
            <li>Mendorong sinergi antara kampus, pemerintah, dan industri.</li>
            <li>Menyediakan sistem magang yang transparan, efisien, dan inklusif.</li>
          </ul>
        </Card>
      </motion.section>

      {/* NILAI UTAMA */}
      <Section title="Nilai Utama Kami">
        <div className="grid md:grid-cols-3 gap-8">
          {nilai.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white dark:bg-[#10151d] border border-gray-200 dark:border-gray-800 rounded-2xl text-center hover:shadow-xl hover:shadow-cyan-500/20 transition"
            >
              <div className="mb-4 flex justify-center">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* KEUNGGULAN */}
      <Section title="Kenapa Memilih MagangHub?">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keunggulan.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white dark:bg-[#10151d] border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 transition"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* TENTANG KAMI */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-6 mb-24 text-center"
      >
        <Rocket className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-3xl font-semibold mb-3">Tentang Kami</h2>
        <p className="text-gray-600 dark:text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
          Kami hadir untuk membantu mahasiswa menapaki dunia kerja lebih awal dan memberikan solusi bagi perusahaan
          dalam menemukan talenta muda potensial. MagangHub dibangun oleh tim yang peduli terhadap masa depan pendidikan
          dan karier di Indonesia.
        </p>
      </motion.section>

      {/* KONTAK */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-6 text-center"
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
          <Mail className="text-blue-500" /> Hubungi Kami
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Punya pertanyaan atau ingin bekerja sama? Hubungi kami melalui email di:
        </p>
        <a
          href="mailto:info@maganghub.id"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow hover:shadow-lg transition font-medium"
        >
          info@maganghub.id
        </a>
      </motion.section>
    </main>
  );
}

/* 🔹 Komponen Pendukung */
function Card({ title, children, color = "blue" }) {
  return (
    <div className="p-8 bg-white/70 dark:bg-[#10151d] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md backdrop-blur-xl hover:shadow-blue-500/20 transition">
      <h2 className={`text-2xl font-semibold mb-4 text-${color}-600`}>{title}</h2>
      <div className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto px-6 mb-24"
    >
      <h2 className="text-3xl font-semibold text-center mb-12 bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}
