// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");

// Import modules
const config = require("./config");
const websocketService = require("./services/websocketService");
const rabbitmqService = require("./services/rabbitmqService");
const departmentRoutes = require("./routes/departmentRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
// --- Basic Server Setup ---
const app = express();
const server = http.createServer(app);

// --- Middleware ---
app.use(cors({ origin: "*" })); // Be more specific in production!
app.use(express.json());

// --- Service Initialization ---
// 1. Initialize WebSocket Service and get the function to send messages to clients
const { sendToClient } = websocketService.initialize(server);

// 2. Initialize RabbitMQ Service, passing it the function to send WebSocket results
rabbitmqService.connect({ sendToClient });

// --- API Routes ---
app.use("/api/departments", departmentRoutes);
app.use("/api/emergency", emergencyRoutes);

// --- Root Route for Health Check ---
app.get("/", (req, res) => {
  res.send(`Server is healthy. Listening on port ${config.PORT}.`);
});

// --- Start Server ---
server.listen(config.PORT, () => {
  console.log(`🚀 HTTP and WebSocket server listening on port ${config.PORT}`);
});

// --- Graceful Shutdown ---
const shutdown = () => {
  console.log("SIGINT received. Shutting down gracefully.");
  server.close(() => {
    console.log("HTTP server closed.");
    rabbitmqService.closeConnection();
    process.exit(0);
  });
};

// process.on("SIGINT", shutdown);
// process.on("SIGTERM", shutdown);
