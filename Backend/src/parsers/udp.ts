export interface UDPPacket {
  sourcePort: number;
  destinationPort: number;
  length: number;
  checkSum: number;
  payload: Buffer;
}

export const parseUDP = (buffer: Buffer): UDPPacket => {
  const sourcePort = buffer.readUInt16BE(0);

  const destinationPort = buffer.readUInt16BE(2);

  const length = buffer.readUInt16BE(4);

  const checkSum = buffer.readUInt16BE(6);

  const payload = buffer.subarray(8); // UDP header is always bytes next are payload

  return {
    sourcePort,
    destinationPort,
    length,
    checkSum,
    payload,
  };
};
