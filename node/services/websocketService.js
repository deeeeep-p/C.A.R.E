const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const clients = new Map();

const initialize = (server) => {
  wss = new WebSocket.Server({ server });
  wss.on("connection", (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, ws);
    console.log(`Client connected with ID: ${clientId}`);
    // Immediately send the client its ID
    ws.send(JSON.stringify({ type: "clientId", clientId: clientId }));
    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    });
    ws.on("error", (err) => {
      console.error(`WebSocket error for client ${clientId}:`, err);
    });
  });

  console.log("✅ WebSocket service initialized.");

  // Return the sender function so other services can use it
  return { sendToClient };
};

const sendToClient = (clientId, data) => {
  const clientWs = clients.get(clientId);
  if (clientWs && clientWs.readyState === WebSocket.OPEN) {
    clientWs.send(JSON.stringify(data));
    return true;
  } else {
    console.warn(`Client ${clientId} not found or connection not open.`);
    return false;
  }
};

module.exports = {
  initialize,
  sendToClient,
};
