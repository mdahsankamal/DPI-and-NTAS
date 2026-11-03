export interface TCPPacket {
  sourcePort: number;
  destinationPort: number;
  sequenceNumber: number;
  acknowledgementNumber: number;
  flags: TCPFlags;
  headerLength: number;
  windowSize: number;
  checkSum: number;
  urgentPointer: number;
  payload: Buffer;
}

export interface TCPFlags {
  FIN: boolean;
  SYN: boolean;
  RST: boolean;
  PSH: boolean;
  ACK: boolean;
  URG: boolean;
}

export const parseTCPFlags = (flags: number): TCPFlags => {
  const fin = (flags & 0x01) !== 0;
  const syn = (flags & 0x02) !== 0;
  const rst = (flags & 0x04) !== 0;
  const psh = (flags & 0x08) !== 0;
  const ack = (flags & 0x10) !== 0;
  const urg = (flags & 0x20) !== 0;

  return {
    FIN: fin,
    SYN: syn,
    RST: rst,
    PSH: psh,
    ACK: ack,
    URG: urg,
  };
};

export const parseTCP = (buffer: Buffer): TCPPacket => {
  const sourcePort = buffer.readUInt16BE(0);

  const destinationPort = buffer.readUInt16BE(2);

  const sequenceNumber = buffer.readUInt32BE(4);

  const acknowledgementNumber = buffer.readUInt32BE(8);

  const headerLength = (buffer[12] >> 4) * 4;

  const flags = buffer[13];
  const parsedFlags = parseTCPFlags(flags);

  const windowSize = buffer.readUInt16BE(14);

  const checkSum = buffer.readUInt16BE(16);

  const urgentPointer = buffer.readUInt16BE(18);

  const payload = buffer.subarray(headerLength);

  return {
    sourcePort,
    destinationPort,
    sequenceNumber,
    acknowledgementNumber,
    flags: parsedFlags,
    windowSize,
    headerLength,
    checkSum,
    urgentPointer,
    payload,
  };
};
