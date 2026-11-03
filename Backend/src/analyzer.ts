import { parseEthernet } from "./parsers/ethernet.js";
import { parseIPv4 } from "./parsers/ipv4.js";
import { parseTCP } from "./parsers/tcp.js";
import { parseUDP } from "./parsers/udp.js";
import { AnalyzedPacket } from "./types/packet.js";
import { detectApplication } from "./applicationDetector.js";

export const analyzePacket = (
  packetNumber: number,
  packetData: Buffer,
): AnalyzedPacket | null => {
  if (packetData.length < 14) {
    return null;
  }

  let sourcePort = 0;
  let destinationPort = 0;
  let transport: "TCP" | "UDP" | "Unknown" = "Unknown";
  let payload: Buffer<ArrayBufferLike> = Buffer.alloc(0);

  const ethernet = parseEthernet(packetData);

  if (ethernet.protocol !== "IPv4") {
    return null;
  }

  const ipv4Buffer = packetData.subarray(14);
  if (ipv4Buffer.length < 20) {
    return null;
  }

  const version = ipv4Buffer[0] >> 4;
  const headerLength = (ipv4Buffer[0] & 0x0f) * 4;
  const totalLength = ipv4Buffer.readUInt16BE(2);
  if (
    version !== 4 ||
    headerLength < 20 ||
    headerLength > ipv4Buffer.length ||
    totalLength < headerLength ||
    totalLength > ipv4Buffer.length
  ) {
    return null;
  }

  const ipv4 = parseIPv4(ipv4Buffer);

  if (ipv4.protocolName === "TCP") {
    const tcpBuffer = ipv4Buffer.subarray(ipv4.headerLength, totalLength);
    if (tcpBuffer.length < 20) {
      return null;
    }

    const tcp = parseTCP(tcpBuffer);
    if (tcp.headerLength < 20 || tcp.headerLength > tcpBuffer.length) {
      return null;
    }

    payload = tcpBuffer.subarray(tcp.headerLength);

    sourcePort = tcp.sourcePort;
    destinationPort = tcp.destinationPort;
    transport = "TCP";
  }

  if (ipv4.protocolName === "UDP") {
    const udpBuffer = ipv4Buffer.subarray(ipv4.headerLength, totalLength);
    if (udpBuffer.length < 8) {
      return null;
    }

    const udp = parseUDP(udpBuffer);
    if (udp.length < 8 || udp.length > udpBuffer.length) {
      return null;
    }

    payload = udpBuffer.subarray(8, udp.length);

    sourcePort = udp.sourcePort;
    destinationPort = udp.destinationPort;
    transport = "UDP";
  }

  return {
    packetNumber,

    sourceIP: ipv4.sourceIP,
    destinationIP: ipv4.destinationIP,

    sourcePort: sourcePort || undefined,
    destinationPort: destinationPort || undefined,

    transport,
    application: detectApplication(
      transport,
      sourcePort,
      destinationPort,
      payload,
    ),

    packetSize: packetData.length,
  };
};
