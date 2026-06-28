"use client";
import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  FileText,
} from "lucide-react";

export default function ManajemenLamaran() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // 📋 Data dummy lamaran
  const lamaranList = [
    {
      id: 1,
      nama: "Kevin Simorangkir",
      perusahaan: "PT Telkom Indonesia",
      posisi: "Frontend Developer",
      tanggal: "2025-10-01",
      status: "Menunggu",
    },
    {
      id: 2,
      nama: "Aulia Rahma",
      perusahaan: "PT BRI",
      posisi: "UI/UX Designer",
      tanggal: "2025-09-28",
      status: "Diterima",
    },
    {
      id: 3,
      nama: "Rizky Pratama",
      perusahaan: "PT Pertamina",
      posisi: "Data Analyst",
      tanggal: "2025-09-30",
      status: "Ditolak",
    },
  ];

  // 🔍 Filter hasil
  const filteredLamaran = lamaranList.filter((l) => {
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
          <h2 className="text-2xl font-semibold mb-1">Manajemen Lamaran</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola semua lamaran peserta magang.
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
              <option>Diterima</option>
              <option>Ditolak</option>
              <option>Menunggu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Lamaran */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#141a23] shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#1a1f2b] text-gray-700 dark:text-gray-300">
            <tr>
              <th className="py-3 px-4 text-left">Nama Peserta</th>
              <th className="py-3 px-4 text-left">Perusahaan</th>
              <th className="py-3 px-4 text-left">Posisi</th>
              <th className="py-3 px-4 text-left">Tanggal Lamar</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLamaran.map((l) => (
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
                  {l.posisi}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {new Date(l.tanggal).toLocaleDateString("id-ID")}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                      l.status === "Diterima"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : l.status === "Ditolak"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {l.status === "Diterima" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : l.status === "Ditolak" ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {l.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-blue-600"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition text-emerald-600"
                      title="Ubah Status"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-red-600"
                      title="Hapus Lamaran"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLamaran.length === 0 && (
          <p className="text-center py-6 text-gray-500 dark:text-gray-400">
            Tidak ada lamaran ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}
