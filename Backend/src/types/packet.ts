export type TransportProtocol = "TCP" | "UDP" | "Unknown";

export type ApplicationProtocol = string;

export interface AnalyzedPacket {
  packetNumber: number;

  sourceIP: string;
  destinationIP: string;

  sourcePort?: number;
  destinationPort?: number;

  transport: TransportProtocol;
  application: ApplicationProtocol;

  packetSize: number;
}
