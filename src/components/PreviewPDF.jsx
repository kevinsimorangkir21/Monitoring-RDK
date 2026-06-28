"use client";
import React from "react";
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet,
  PDFDownloadLink,
  PDFViewer,
} from "@react-pdf/renderer";
import { FileDown } from "lucide-react";

// 🎨 Styling PDF
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f9fafb",
    padding: 35,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    borderBottom: "2pt solid #2C4C63",
    paddingBottom: 10,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  headerText: {
    flexGrow: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C4C63",
  },
  email: { fontSize: 11, marginTop: 4 },
  section: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: "1pt solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2C4C63",
    marginBottom: 6,
  },
  text: { fontSize: 11, lineHeight: 1.4 },
  listItem: { marginLeft: 10, fontSize: 11, marginBottom: 3 },
  footer: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 10,
    color: "#6b7280",
  },
  signature: {
    width: 100,
    height: 50,
    alignSelf: "flex-end",
    marginTop: 15,
  },
});

// 📄 Template PDF (multi-halaman)
const PratayangDocument = ({
  identitas,
  pendidikan,
  pengalaman,
  keahlian,
  bahasa,
  penghargaan,
}) => (
  <Document>
    {/* HALAMAN 1 */}
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Image src={identitas.foto} style={styles.profilePic} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{identitas.nama}</Text>
          <Text style={styles.email}>{identitas.email}</Text>
          <Text style={styles.email}>{identitas.telepon}</Text>
          <Text style={styles.email}>{identitas.alamat}</Text>
        </View>
      </View>

      {/* Identitas Diri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I. Identitas Diri</Text>
        <Text style={styles.text}>Nama Lengkap: {identitas.nama}</Text>
        <Text style={styles.text}>Jenis Kelamin: {identitas.kelamin}</Text>
        <Text style={styles.text}>NIK: {identitas.nik}</Text>
        <Text style={styles.text}>Email: {identitas.email}</Text>
        <Text style={styles.text}>Telepon: {identitas.telepon}</Text>
        <Text style={styles.text}>Alamat: {identitas.alamat}</Text>
        <Text style={styles.text}>Bahasa: {bahasa.join(", ")}</Text>
      </View>

      {/* Pendidikan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>II. Pendidikan</Text>
        {pendidikan.map((p, i) => (
          <View key={i}>
            <Text style={styles.text}>
              {p.jenjang} — {p.institusi}
            </Text>
            <Text style={styles.text}>
              {p.tahunMulai} - {p.tahunSelesai} | IPK: {p.ipk}
            </Text>
          </View>
        ))}
      </View>

      {/* Keahlian */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>III. Keahlian</Text>
        {keahlian.map((k, i) => (
          <Text key={i} style={styles.listItem}>
            • {k}
          </Text>
        ))}
      </View>

      {/* tanda tangan */}
      <View style={{ marginTop: 30 }}>
        <Text style={[styles.text, { alignSelf: "flex-end" }]}>
          Bandar Lampung, {new Date().toLocaleDateString("id-ID")}
        </Text>
        <Image src="/signature.png" style={styles.signature} />
        <Text
          style={[
            styles.text,
            { alignSelf: "flex-end", fontWeight: "bold", marginTop: 4 },
          ]}
        >
          {identitas.nama}
        </Text>
      </View>
    </Page>

    {/* HALAMAN 2 */}
    <Page size="A4" style={styles.page}>
      {/* Pengalaman */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IV. Pengalaman Kerja & Organisasi</Text>
        {pengalaman.map((exp, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>{exp.nama}</Text>
            <Text style={styles.text}>
              {exp.posisi} | {exp.tahunMulai} - {exp.tahunSelesai}
            </Text>
            <Text style={styles.text}>{exp.deskripsi}</Text>
          </View>
        ))}
      </View>

      {/* Penghargaan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>V. Penghargaan & Sertifikasi</Text>
        {penghargaan.map((p, i) => (
          <View key={i}>
            <Text style={styles.text}>🏆 {p.nama}</Text>
            <Text style={styles.text}>Lembaga: {p.lembaga}</Text>
            <Text style={styles.text}>Tahun: {p.tahun}</Text>
            <Text style={styles.text}>Keterangan: {p.keterangan}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Dicetak otomatis dari sistem MagangHub © {new Date().getFullYear()}
      </Text>
    </Page>
  </Document>
);

// 🧾 Halaman Next.js
export default function PratayangCVPage() {
  const identitas = {
    nama: "Kevin Simorangkir",
    kelamin: "Laki-laki",
    nik: "1234567890123456",
    email: "kevin@mail.com",
    telepon: "0812-3456-7890",
    alamat: "Jl. Merpati No. 4, Bandar Lampung",
    foto: "/avatar.jpg",
  };

  const pendidikan = [
    {
      jenjang: "Sarjana (S1) Informatika",
      institusi: "Institut Teknologi Sumatera",
      tahunMulai: "2021",
      tahunSelesai: "2025",
      ipk: "3.85",
    },
  ];

  const keahlian = [
    "React.js & Next.js",
    "Tailwind CSS",
    "UI/UX Design (Figma)",
    "Node.js / Express",
    "Git & Deployment (Vercel)",
  ];

  const bahasa = ["Bahasa Indonesia", "Bahasa Inggris (TOEFL 640)"];

  const pengalaman = [
    {
      nama: "PT Telkom Indonesia",
      posisi: "Frontend Developer Intern",
      tahunMulai: "2024",
      tahunSelesai: "2025",
      deskripsi:
        "Membangun dashboard internal dengan React & Tailwind, serta meningkatkan UX sebesar 35%.",
    },
    {
      nama: "Organisasi HIMATIF ITERA",
      posisi: "Koordinator Desain",
      tahunMulai: "2023",
      tahunSelesai: "2024",
      deskripsi:
        "Mengelola tim desain dan membuat media publikasi digital kampus.",
    },
  ];

  const penghargaan = [
    {
      nama: "Gold Award ITELLS 2025",
      lembaga: "Universiti Kebangsaan Malaysia",
      tahun: "2025",
      keterangan:
        "Gold Award kategori Inovasi Teknologi — project Snake Rush Mobile App.",
    },
    {
      nama: "UI/UX Competition Finalist",
      lembaga: "Telkom University",
      tahun: "2024",
      keterangan: "Top 3 Nasional UI/UX Challenge.",
    },
  ];

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Pratayang CV Peserta
      </h2>

      {/* Preview PDF */}
      <div className="w-full h-[80vh] border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
        <PDFViewer width="100%" height="100%">
          <PratayangDocument
            identitas={identitas}
            pendidikan={pendidikan}
            pengalaman={pengalaman}
            keahlian={keahlian}
            bahasa={bahasa}
            penghargaan={penghargaan}
          />
        </PDFViewer>
      </div>

      {/* Tombol Download */}
      <PDFDownloadLink
        document={
          <PratayangDocument
            identitas={identitas}
            pendidikan={pendidikan}
            pengalaman={pengalaman}
            keahlian={keahlian}
            bahasa={bahasa}
            penghargaan={penghargaan}
          />
        }
        fileName="CV_Kevin_Simorangkir_MagangHub.pdf"
      >
        {({ loading }) => (
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2C4C63] text-white rounded-lg hover:bg-[#203a4d] transition">
            <FileDown size={18} />
            {loading ? "Menyiapkan..." : "Unduh CV Lengkap (PDF)"}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  );
}
