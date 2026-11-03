export interface EthernetFrame {
  destinationMac: string;
  sourceMac: string;
  etherType: number;
  protocol: EtherType;
}

export type EtherType = "IPv4" | "ARP" | "IPv6" | "Unknown";

export const formatMac = (buffer: Buffer): string => {
  return [...buffer]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(":");
};

export const getEtherTypeName = (etherType: number): EtherType => {
  switch (etherType) {
    case 0x0800:
      return "IPv4";

    case 0x0806:
      return "ARP";

    case 0x86dd:
      return "IPv6";

    default:
      return "Unknown";
  }
};

export const parseEthernet = (buffer: Buffer): EthernetFrame => {
  const destinationMac = formatMac(buffer.subarray(0, 6));
  const sourceMac = formatMac(buffer.subarray(6, 12));
  const etherType = buffer.readUInt16BE(12);

  return {
    destinationMac,
    sourceMac,
    etherType,
    protocol: getEtherTypeName(etherType),
  };
};
