"use client";
import { useState } from "react";
import {
  Search,
  Filter,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Edit3,
} from "lucide-react";

export default function LaporanMagangAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // 📋 Data dummy laporan
  const laporanList = [
    {
      id: 1,
      nama: "Kevin Simorangkir",
      perusahaan: "PT Telkom Indonesia",
      minggu: "Minggu 1 (1–7 Okt 2025)",
      file: "laporan-kevin-m1.pdf",
      status: "Disetujui",
    },
    {
      id: 2,
      nama: "Aulia Rahma",
      perusahaan: "PT BRI",
      minggu: "Minggu 2 (8–14 Okt 2025)",
      file: "laporan-aulia-m2.pdf",
      status: "Menunggu",
    },
    {
      id: 3,
      nama: "Rizky Pratama",
      perusahaan: "PT Pertamina",
      minggu: "Minggu 1 (1–7 Okt 2025)",
      file: "laporan-rizky-m1.pdf",
      status: "Revisi",
    },
  ];

  // 🔍 Filter hasil pencarian
  const filteredLaporan = laporanList.filter((l) => {
    const matchesSearch =
      l.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.perusahaan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "Semua" || l.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">
            Manajemen Laporan Magang
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Pantau laporan mingguan peserta magang.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔍 Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari peserta atau perusahaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141a23] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 🔽 Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141a23] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Semua</option>
              <option>Disetujui</option>
              <option>Revisi</option>
              <option>Menunggu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Laporan */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#141a23] shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#1a1f2b] text-gray-700 dark:text-gray-300">
            <tr>
              <th className="py-3 px-4 text-left">Nama Peserta</th>
              <th className="py-3 px-4 text-left">Perusahaan</th>
              <th className="py-3 px-4 text-left">Periode Laporan</th>
              <th className="py-3 px-4 text-left">File</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLaporan.map((l) => (
              <tr
                key={l.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                  {l.nama}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {l.perusahaan}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {l.minggu}
                </td>
                <td className="py-3 px-4">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    {l.file}
                  </a>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                      l.status === "Disetujui"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : l.status === "Revisi"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                    }`}
                  >
                    {l.status === "Disetujui" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : l.status === "Revisi" ? (
                      <Edit3 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {l.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-blue-600"
                      title="Lihat Laporan"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition text-green-600"
                      title="Setujui"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition text-yellow-600"
                      title="Minta Revisi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-red-600"
                      title="Tolak Laporan"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLaporan.length === 0 && (
          <p className="text-center py-6 text-gray-500 dark:text-gray-400">
            Tidak ada laporan ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}
