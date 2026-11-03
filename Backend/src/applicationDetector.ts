type Transport = "TCP" | "UDP" | "Unknown";

export const detectApplication = (
  transport: Transport,
  sourcePort: number,
  destinationPort: number,
  payload: Buffer,
): string => {
  const port = destinationPort || sourcePort;

  // DNS
  if (port === 53) {
    return "DNS";
  }

  // DHCP
  if (port === 67 || port === 68) {
    return "DHCP";
  }

  // SSDP
  if (port === 1900) {
    return "SSDP";
  }

  // SSH
  if (port === 22) {
    return "SSH";
  }

  // FTP
  if (port === 21 || port === 20) {
    return "FTP";
  }

  // SMTP
  if (port === 25 || port === 587) {
    return "SMTP";
  }

  // HTTP signature detection
  const text = payload.toString("ascii");

  const httpMethods = [
    "GET ",
    "POST ",
    "PUT ",
    "DELETE ",
    "HEAD ",
    "OPTIONS ",
    "PATCH ",
  ];

  if (
    httpMethods.some((method) => text.startsWith(method)) ||
    text.startsWith("HTTP/1.")
  ) {
    return "HTTP";
  }

  // TLS handshake signature
  if (
    transport === "TCP" &&
    payload.length >= 3 &&
    payload[0] === 0x16 &&
    payload[1] === 0x03
  ) {
    return "TLS";
  }

  // HTTPS port fallback
  if (port === 443) {
    return "HTTPS";
  }

  return "Unknown";
};
