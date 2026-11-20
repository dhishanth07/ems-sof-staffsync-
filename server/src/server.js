import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import employeeRoutes from "./routes/employeeRoutes.js";
import leaveRequestRoutes from "./routes/leaveRequestRoutes.js";

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});
app.use("/api/employees", employeeRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }
  console.error(error);
  return res.status(500).json({ message: "An unexpected server error occurred." });
});

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required. Add it to server/.env.");
  }

  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`Employee API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start employee API:", error.message);
  process.exitCode = 1;
});
