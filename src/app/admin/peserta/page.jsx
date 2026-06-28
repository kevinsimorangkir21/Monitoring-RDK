"use client";
import { useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  MessageSquare,
  User,
  Filter,
} from "lucide-react";

export default function ManajemenPeserta() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const pesertaList = [
    {
      id: 1,
      nama: "Kevin Simorangkir",
      email: "kevin@mhs.itera.ac.id",
      universitas: "Institut Teknologi Sumatera",
      status: "Aktif",
      perusahaan: "PT Telkom Indonesia",
    },
    {
      id: 2,
      nama: "Sinta Dewi",
      email: "sinta@ugm.ac.id",
      universitas: "Universitas Gadjah Mada",
      status: "Menunggu",
      perusahaan: "PT Pertamina",
    },
    {
      id: 3,
      nama: "Rizky Ramadhan",
      email: "rizky@uns.ac.id",
      universitas: "Universitas Sebelas Maret",
      status: "Selesai",
      perusahaan: "PT BRI",
    },
  ];

  const filteredPeserta = pesertaList.filter((p) => {
    const matchesSearch =
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.universitas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "Semua" || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Manajemen Peserta</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola data peserta magang di seluruh perusahaan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari peserta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141a23] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141a23] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Semua</option>
              <option>Aktif</option>
              <option>Menunggu</option>
              <option>Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Peserta */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#141a23] shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#1a1f2b] text-gray-700 dark:text-gray-300">
            <tr>
              <th className="py-3 px-4 text-left">Nama</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Universitas</th>
              <th className="py-3 px-4 text-left">Perusahaan</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeserta.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                <td className="py-3 px-4 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> {p.nama}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {p.email}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {p.universitas}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {p.perusahaan}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.status === "Aktif"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : p.status === "Menunggu"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
                    }`}
                  >
                    {p.status}
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
                      title="Kirim Pesan"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-red-600"
                      title="Hapus Peserta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPeserta.length === 0 && (
          <p className="text-center py-6 text-gray-500 dark:text-gray-400">
            Tidak ada peserta ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}
