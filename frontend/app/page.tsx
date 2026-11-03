"use client";

import { getPackets } from "@/api/stats";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Globe,
  Network,
  Radio,
  Server,
  Shield,
} from "lucide-react";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Packet = {
  packetNumber: number;
  sourceIP: string;
  destinationIP: string;
  sourcePort?: number;
  destinationPort?: number;
  transport: string;
  application: string;
};

const protocolColors: Record<string, string> = {
  TCP: "#3b82f6",
  UDP: "#22c55e",
  Unknown: "#71717a",
};

export default function Dashboard() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPacketsData() {
      try {
        const res = await getPackets();
        setPackets(res.data);
      } catch (error) {
        console.error("Failed to fetch packets:", error);
      } finally {
        setLoading(false);
      }
    }

    const refreshPackets = () => {
      void getPacketsData();
    };

    getPacketsData();
    window.addEventListener("pcap-loaded", refreshPackets);
    return () => window.removeEventListener("pcap-loaded", refreshPackets);
  }, []);

  const stats = useMemo(() => {
    const tcp = packets.filter((packet) => packet.transport === "TCP").length;

    const udp = packets.filter((packet) => packet.transport === "UDP").length;

    const unknown = packets.filter(
      (packet) => !packet.transport || packet.transport === "Unknown",
    ).length;

    return {
      total: packets.length,
      tcp,
      udp,
      unknown,
    };
  }, [packets]);

  const protocolData = [
    {
      name: "TCP",
      value: stats.tcp,
      color: protocolColors.TCP,
    },
    {
      name: "UDP",
      value: stats.udp,
      color: protocolColors.UDP,
    },
    {
      name: "Unknown",
      value: stats.unknown,
      color: protocolColors.Unknown,
    },
  ];

  const applicationData = useMemo(() => {
    const counts: Record<string, number> = {};

    packets.forEach((packet) => {
      const application = packet.application || "Unknown";

      counts[application] = (counts[application] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [packets]);

  const topDestinations = useMemo(() => {
    const counts: Record<string, number> = {};

    packets.forEach((packet) => {
      counts[packet.destinationIP] = (counts[packet.destinationIP] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([ip, packets]) => ({
        ip,
        packets,
      }))
      .sort((a, b) => b.packets - a.packets)
      .slice(0, 8);
  }, [packets]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] p-8 text-white">
        <div className="flex items-center gap-3">
          <Activity className="animate-pulse" />
          Loading DPI data...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] p-6 text-white md:p-8">
      {/* HEADER */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Shield size={28} />
            <h1 className="text-3xl font-bold">DPI Dashboard</h1>
          </div>

          <p className="mt-2 text-zinc-400">
            Deep Packet Inspection & Network Traffic Analysis
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
          Monitoring
        </div>
      </header>

      {/* KPI CARDS */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Packets"
          value={stats.total}
          icon={<Network size={21} />}
          description="Analyzed packets"
        />

        <StatCard
          title="TCP Packets"
          value={stats.tcp}
          icon={<ArrowUpFromLine size={21} />}
          description="TCP traffic"
        />

        <StatCard
          title="UDP Packets"
          value={stats.udp}
          icon={<Radio size={21} />}
          description="UDP traffic"
        />

        <StatCard
          title="Unknown"
          value={stats.unknown}
          icon={<Activity size={21} />}
          description="Unidentified traffic"
        />
      </section>

      {/* CHARTS */}
      <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* PROTOCOL DISTRIBUTION */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Protocol Distribution</h2>

            <p className="text-sm text-zinc-500">
              Transport protocol breakdown
            </p>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {protocolData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-sm">
            {protocolData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>

        {/* APPLICATIONS */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Applications</h2>

            <p className="text-sm text-zinc-500">
              Detected application traffic
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />

                <XAxis dataKey="name" tick={{ fill: "#a1a1aa" }} />

                <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa" }} />

                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                  }}
                />

                <Bar dataKey="value" fill="#6366f1" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* TOP DESTINATIONS */}
      <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-5 flex items-center gap-3">
          <Globe size={20} />

          <div>
            <h2 className="text-lg font-semibold">Top Destinations</h2>

            <p className="text-sm text-zinc-500">
              Most contacted destination IPs
            </p>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topDestinations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: "#a1a1aa" }}
              />

              <YAxis
                type="category"
                dataKey="ip"
                width={130}
                tick={{ fill: "#a1a1aa" }}
              />

              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
              />

              <Bar dataKey="packets" fill="#8b5cf6" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* PACKET TABLE */}
      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-5">
          <div className="flex items-center gap-3">
            <Server size={20} />

            <div>
              <h2 className="text-lg font-semibold">Recent Packets</h2>

              <p className="text-sm text-zinc-500">
                Latest analyzed network packets
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 text-zinc-400">
              <tr>
                <th className="px-5 py-3 text-left">#</th>

                <th className="px-5 py-3 text-left">Source</th>

                <th className="px-5 py-3 text-left">Destination</th>

                <th className="px-5 py-3 text-left">Port</th>

                <th className="px-5 py-3 text-left">Transport</th>

                <th className="px-5 py-3 text-left">Application</th>
              </tr>
            </thead>

            <tbody>
              {packets
                .slice()
                .reverse()
                .slice(0, 15)
                .map((packet) => (
                  <tr
                    key={packet.packetNumber}
                    className="border-t border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <td className="px-5 py-3 text-zinc-500">
                      #{packet.packetNumber}
                    </td>

                    <td className="px-5 py-3 font-mono">{packet.sourceIP}</td>

                    <td className="px-5 py-3 font-mono">
                      {packet.destinationIP}
                    </td>

                    <td className="px-5 py-3 font-mono">
                      {packet.destinationPort ?? "-"}
                    </td>

                    <td className="px-5 py-3">
                      <Badge>{packet.transport || "Unknown"}</Badge>
                    </td>

                    <td className="px-5 py-3">
                      <Badge>{packet.application || "Unknown"}</Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">{title}</div>

        <div className="text-zinc-400">{icon}</div>
      </div>

      <div className="mt-3 text-3xl font-bold">{value}</div>

      <div className="mt-1 text-xs text-zinc-500">{description}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
      {children}
    </span>
  );
}
