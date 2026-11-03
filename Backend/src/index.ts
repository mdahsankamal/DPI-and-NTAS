import express from "express";
import cors from "cors";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(
  cors({
    origin: "http://localhost:3001",
  }),
);

app.use(express.json());

/* API ROUTES */

app.listen(port, () => {
  console.log(`DPI API running on http://localhost:${port}`);
});
