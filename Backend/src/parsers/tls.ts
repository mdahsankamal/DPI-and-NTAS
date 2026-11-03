export type TLSContentType =
  | "ChangeCipherSpec"
  | "Alert"
  | "Handshake"
  | "ApplicationData"
  | "Unknown";

export interface TLSRecord {
  contentType: TLSContentType;
  versionMajor: number;
  versionMinor: number;
  length: number;
}

export const getContentTypeName = (contentType: number): TLSContentType => {
  switch (contentType) {
    case 0x14:
      return "ChangeCipherSpec";
    case 0x15:
      return "Alert";
    case 0x16:
      return "Handshake";
    case 0x17:
      return "ApplicationData";

    default:
      return "Unknown";
  }
};

export const parseTLSRecord = (buffer: Buffer): TLSRecord => {
  const contentType = buffer[0];
  const contentTypeName = getContentTypeName(contentType);
  const versionMajor = buffer[1];
  const versionMinor = buffer[2];
  const length = buffer.readUInt16BE(3);

  return {
    contentType: contentTypeName,
    versionMajor,
    versionMinor,
    length,
  };
};
