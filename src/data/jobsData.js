export const jobsData = [
  // 🌟 TEKNOLOGI
  {
    id: "1",
    title: "Frontend Developer Intern",
    company: "Telkom Indonesia",
    location: "Bandung",
    type: "Hybrid",
    major: "Informatika",
    logo: "/TelkomID.png",
    tags: ["React", "Tailwind", "Next.js"],
    description:
      "Bertanggung jawab mengembangkan antarmuka pengguna untuk aplikasi internal Telkom dengan teknologi modern seperti React dan Tailwind CSS.",
    program: "Informatika / Rekayasa Perangkat Lunak",
    periode: "10 November 2025 – 10 Mei 2026",
    deadline: "25 Oktober 2025",
    address: "Jl. Japati No.1, Bandung",
    isPremium: true,
  },
  {
    id: "2",
    title: "Backend Engineer Intern",
    company: "Gojek",
    location: "Jakarta",
    type: "Remote",
    major: "Teknik Komputer",
    logo: "/logos/gojek.png",
    tags: ["Node.js", "Express", "PostgreSQL"],
    description:
      "Membantu tim backend dalam membangun API dan memastikan performa sistem tetap optimal untuk layanan transportasi daring Gojek.",
    program: "Teknik Komputer / Informatika",
    periode: "15 Oktober 2025 – 15 April 2026",
    deadline: "10 Oktober 2025",
    address: "Jl. Kemang Timur No.21, Jakarta Selatan",
  },
  {
    id: "3",
    title: "Mobile Developer Intern",
    company: "Tokopedia",
    location: "Jakarta",
    type: "Hybrid",
    major: "Informatika",
    logo: "/logos/tokopedia.png",
    tags: ["Flutter", "Kotlin", "Firebase"],
    description:
      "Mengembangkan fitur baru pada aplikasi Tokopedia menggunakan Flutter dan memastikan kompatibilitas lintas platform.",
    program: "Teknik Informatika / Sistem Informasi",
    periode: "20 Oktober 2025 – 20 April 2026",
    deadline: "10 Oktober 2025",
    address: "Jl. Prof. Dr. Satrio No.11, Jakarta Selatan",
  },
  {
    id: "4",
    title: "Data Analyst Intern",
    company: "Bank BRI",
    location: "Jakarta",
    type: "On-site",
    major: "Statistika",
    logo: "/logos/bri.png",
    tags: ["SQL", "Python", "Tableau"],
    description:
      "Menganalisis data transaksi nasabah untuk mendukung keputusan bisnis menggunakan alat seperti Python dan Tableau.",
    program: "Statistika / Ekonomi / Sistem Informasi",
    periode: "1 November 2025 – 1 Mei 2026",
    deadline: "20 Oktober 2025",
    address: "Jl. Jenderal Sudirman No.14, Jakarta",
  },
  {
    id: "5",
    title: "Cybersecurity Intern",
    company: "Telkomsel",
    location: "Bandung",
    type: "Remote",
    major: "Sistem Informasi",
    logo: "/logos/telkomsel.png",
    tags: ["Security", "Network", "Linux"],
    description:
      "Membantu tim keamanan siber dalam melakukan monitoring jaringan, analisis insiden, dan mitigasi ancaman keamanan.",
    program: "Sistem Informasi / Teknik Komputer",
    periode: "5 November 2025 – 5 Mei 2026",
    deadline: "25 Oktober 2025",
    address: "Jl. Gegerkalong No.11, Bandung",
  },

  // 🌿 Contoh lain-lain (singkat agar tidak kepanjangan)
  {
    id: "6",
    title: "UI/UX Designer Intern",
    company: "Traveloka",
    location: "Jakarta",
    type: "Hybrid",
    major: "Desain Komunikasi Visual",
    logo: "/logos/traveloka.png",
    tags: ["Figma", "Prototyping", "Design System"],
    description:
      "Mendesain antarmuka aplikasi Traveloka dengan pendekatan human-centered design menggunakan Figma.",
    program: "Desain Komunikasi Visual / Informatika",
    periode: "15 Oktober 2025 – 15 April 2026",
    deadline: "5 Oktober 2025",
    address: "Jl. TB Simatupang No. 2, Jakarta Selatan",
    isPremium: true,
  },
];

// 🧠 Generate dummy data tambahan hingga 100
for (let i = 7; i <= 100; i++) {
  const majors = [
    "Informatika",
    "Manajemen",
    "Akuntansi",
    "Desain Komunikasi Visual",
    "Teknik Industri",
    "Psikologi",
    "Statistika",
    "Teknik Mesin",
    "Sistem Informasi",
    "Komunikasi",
  ];
  const companies = [
    "Tokopedia",
    "Shopee",
    "Telkom Indonesia",
    "Gojek",
    "Grab Indonesia",
    "Bank BRI",
    "BNI",
    "Unilever",
    "Astra International",
    "Pertamina",
  ];
  const titles = [
    "Software Engineer Intern",
    "Marketing Intern",
    "Data Analyst Intern",
    "Finance Intern",
    "Graphic Designer Intern",
    "Project Assistant Intern",
    "Business Development Intern",
    "Social Media Intern",
    "Research Assistant Intern",
    "Customer Support Intern",
  ];
  const types = ["Remote", "Hybrid", "On-site"];
  const locations = [
    "Jakarta",
    "Bandung",
    "Surabaya",
    "Yogyakarta",
    "Semarang",
    "Bekasi",
  ];

  jobsData.push({
    id: i.toString(),
    title: titles[Math.floor(Math.random() * titles.length)],
    company: companies[Math.floor(Math.random() * companies.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    type: types[Math.floor(Math.random() * types.length)],
    major: majors[Math.floor(Math.random() * majors.length)],
    logo: `/logos/default-${(i % 5) + 1}.png`,
    tags: ["Internship", "Teamwork", "Learning"],
    description:
      "Mendukung berbagai kegiatan operasional dan pengembangan di perusahaan sesuai bidang terkait.",
    program: majors[Math.floor(Math.random() * majors.length)],
    periode: "20 Oktober 2025 – 20 April 2026",
    deadline: "15 Oktober 2025",
    address: `${locations[Math.floor(Math.random() * locations.length)]}`,
    isPremium: Math.random() < 0.15,
  });
}
