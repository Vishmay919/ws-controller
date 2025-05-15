import { shouldThrottle } from "../utils/throttler.js";
import { generateDeviceId, generatePairingCode } from "../utils/id.js";
import { agents, codeMap, controllers } from "./registry.js";
import { throttleThis } from "../config/constants.js";

function handleAgentConnection(socket) {
  const deviceId = generateDeviceId();
  const pairingCode = generatePairingCode();

  agents.set(deviceId, socket);
  codeMap.set(pairingCode, deviceId);

  console.log(`🖥️ Agent connected → ${deviceId} (code: ${pairingCode})`);
  socket.emit("pairing_code", { code: pairingCode });

  // ✅ Listen for controller -> command
  let lastSentCommand = null;

  socket.on("command", ({ type, payload }, ack) => {
    const nowCommand = JSON.stringify({ type, payload });

    // 🧼 Drop duplicates for mouse_move
    if (type === "mouse_move" && lastSentCommand === nowCommand) {
      return;
    }

    lastSentCommand = nowCommand;
    console.log("📥 Received command:", type, payload);

    // 🕒 Throttle only specific command types
    const isThrottled = throttleThis.includes(type) && shouldThrottle(deviceId, type, 50);

    // ✅ Perform the action regardless of throttling (placeholder for actual logic)
    // e.g., robot.moveMouse(payload.dx, payload.dy);

    const result = `✅ Executed ${type}`;

    if (isThrottled) {
      console.log(`⏱️ Throttled response for: ${type}`);
      return; // Do not respond — action executed silently
    }

    if (typeof ack === "function") {
      ack({ result });
    } else {
      const controllerSocket = controllers.get(deviceId);
      if (controllerSocket) {
        controllerSocket.emit("response_from_agent", { type, result });
      }
    }
  });

  // 🔁 Optional legacy/manual agent_response support
  socket.on("agent_response", ({ type, result }) => {
    const controllerSocket = controllers.get(deviceId);
    if (controllerSocket) {
      controllerSocket.emit("response_from_agent", { type, result });
    }
  });

  // 🧼 Clean up on disconnect
  socket.on("disconnect", () => {
    agents.delete(deviceId);
    codeMap.delete(pairingCode);
    console.log(`❌ Agent disconnected → ${deviceId}`);
  });
}

export default handleAgentConnection;
