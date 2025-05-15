import { controllers, agents, codeMap } from "./registry.js";

function handleControllerConnection(socket, pairingCode) {
  const deviceId = codeMap.get(pairingCode);

  if (!deviceId || !agents.has(deviceId)) {
    console.log("❌ Invalid or expired pairing code");
    socket.emit("error", "Invalid pairing code");
    return socket.disconnect(true);
  }

  controllers.set(deviceId, socket);
  console.log(`📱 Controller paired to → ${deviceId}`);

  // ✅ Forward command to agent with optional ACK
  socket.on("command", ({ type, payload }) => {
    const agentSocket = agents.get(deviceId);
    if (!agentSocket) {
      return socket.emit("response_from_agent", {
        type,
        result: "❌ Agent unavailable",
      });
    }

    agentSocket.emit(
      "command",
      { type, payload },
      (response) => {
        if (response && typeof response === "object") {
          socket.emit("response_from_agent", {
            type,
            result: response.result || "✅ Success",
          });
        } else {
          socket.emit("response_from_agent", {
            type,
            result: "⚠️ Agent sent invalid response",
          });
        }
      }
    );
  });

  // 🧼 Clean up on disconnect
  socket.on("disconnect", () => {
    controllers.delete(deviceId);
    console.log(`❌ Controller disconnected → ${deviceId}`);
  });
}

export default handleControllerConnection;
