"use client";
import { useState } from "react";
import { CheckCircle2, Circle, Clock, Briefcase, Info } from "lucide-react";

export default function TrackLamaran() {
  const [tab, setTab] = useState("progress");

  const steps = [
    { label: "Lamaran Dikirim", status: "done", date: "12 Okt 2025" },
    { label: "Seleksi Administrasi", status: "done", date: "14 Okt 2025" },
    { label: "Wawancara", status: "ongoing", date: "18 Okt 2025" },
    { label: "Hasil Akhir", status: "pending", date: "-" },
  ];

  return (
    <div className="bg-white dark:bg-[#141a23] rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Status Lamaran — Magang di Telkom Indonesia
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Diperbarui terakhir: 18 Okt 2025, 13:40 WIB
          </p>
        </div>
        <span className="text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full">
          Sedang Wawancara
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
        {["progress", "detail", "feedback"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium transition ${
              tab === t
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t === "progress"
              ? "Progress"
              : t === "detail"
              ? "Detail"
              : "Feedback"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "progress" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
            {steps.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center text-center">
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    s.status === "done"
                      ? "border-blue-500 bg-blue-500 text-white"
                      : s.status === "ongoing"
                      ? "border-yellow-400 text-yellow-500"
                      : "border-gray-300 dark:border-gray-700 text-gray-400"
                  }`}
                >
                  {s.status === "done" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : s.status === "ongoing" ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <p className="mt-2 text-xs">{s.label}</p>
                <span className="text-[11px] text-gray-400">{s.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "detail" && (
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
          <p><strong>Posisi:</strong> Frontend Developer Intern</p>
          <p><strong>Perusahaan:</strong> Telkom Indonesia</p>
          <p><strong>Tanggal Lamaran:</strong> 12 Oktober 2025</p>
          <p><strong>Status:</strong> Tahap Wawancara</p>
          <p><strong>Kontak HR:</strong> hr@telkom.co.id</p>
        </div>
      )}

      {tab === "feedback" && (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="mb-2">💬 <strong>Umpan Balik Terbaru</strong></p>
          <p>
            “Terima kasih telah mengikuti tahap wawancara. Tim kami akan
            menginformasikan hasil akhir paling lambat tanggal 22 Oktober 2025.”
          </p>
        </div>
      )}
    </div>
  );
}
