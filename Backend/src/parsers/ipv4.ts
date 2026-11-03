export interface IPv4Packet {
  version: number;
  headerLength: number;
  totalLength: number;
  ttl: number;
  protocol: number;
  protocolName: IPProtocol;
  sourceIP: string;
  destinationIP: string;
}

export type IPProtocol = "ICMP" | "TCP" | "UDP" | "Unknown";

export const parseIPv4 = (buffer: Buffer): IPv4Packet => {
  const firstByte = buffer[0];

  const version = firstByte >> 4;
  const ihl = firstByte & 0x0f;
  const headerLength = ihl * 4;

  const totalLength = buffer.readUInt16BE(2);

  const ttl = buffer[8];

  const protocol = buffer[9];

  const protocolName = getIPProtocolName(protocol);

  const sourceIP = formatIPv4(buffer.subarray(12, 16));

  const destinationIP = formatIPv4(buffer.subarray(16, 20));

  return {
    version,
    headerLength,
    totalLength,
    ttl,
    protocol,
    protocolName,
    sourceIP,
    destinationIP,
  };
};

export const getIPProtocolName = (protocol: number): IPProtocol => {
  switch (protocol) {
    case 1:
      return "ICMP";

    case 6:
      return "TCP";

    case 17:
      return "UDP";

    default:
      return "Unknown";
  }
};

export const formatIPv4 = (buffer: Buffer): string => {
  return [...buffer].join(".");
};
