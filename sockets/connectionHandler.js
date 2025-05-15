import handleAgent from "./agent.js";
import handleController from "./controller.js";

function socketConnectionHandler(socket) {
  const { role, pairingCode } = socket.handshake.auth || {};
    console.log(role)
  if (role === "agent") {
    handleAgent(socket);
  } else if (role === "controller") {
    handleController(socket, pairingCode);
  } else {
    console.log("❌ Unknown role");
    socket.disconnect(true);
  }
}

export default socketConnectionHandler;
