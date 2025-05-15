import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import socketConnectionHandler from "./sockets/connectionHandler.js";
dotenv.config();

const app = express();
app.use(cors());
app.get("/", (_, res) => res.send("✅ Remote Control Server is live"));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", socketConnectionHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
