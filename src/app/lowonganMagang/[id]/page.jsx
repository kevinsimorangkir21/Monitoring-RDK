"use client";

import React from "react";
import { notFound } from "next/navigation";
import { jobsData } from "@/data/jobsData";
import {
  Briefcase,
  MapPin,
  GraduationCap,
  CheckCircle,
  Gift,
  ArrowRight,
} from "lucide-react";

export default function JobDetail({ params }) {
  // ✅ Unwrap params sesuai Next.js 15
  const resolvedParams = React.use(params);
  const id = resolvedParams?.id;

  // ✅ Cari data berdasarkan ID (string)
  const job = jobsData.find((item) => item.id === id);

  if (!job) return notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-[#0b0f15] dark:to-[#0f1623] text-gray-900 dark:text-gray-100 pt-28 pb-24 transition-colors duration-700">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600/10 to-blue-500/5 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-8 mb-12 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={job.logo || "/TelkomID.png"}
              alt={job.company || "Perusahaan"}
              className="w-24 h-24 rounded-2xl object-contain bg-white dark:bg-[#0b0f15] border border-gray-200 dark:border-gray-700 shadow-sm"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-center sm:justify-start gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                {job.company}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                {job.type && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg">
                    {job.type}
                  </span>
                )}
                {job.location && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-lg flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </span>
                )}
                {job.major && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-lg flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" /> {job.major}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Content */}
        <section className="space-y-12">
          {/* Deskripsi */}
          {job.description && (
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#111827]/60 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Briefcase className="w-5 h-5 text-blue-500" /> Deskripsi Pekerjaan
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {job.description}
              </p>
            </div>
          )}

          {/* Kualifikasi */}
          {(job.requirements ?? []).length > 0 && (
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#111827]/60 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> Kualifikasi
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-1">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefit */}
          {(job.benefits ?? []).length > 0 && (
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#111827]/60 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-pink-500" /> Benefit
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-1">
                {job.benefits.map((ben, i) => (
                  <li key={i}>{ben}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Tombol Lamar */}
        <div className="mt-16 flex justify-center">
          <button className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-3 text-lg">
            Lamar Sekarang
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </main>
  );
}
