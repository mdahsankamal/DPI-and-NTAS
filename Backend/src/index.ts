import express from "express";
import cors from "cors";

import { analyzeCapture } from "./services/capture.js";
import { getPackets, replacePackets } from "./store/packetStore.js";
import { calculateStats } from "./services/stats.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());

/*
   API ROUTES
 */

app.get("/api/packets", (req, res) => {
  res.json(getPackets());
});

app.get("/api/stats", (req, res) => {
  const stats = calculateStats(getPackets());
  res.json(stats);
});

app.post(
  "/api/pcap",
  express.raw({ type: "application/octet-stream", limit: "50mb" }),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
      res.status(400).json({ error: "Upload a PCAP or PCAPNG file." });
      return;
    }

    try {
      const packets = await analyzeCapture(req.body);
      replacePackets(packets);
      res.json({ packetCount: packets.length });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not read the capture file.";
      res.status(400).json({ error: message });
    }
  },
);

const port = Number(process.env.PORT ?? 5000);

app.listen(port, () => {
  console.log(`DPI API running on http://localhost:${port}`);
});
