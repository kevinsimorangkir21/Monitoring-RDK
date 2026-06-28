"use client";
import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit3,
  Save,
} from "lucide-react";

export default function AdminStatusLamaran() {
  const [statuses, setStatuses] = useState([
    { id: 1, nama: "Lamaran Dikirim", aktif: true },
    { id: 2, nama: "Seleksi Administrasi", aktif: true },
    { id: 3, nama: "Wawancara", aktif: true },
    { id: 4, nama: "Hasil Akhir", aktif: true },
  ]);

  const [newStatus, setNewStatus] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Tambah status baru
  const handleAdd = () => {
    if (!newStatus.trim()) return;
    setStatuses((prev) => [
      ...prev,
      { id: Date.now(), nama: newStatus, aktif: true },
    ]);
    setNewStatus("");
  };

  // Hapus status
  const handleDelete = (id) => {
    setStatuses((prev) => prev.filter((s) => s.id !== id));
  };

  // Aktif/Nonaktif
  const toggleAktif = (id) => {
    setStatuses((prev) =>
      prev.map((s) => (s.id === id ? { ...s, aktif: !s.aktif } : s))
    );
  };

  // Edit nama status
  const handleEdit = (id) => {
    setStatuses((prev) =>
      prev.map((s) => (s.id === id ? { ...s, nama: editValue } : s))
    );
    setEditId(null);
    setEditValue("");
  };

  // Naik/turun urutan
  const moveUp = (index) => {
    if (index === 0) return;
    const newStatuses = [...statuses];
    [newStatuses[index - 1], newStatuses[index]] = [
      newStatuses[index],
      newStatuses[index - 1],
    ];
    setStatuses(newStatuses);
  };

  const moveDown = (index) => {
    if (index === statuses.length - 1) return;
    const newStatuses = [...statuses];
    [newStatuses[index + 1], newStatuses[index]] = [
      newStatuses[index],
      newStatuses[index + 1],
    ];
    setStatuses(newStatuses);
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Manajemen Status Lamaran
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Atur tahapan proses lamaran magang yang digunakan di seluruh sistem.
        </p>
      </div>

      {/* Form tambah status */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Tambah status baru..."
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1a1f2b] text-gray-800 dark:text-gray-100"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Daftar status */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <thead className="bg-gray-100 dark:bg-[#1a1f2b]">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold">#</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">
                Nama Status
              </th>
              <th className="py-3 px-4 text-center text-sm font-semibold">
                Aktif
              </th>
              <th className="py-3 px-4 text-center text-sm font-semibold">
                Urutan
              </th>
              <th className="py-3 px-4 text-center text-sm font-semibold">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((s, i) => (
              <tr
                key={s.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                <td className="py-3 px-4 text-sm">{i + 1}</td>
                <td className="py-3 px-4 text-sm">
                  {editId === s.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1a1f2b] text-gray-800 dark:text-gray-100"
                      />
                      <button
                        onClick={() => handleEdit(s.id)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    s.nama
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => toggleAktif(s.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      s.aktif
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {s.aktif ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      className={`p-1 rounded-md ${
                        i === 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(i)}
                      disabled={i === statuses.length - 1}
                      className={`p-1 rounded-md ${
                        i === statuses.length - 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setEditId(s.id);
                        setEditValue(s.nama);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
