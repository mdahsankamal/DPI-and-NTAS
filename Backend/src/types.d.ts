declare module "pcap-ng-parser" {
  import { Transform } from "node:stream";

  interface InterfaceInfo {
    linkType: number;
    snapLen: number;
    name?: string;
  }

  interface ParsedPacket {
    interfaceId: number;
    timestampHigh: number;
    timestampLow: number;
    data: Buffer;
  }

  export default class PCAPNGParser extends Transform {
    endianess: "LE" | "BE";
    interfaces: InterfaceInfo[];

    constructor();

    on(event: "data", listener: (packet: ParsedPacket) => void): this;

    on(event: "interface", listener: (info: InterfaceInfo) => void): this;

    on(event: "error", listener: (error: Error) => void): this;
  }
}
