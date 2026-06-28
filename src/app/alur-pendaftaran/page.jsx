'use client';
import React from 'react';
import { CheckCircle, Clock, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AlurPendaftaran() {
  const syarat = [
    {
      title: 'Setiap pendaftar hanya dapat memilih 1 program magang aktif',
      desc: 'Pastikan sudah meninjau seluruh posisi magang yang tersedia sebelum mengajukan lamaran. Setelah melamar, data tidak dapat diubah.',
    },
    {
      title: 'Pastikan data profil dan dokumen sudah benar sebelum melamar',
      desc: 'Isi data diri, pendidikan, dan unggah CV/portofolio sesuai ketentuan. Data yang tidak lengkap dapat menyebabkan lamaran tidak diproses.',
    },
    {
      title: 'Seluruh proses tidak dipungut biaya',
      desc: 'Jika ada pihak yang meminta biaya pendaftaran, segera laporkan melalui kanal resmi MagangHub.',
    },
    {
      title: 'Informasi resmi hanya tersedia di portal MagangHub',
      desc: 'Seluruh pengumuman, proses seleksi, dan komunikasi resmi dilakukan melalui situs MagangHub.',
    },
  ];

  const alur = [
    { step: '1', title: 'Daftar Akun', desc: 'Buat akun dan lengkapi profil mahasiswa di platform MagangHub.' },
    { step: '2', title: 'Telusuri Magang', desc: 'Pilih posisi magang sesuai minat dan bidang studi kamu.' },
    { step: '3', title: 'Unggah Dokumen', desc: 'Upload CV, portofolio, dan dokumen pendukung sesuai persyaratan.' },
    { step: '4', title: 'Kirim Lamaran', desc: 'Ajukan lamaran magang dan tunggu proses seleksi dari perusahaan.' },
    { step: '5', title: 'Seleksi & Wawancara', desc: 'Perusahaan akan meninjau lamaran dan menghubungi kandidat yang lolos.' },
    { step: '6', title: 'Mulai Magang', desc: 'Jika diterima, kamu dapat memulai pengalaman magang sesuai jadwal.' },
  ];

  const timeline = [
    { date: '01 Okt 2025 - 14 Okt 2025', title: 'Pendaftaran Perusahaan dan Usulan Program Pemagangan', active: false },
    { date: '07 Okt 2025 - 15 Okt 2025', title: 'Pendaftaran Peserta Pemagangan', active: false },
    { date: '16 Okt 2025 - 18 Okt 2025', title: 'Seleksi dan Pengumuman Peserta Pemagangan', active: true }, // aktif berkilau ✨
    { date: '20 Okt 2025 - 19 Apr 2026', title: 'Pelaksanaan Program Pemagangan', active: false },
  ];

  const faq = [
    {
      q: 'Apakah saya bisa mendaftar lebih dari satu magang?',
      a: 'Tidak, setiap pendaftar hanya dapat memilih satu program magang dalam satu periode pendaftaran.',
    },
    {
      q: 'Apakah tersedia magang remote (jarak jauh)?',
      a: 'Ya, tergantung kebijakan perusahaan mitra dan posisi yang tersedia.',
    },
    {
      q: 'Bagaimana saya tahu lamaran saya diterima?',
      a: 'Kamu akan menerima notifikasi melalui email dan dashboard akun MagangHub.',
    },
    {
      q: 'Apakah magang ini dibayar?',
      a: 'Tergantung pada kebijakan perusahaan mitra, sebagian besar program menyediakan uang saku.',
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0b0f15] text-gray-900 dark:text-gray-100 pt-28 pb-20">
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16 px-6"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
          Panduan Pendaftaran Magang
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm max-w-2xl mx-auto">
          Ikuti langkah-langkah di bawah ini untuk memahami syarat, proses, dan jadwal resmi pendaftaran magang melalui MagangHub.
        </p>
      </motion.section>

      {/* SYARAT PENDAFTARAN */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-6 mb-20"
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <CheckCircle className="text-blue-500" /> Syarat Pendaftaran
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {syarat.map((item, i) => (
            <div
              key={i}
              className="p-6 bg-white dark:bg-[#10151d] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ALUR PENDAFTARAN */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-6 mb-20"
      >
        <h2 className="text-2xl font-semibold mb-8 text-center bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
          Alur Pendaftaran Magang
        </h2>
        <div className="relative border-l-2 border-blue-600/30 ml-4 pl-6 space-y-8">
          {alur.map((step, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[30px] top-0 w-6 h-6 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-full text-xs font-bold shadow-md">
                {step.step}
              </span>
              <div className="p-4 rounded-xl bg-white dark:bg-[#10151d] border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* TIMELINE PENDAFTARAN */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6 mb-20"
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Clock className="text-blue-500" /> Timeline Pendaftaran
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {timeline.map((item, i) => (
            <div
              key={i}
              className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                item.active
                  ? 'text-white border-transparent bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg'
                  : 'bg-white dark:bg-[#10151d] border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              {item.active && (
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-cyan-300/20 to-blue-400/20 animate-shimmer rounded-2xl pointer-events-none"></span>
              )}
              <p className="text-xs opacity-80 relative z-10">{item.date}</p>
              <p className="mt-2 font-semibold text-sm leading-snug relative z-10">{item.title}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-6"
      >
        <h2 className="text-2xl font-semibold mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="text-blue-500" /> Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faq.map((f, i) => (
            <details
              key={i}
              className="p-5 rounded-2xl border bg-white dark:bg-[#10151d] border-gray-200 dark:border-gray-800 hover:shadow-md transition group"
            >
              <summary className="font-semibold cursor-pointer text-gray-900 dark:text-gray-100 flex justify-between items-center">
                {f.q}
                <span className="text-blue-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </motion.section>

      {/* 🔹 Animasi shimmer */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: 200px 0;
          }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
      `}</style>
    </main>
  );
}
