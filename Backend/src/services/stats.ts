import { AnalyzedPacket } from "../types/packet.js";

export interface PacketStats {
  totalPackets: number;
  totalBytes: number;

  tcpPackets: number;
  udpPackets: number;
  unknownPackets: number;

  tlsPackets: number;
  ssdpPackets: number;
  httpPackets: number;
  dnsPackets: number;
  unknownApplication: number;
}

export const calculateStats = (packets: AnalyzedPacket[]): PacketStats => {
  return {
    totalPackets: packets.length,

    totalBytes: packets.reduce((total, packet) => total + packet.packetSize, 0),

    tcpPackets: packets.filter((packet) => packet.transport === "TCP").length,
    udpPackets: packets.filter((packet) => packet.transport === "UDP").length,
    unknownPackets: packets.filter((packet) => packet.transport === "Unknown")
      .length,

    tlsPackets: packets.filter((packet) => packet.application === "TLS").length,
    ssdpPackets: packets.filter((packet) => packet.application === "SSDP")
      .length,
    httpPackets: packets.filter((packet) => packet.application === "HTTP")
      .length,
    dnsPackets: packets.filter((packet) => packet.application === "DNS").length,
    unknownApplication: packets.filter(
      (packet) => packet.application === "Unknown",
    ).length,
  };
};
