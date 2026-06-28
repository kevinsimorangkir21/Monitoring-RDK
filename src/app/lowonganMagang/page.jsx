"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Search, Building2, MapPin } from "lucide-react";
import { jobsData } from "@/data/jobsData";

export default function LowonganMagang() {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("Semua Perusahaan");
  const [selectedMajor, setSelectedMajor] = useState("Semua Jurusan");
  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 9;

  const companies = ["Semua Perusahaan", ...new Set(jobsData.map((j) => j.company))];
  const majors = ["Semua Jurusan", ...new Set(jobsData.map((j) => j.major))];

  const filteredJobs = jobsData.filter((job) => {
    const matchTitle = job.title.toLowerCase().includes(search.toLowerCase());
    const matchCompany =
      selectedCompany === "Semua Perusahaan" || job.company === selectedCompany;
    const matchMajor =
      selectedMajor === "Semua Jurusan" || job.major === selectedMajor;
    return matchTitle && matchCompany && matchMajor;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfLastJob - jobsPerPage, indexOfLastJob);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0b0f15] text-gray-900 dark:text-gray-100 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
            Lowongan Magang
          </h1>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari posisi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f131b] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f131b] focus:ring-2 focus:ring-blue-500"
          >
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f131b] focus:ring-2 focus:ring-blue-500"
          >
            {majors.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentJobs.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-[#10151d] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              {job.premium && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                  Premium
                </span>
              )}

              <h2 className="text-xl font-semibold mb-1">{job.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex items-center gap-1">
                <Building2 className="w-4 h-4" /> {job.company}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {job.location}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                {job.description}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 italic">
                Jurusan: {job.major}
              </p>

              <Link href={`/lowonganMagang/${job.id}`}>
                <button className="mt-5 w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white rounded-lg text-sm font-medium transition">
                  Lihat Detail
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filteredJobs.length > jobsPerPage && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {/* Prev */}
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                    : "text-blue-600 dark:text-blue-400 border-blue-600 hover:bg-blue-600 hover:text-white"
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Prev
              </button>

              {/* Page Numbers */}
              {(() => {
                const maxVisible = 8;
                const currentBatch = Math.floor((currentPage - 1) / maxVisible);
                const startPage = currentBatch * maxVisible + 1;
                const endPage = Math.min(startPage + maxVisible - 1, totalPages);
                const pages = [];

                if (startPage > 1) pages.push("prev-ellipsis");
                for (let i = startPage; i <= endPage; i++) pages.push(i);
                if (endPage < totalPages) pages.push("next-ellipsis");

                return pages.map((p, i) =>
                  p === "prev-ellipsis" ? (
                    <button
                      key={`prev-${i}`}
                      onClick={() => changePage(startPage - 1)}
                      className="px-3 py-2 text-gray-500 hover:text-blue-600"
                    >
                      ...
                    </button>
                  ) : p === "next-ellipsis" ? (
                    <button
                      key={`next-${i}`}
                      onClick={() => changePage(endPage + 1)}
                      className="px-3 py-2 text-gray-500 hover:text-blue-600"
                    >
                      ...
                    </button>
                  ) : (
                    <button
                      key={p}
                      onClick={() => changePage(p)}
                      className={`px-4 py-2 rounded-lg border font-medium transition-all duration-300 ${
                        currentPage === p
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-600 shadow-md"
                          : "border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              {/* Next */}
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                    : "text-blue-600 dark:text-blue-400 border-blue-600 hover:bg-blue-600 hover:text-white"
                }`}
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Halaman <span className="font-semibold">{currentPage}</span> dari{" "}
              <span className="font-semibold">{totalPages}</span>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
