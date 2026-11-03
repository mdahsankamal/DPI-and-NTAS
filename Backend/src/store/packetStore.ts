import { AnalyzedPacket } from "../types/packet.js";

const packets: AnalyzedPacket[] = [];

export const addPacket = (packet: AnalyzedPacket): void => {
  packets.push(packet);
};

export const replacePackets = (newPackets: AnalyzedPacket[]): void => {
  packets.splice(0, packets.length, ...newPackets);
};

export const getPackets = (): AnalyzedPacket[] => {
  return packets;
};
