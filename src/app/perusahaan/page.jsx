"use client";
import { Briefcase, Users, FileText } from "lucide-react";

export default function PerusahaanDashboard() {
  const stats = [
    { label: "Lowongan Aktif", value: 5, icon: Briefcase, color: "blue" },
    { label: "Lamaran Masuk", value: 124, icon: FileText, color: "green" },
    { label: "Pelamar Diterima", value: 12, icon: Users, color: "yellow" },
  ];

  const recentApplicants = [
    { nama: "Kevin Simorangkir", posisi: "Frontend Developer", tanggal: "18 Okt 2025" },
    { nama: "Alya Rahmadani", posisi: "UI/UX Designer", tanggal: "17 Okt 2025" },
    { nama: "Rizky Pratama", posisi: "Data Analyst", tanggal: "15 Okt 2025" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Selamat Datang, Telkom Indonesia 👋</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola lowongan dan pantau pelamar magang dengan mudah.
        </p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141a23] shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  item.color === "blue"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : item.color === "green"
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{item.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pelamar Terbaru */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Pelamar Terbaru</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141a23]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-[#1a1f2b] text-gray-700 dark:text-gray-300">
              <tr>
                <th className="text-left px-6 py-3">Nama</th>
                <th className="text-left px-6 py-3">Posisi</th>
                <th className="text-left px-6 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentApplicants.map((p, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#1a1f2b]/50 transition"
                >
                  <td className="px-6 py-3">{p.nama}</td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{p.posisi}</td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{p.tanggal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
