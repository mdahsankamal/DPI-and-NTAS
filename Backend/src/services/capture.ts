import { Readable } from "node:stream";
import PCAPNGParser from "pcap-ng-parser";

import { analyzePacket } from "../analyzer.js";
import type { AnalyzedPacket } from "../types/packet.js";

const isPcapNg = (data: Buffer): boolean =>
  data.length >= 4 &&
  data[0] === 0x0a &&
  data[1] === 0x0d &&
  data[2] === 0x0d &&
  data[3] === 0x0a;

const getClassicPcapByteOrder = (
  data: Buffer,
): { littleEndian: boolean; headerLength: number } => {
  if (data.length < 24) {
    throw new Error("The capture file is too small to be a valid PCAP file.");
  }

  const magic = data.subarray(0, 4).toString("hex");
  switch (magic) {
    case "d4c3b2a1":
    case "4d3cb2a1":
      return { littleEndian: true, headerLength: 24 };
    case "a1b2c3d4":
    case "a1b23c4d":
      return { littleEndian: false, headerLength: 24 };
    default:
      throw new Error(
        "Unsupported capture format. Select a PCAP or PCAPNG file.",
      );
  }
};

const parseClassicPcap = (data: Buffer): Buffer[] => {
  const { littleEndian, headerLength } = getClassicPcapByteOrder(data);
  const readUInt32 = littleEndian
    ? (offset: number) => data.readUInt32LE(offset)
    : (offset: number) => data.readUInt32BE(offset);

  if (readUInt32(20) !== 1) {
    throw new Error("Only Ethernet capture files are supported.");
  }

  const packets: Buffer[] = [];
  let offset = headerLength;

  while (offset < data.length) {
    if (data.length - offset < 16) {
      throw new Error("The PCAP file has an incomplete packet header.");
    }

    const capturedLength = readUInt32(offset + 8);
    offset += 16;

    if (capturedLength > data.length - offset) {
      throw new Error("The PCAP file has an incomplete packet.");
    }

    packets.push(data.subarray(offset, offset + capturedLength));
    offset += capturedLength;
  }

  return packets;
};

const parsePcapNg = async (data: Buffer): Promise<Buffer[]> => {
  const parser = new PCAPNGParser();
  const packets: Buffer[] = [];
  parser.on("data", (packet) => packets.push(packet.data));

  return new Promise((resolve, reject) => {
    parser.once("error", reject);
    parser.once("close", () => resolve(packets));
    Readable.from([data]).pipe(parser);
  });
};

export const analyzeCapture = async (
  data: Buffer,
): Promise<AnalyzedPacket[]> => {
  if (data.length === 0) {
    throw new Error("The capture file is empty.");
  }

  const rawPackets = isPcapNg(data)
    ? await parsePcapNg(data)
    : parseClassicPcap(data);

  return rawPackets.flatMap((packet, index) => {
    const analyzed = analyzePacket(index + 1, packet);
    return analyzed ? [analyzed] : [];
  });
};
