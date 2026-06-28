"use client";
import { useState } from "react";
import { Search, Eye, Star, User, UserCircle2 } from "lucide-react";

export default function FeedbackPage() {
  const [searchPeserta, setSearchPeserta] = useState("");
  const [searchMentor, setSearchMentor] = useState("");

  // 🧑‍🎓 Feedback dari peserta untuk mentor
  const feedbackPeserta = [
    {
      id: 1,
      peserta: "Kevin Simorangkir",
      mentor: "Budi Santoso",
      feedback:
        "Mentor sangat membantu dan memberikan arahan yang jelas setiap minggu.",
      rating: 5,
    },
    {
      id: 2,
      peserta: "Aulia Rahma",
      mentor: "Rina Putri",
      feedback:
        "Mentor sabar menjelaskan konsep baru dan responsif terhadap pertanyaan.",
      rating: 4,
    },
  ];

  // 👨‍🏫 Feedback dari mentor untuk peserta
  const feedbackMentor = [
    {
      id: 1,
      mentor: "Budi Santoso",
      peserta: "Kevin Simorangkir",
      feedback:
        "Kevin memiliki etos kerja tinggi dan mampu menyelesaikan tugas tepat waktu.",
      rating: 5,
    },
    {
      id: 2,
      mentor: "Rina Putri",
      peserta: "Aulia Rahma",
      feedback:
        "Aulia cepat belajar dan dapat beradaptasi dengan baik dalam tim.",
      rating: 4,
    },
  ];

  const filteredPeserta = feedbackPeserta.filter(
    (f) =>
      f.peserta.toLowerCase().includes(searchPeserta.toLowerCase()) ||
      f.mentor.toLowerCase().includes(searchPeserta.toLowerCase())
  );

  const filteredMentor = feedbackMentor.filter(
    (f) =>
      f.peserta.toLowerCase().includes(searchMentor.toLowerCase()) ||
      f.mentor.toLowerCase().includes(searchMentor.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* ============================================= */}
      {/* 🧑‍🎓 FEEDBACK PESERTA UNTUK MENTOR */}
      {/* ============================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-1">
              Feedback dari Peserta (Untuk Mentor)
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Umpan balik dari peserta terhadap mentor magang.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari peserta atau mentor..."
              value={searchPeserta}
              onChange={(e) => setSearchPeserta(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141a23] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#141a23] shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-[#1a1f2b] text-gray-700 dark:text-gray-300">
              <tr>
                <th className="py-3 px-4 text-left">Peserta</th>
                <th className="py-3 px-4 text-left">Mentor</th>
                <th className="py-3 px-4 text-left">Feedback</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeserta.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  <td className="py-3 px-4 flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
                    <User className="w-4 h-4 text-blue-500" /> {f.peserta}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <UserCircle2 className="w-4 h-4 text-indigo-500" />{" "}
                    {f.mentor}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                    {f.feedback}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-1">
                      {[...Array(f.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPeserta.length === 0 && (
            <p className="text-center py-6 text-gray-500 dark:text-gray-400">
              Tidak ada feedback ditemukan.
            </p>
          )}
        </div>
      </section>

      {/* ============================================= */}
      {/* 👨‍🏫 FEEDBACK MENTOR UNTUK PESERTA */}
      {/* ============================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-1">
              Feedback dari Mentor (Untuk Peserta)
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Umpan balik dari mentor terhadap peserta magang.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari mentor atau peserta..."
              value={searchMentor}
              onChange={(e) => setSearchMentor(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141a23] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#141a23] shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-[#1a1f2b] text-gray-700 dark:text-gray-300">
              <tr>
                <th className="py-3 px-4 text-left">Mentor</th>
                <th className="py-3 px-4 text-left">Peserta</th>
                <th className="py-3 px-4 text-left">Feedback</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMentor.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  <td className="py-3 px-4 flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <UserCircle2 className="w-4 h-4 text-indigo-500" />{" "}
                    {f.mentor}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <User className="w-4 h-4 text-blue-500" /> {f.peserta}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                    {f.feedback}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-1">
                      {[...Array(f.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMentor.length === 0 && (
            <p className="text-center py-6 text-gray-500 dark:text-gray-400">
              Tidak ada feedback ditemukan.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
