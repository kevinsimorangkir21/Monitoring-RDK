"use client";

import { useEffect, useRef } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Clock3,
  ClipboardCheck,
  ScanLine,
  Receipt,
  FileStack,
  FileBarChart,
  Wallet,
  CircleCheck,
  AlertTriangle,
  Bell,
} from "lucide-react";

export default function DashboardPage() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const summary = [
    {
      title: "Inbound",
      value: "1,245",
      icon: ArrowDownCircle,
      color: "bg-red-600",
      growth: "+12%",
      positive: true,
    },
    {
      title: "Outbound",
      value: "987",
      icon: ArrowUpCircle,
      color: "bg-blue-600",
      growth: "+8%",
      positive: true,
    },
    {
      title: "Progress",
      value: "87%",
      icon: Activity,
      color: "bg-green-600",
      growth: "+3%",
      positive: true,
    },
    {
      title: "Pending",
      value: "18",
      icon: Clock3,
      color: "bg-yellow-500",
      growth: "-2%",
      positive: false,
    },
  ];

  const progress = [
    { title: "Report Daily", percent: 92, icon: ClipboardCheck },
    { title: "Scan Out DC", percent: 84, icon: ScanLine },
    { title: "Claim Vendor", percent: 63, icon: Receipt },
    { title: "Gantungan Faktur", percent: 74, icon: FileStack },
    { title: "Report WO-WT", percent: 58, icon: FileBarChart },
    { title: "Setoran", percent: 96, icon: Wallet },
  ];

  const activity = [
    { title: "Report Daily berhasil dibuat", time: "08:20", status: "success" },
    { title: "Scan Out DC selesai", time: "08:45", status: "success" },
    { title: "Claim Vendor menunggu approval", time: "09:10", status: "warning" },
    { title: "WO-WT belum dikirim", time: "09:35", status: "danger" },
  ];

  const chartData = [
    { day: "Mon", inbound: 90, outbound: 70 },
    { day: "Tue", inbound: 72, outbound: 86 },
    { day: "Wed", inbound: 100, outbound: 96 },
    { day: "Thu", inbound: 63, outbound: 78 },
    { day: "Fri", inbound: 81, outbound: 92 },
    { day: "Sat", inbound: 45, outbound: 40 },
    { day: "Sun", inbound: 70, outbound: 58 },
  ];

  const pendingTasks = [
    "Claim Vendor",
    "Report WO-WT",
    "Gantungan Faktur",
    "Setoran Cabang A",
    "Inbound Jakarta",
    "Outbound Bekasi",
  ];

  const operations = [
    { no: "OP240701", area: "Jakarta", pic: "Kevin", progress: 92, status: "Completed" },
    { no: "OP240702", area: "Bekasi", pic: "Anin", progress: 75, status: "Progress" },
    { no: "OP240703", area: "Bandung", pic: "Rizky", progress: 58, status: "Pending" },
    { no: "OP240704", area: "Surabaya", pic: "Dimas", progress: 100, status: "Completed" },
    { no: "OP240705", area: "Semarang", pic: "Budi", progress: 44, status: "Delay" },
  ];

  useEffect(() => {
    let Chart;
    const loadChart = async () => {
      try {
        const module = await import("chart.js");
        Chart = module.Chart;

        // Register all required components
        const {
          BarController,
          BarElement,
          CategoryScale,
          LinearScale,
          Tooltip,
          Legend,
        } = module;
        Chart.register(
          BarController,
          BarElement,
          CategoryScale,
          LinearScale,
          Tooltip,
          Legend
        );
      } catch {
        // Fallback: try window.Chart (if loaded via CDN)
        Chart = window.Chart;
      }

      if (!Chart || !chartRef.current) return;

      // Destroy previous instance to avoid canvas reuse error
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: chartData.map((d) => d.day),
          datasets: [
            {
              label: "Inbound",
              data: chartData.map((d) => d.inbound),
              backgroundColor: "#dc2626",
              borderRadius: 4,
              barPercentage: 0.55,
            },
            {
              label: "Outbound",
              data: chartData.map((d) => d.outbound),
              backgroundColor: "#2563eb",
              borderRadius: 4,
              barPercentage: 0.55,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1f2937",
              titleColor: "#f9fafb",
              bodyColor: "#d1d5db",
              padding: 10,
              cornerRadius: 8,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: "#6b7280", font: { size: 12 } },
            },
            y: {
              grid: { color: "#f3f4f6" },
              border: { display: false },
              ticks: { color: "#6b7280", font: { size: 11 } },
            },
          },
        },
      });
    };

    loadChart();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  const statusBadge = (status) => {
    const map = {
      Completed: "bg-green-100 text-green-700",
      Progress: "bg-blue-100 text-blue-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Delay: "bg-red-100 text-red-700",
    };
    return `px-3 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Operational Monitoring Dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        {summary.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">{item.title}</p>
                <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
                <p
                  className={`text-sm mt-3 ${
                    item.positive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.growth} dibanding kemarin
                </p>
              </div>
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.color}`}
              >
                <item.icon className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress + Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Progress Module */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-6">Progress Module</h2>
          <div className="space-y-5">
            {progress.map((item) => (
              <div key={item.title}>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <item.icon size={18} className="text-red-600" />
                    <span>{item.title}</span>
                  </div>
                  <span className="font-semibold">{item.percent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-red-600"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="text-red-600" />
            <h2 className="font-semibold text-lg">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {activity.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start border-b border-gray-100 last:border-none pb-4"
              >
                <div className="flex gap-3">
                  {item.status === "success" && (
                    <CircleCheck className="text-green-500 mt-1" size={18} />
                  )}
                  {item.status === "warning" && (
                    <Clock3 className="text-yellow-500 mt-1" size={18} />
                  )}
                  {item.status === "danger" && (
                    <AlertTriangle className="text-red-500 mt-1" size={18} />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Inbound vs Outbound</h2>

        {/* Legend */}
        <div className="flex gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600" />
            <span className="text-sm text-gray-500">Inbound</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600" />
            <span className="text-sm text-gray-500">Outbound</span>
          </div>
        </div>

        <div className="relative h-72">
          <canvas ref={chartRef} />
        </div>
      </div>

      {/* Pending Task & Operational Process */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Pending Task</h2>
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div
                key={task}
                className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-200"
              >
                <span className="font-medium text-gray-700">{task}</span>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent OP */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Operational Process</h2>
          </div>
          <table className="w-full">
            <thead className="bg-red-700 text-white">
              <tr>
                <th className="text-left px-6 py-4">No OP</th>
                <th className="text-left">Area</th>
                <th className="text-left">PIC</th>
                <th className="text-left">Progress</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((item) => (
                <tr
                  key={item.no}
                  className="border-b border-gray-100 hover:bg-red-50 transition"
                >
                  <td className="px-6 py-5 font-semibold">{item.no}</td>
                  <td>{item.area}</td>
                  <td>{item.pic}</td>
                  <td className="w-72">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 rounded-full bg-gray-200">
                        <div
                          className="bg-red-600 h-3 rounded-full"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {item.progress}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={statusBadge(item.status)}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}