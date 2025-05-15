

// Import necessary modules
const express = require("express");
const http = require("http"); // Node.js core http module
const WebSocket = require("ws"); // WebSocket library
const pool = require("./db"); // Assuming your PostgreSQL pool configuration is in ./db.js
const bodyParser = require("body-parser"); // To parse JSON request bodies
const amqp = require("amqplib"); // RabbitMQ client library
const dotenv = require("dotenv"); // To load environment variables
const { v4: uuidv4 } = require("uuid"); // To generate unique IDs
const cors = require("cors");

// Load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 3000; // Use port from environment or default to 3000
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json()); // Use express.json() built-in middleware
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: ["Content-Type"]
};
app.use(cors(corsOptions));

// --- WebSocket Connection Management ---
// In-memory map to store active WebSocket connections, keyed by a client ID
// Create an HTTP server to host both Express and WebSocket server
const server = http.createServer(app);

// Create a WebSocket server instance, attaching it to the HTTP server
const wss = new WebSocket.Server({ server });
// In a real application, you'd need a more robust way to manage connections
// across potentially multiple Node.js instances and handle disconnections/reconnections.
const clients = new Map();

// Event listener for new WebSocket connections
wss.on("connection", function connection(ws, req) {
  // Generate a unique ID for this client connection
  // In a real app, you might get a user ID or session ID from the request/cookies
  const clientId = uuidv4();
  clients.set(clientId, ws);

  console.log(`Client connected with ID: ${clientId}`);

  // Send the client ID back to the frontend immediately
  // The frontend needs this ID to include in subsequent HTTP requests
  ws.send(JSON.stringify({ type: "clientId", clientId: clientId }));

  // Event listener for messages received from a client over WebSocket
  ws.on("message", function incoming(message) {
    console.log(`Received message from client ${clientId}: ${message}`);
    // Handle potential messages from the frontend over WebSocket if needed
    // For this flow, the primary communication from frontend is via HTTP POST
  });

  // Event listener for WebSocket connection closure
  ws.on("close", function close() {
    console.log(`Client disconnected with ID: ${clientId}`);
    // Remove the client from the map
    clients.delete(clientId);
  });

  // Event listener for WebSocket errors
  ws.on("error", function error(err) {
    console.error(`WebSocket error for client ${clientId}:`, err);
    // The 'close' event will typically follow an error, so cleanup happens there
  });
});

console.log("WebSocket server started.");

// --- RabbitMQ Configuration ---
// Get RabbitMQ connection URL from environment variables
// Default to localhost if not set (assuming RabbitMQ is running locally)
// Ensure RABBITMQ_URL is set in your Node.js project's .env file
const rabbitmqUrl =
  process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"; // Use your RabbitMQ credentials and host
const taskQueueName = "transcript_processing_queue"; // Queue to publish tasks to (Python worker consumes here)
const resultsQueueName = "processing_results_queue"; // Queue to consume results from (Python worker publishes here)

// Variables to hold the RabbitMQ connection and channels
let connection = null;
let publishChannel = null; // Channel for publishing tasks
let consumeChannel = null; // Channel for consuming results

// --- In-memory storage for results (deprecated with WebSockets, but kept for reference) ---
// const resultsStore = {};

// Initialize Groq with your API key


// Function to connect to RabbitMQ and set up channels
async function connectRabbitMQ() {
  try {
    console.log(`Connecting to RabbitMQ at ${rabbitmqUrl}...`);
    connection = await amqp.connect(rabbitmqUrl);
    console.log("RabbitMQ connection established.");

    // Create a channel for publishing tasks
    publishChannel = await connection.createChannel();
    console.log("RabbitMQ publish channel created.");

    // Assert the task queue exists (Node.js producer declares it)
    // Durable queues survive broker restarts
    await publishChannel.assertQueue(taskQueueName, {
      durable: true,
    });
    console.log(`Task queue '${taskQueueName}' asserted.`);

    // Create a channel for consuming results
    consumeChannel = await connection.createChannel();
    console.log("RabbitMQ consume channel created.");

    // Assert the results queue exists (Node.js consumer declares it, Python worker also declares)
    // Durable queues survive broker restarts
    await consumeChannel.assertQueue(resultsQueueName, {
      durable: true,
    });
    console.log(`Results queue '${resultsQueueName}' asserted.`);

    // Set up the consumer for the results queue
    // onResultReceived will be called when a message arrives
    // noAck: false means we will manually acknowledge messages after processing
    consumeChannel.consume(resultsQueueName, onResultReceived, {
      noAck: false,
    });
    console.log(`Started consuming from results queue '${resultsQueueName}'.`);

    // Handle connection closure events
    connection.on("close", function (err) {
      if (err) {
        console.error("[AMQP] connection closed with error", err);
        // Attempt to reconnect on error after a delay
        setTimeout(connectRabbitMQ, 5000);
      } else {
        console.log("[AMQP] connection closed");
      }
    });

    // Handle connection error events
    connection.on("error", function (err) {
      if (err) {
        console.error("[AMQP] connection error", err);
        // Attempt to reconnect on error after a delay
        setTimeout(connectRabbitMQ, 5000);
      }
    });
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    // Retry connection after a delay
    setTimeout(connectRabbitMQ, 5000);
  }
}

// Function to handle received result messages from the results queue
function onResultReceived(msg) {
  console.log("hiiiii");
  // Check if the message is null (e.g., consumer cancelled)
  if (msg === null) {
    console.log("[AMQP] Consumer cancelled by server.");
    return;
  }

  let resultPayload;
  let requestId;
  let clientId; // Expecting clientId in the result payload now

  try {
    // Parse the message body (assuming it's JSON)
    resultPayload = JSON.parse(msg.content.toString());
    requestId = resultPayload.requestId; // Get the original request ID
    clientId = resultPayload.clientId; // Get the client ID

    console.log(
      ` [x] Received result for Request ID: ${requestId} for Client ID: ${clientId}`
    );
    // console.log("Result Payload:", JSON.stringify(resultPayload, null, 2)); // Log the full payload

    // --- Send the result back to the specific client via WebSocket ---
    const clientWs = clients.get(clientId);

    if (clientWs && clientWs.readyState === WebSocket.OPEN) {
      // Add a type to the message so the frontend knows it's a result
      const messageToSend = {
        type: "processingResult",
        payload: resultPayload, // Send the full result payload
      };
      clientWs.send(JSON.stringify(messageToSend));
      console.log(
        `Sent result for Request ID: ${requestId} to Client ID: ${clientId} via WebSocket.`
      );
    } else {
      console.warn(
        `Client ${clientId} not found or WebSocket not open. Cannot send result for Request ID: ${requestId}.`
      );
      // In a real application, you might store this result in the DB
      // and the client can retrieve it later via a REST API or on reconnect.
    }

    // --- Acknowledge the message ---
    // Tell RabbitMQ the message has been successfully processed
    consumeChannel.ack(msg);
    console.log(
      ` [x] Acknowledged result message for Request ID: ${requestId}.`
    );
  } catch (error) {
    console.error(
      `Error processing received result message for delivery tag ${
        method ? method.deliveryTag : "unknown"
      }: ${error}`
    );
    // Decide how to handle errors parsing or processing the result message payload:
    // - Reject the message (consumeChannel.reject(msg, false)) to send to dead-letter queue
    // - Nack the message (consumeChannel.nack(msg, false, true)) to put it back on the queue (use with caution for parsing errors)
    // - Acknowledge and log (as done below) - message is lost but doesn't block the queue
    // For simplicity, we'll acknowledge the message to prevent getting stuck on a bad message
    // but log the error for investigation.
    if (consumeChannel) {
      consumeChannel.ack(msg);
      console.log(
        ` [x] Acknowledged result message after error for delivery tag: ${
          method ? method.deliveryTag : "unknown"
        }.`
      );
    } else {
      console.error(
        "Consume channel not available to acknowledge message after error."
      );
    }
  }
}

// Connect to RabbitMQ when the application starts
connectRabbitMQ();

// --- Your existing routes (modified the /emergency route) ---

// Example GET route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Example GET all schools route (using your existing pool)
app.get("/schools", async (req, res) => {
  // Changed route from "/" to "/schools" to avoid conflict
  try {
    const data = await pool.query(`SELECT * FROM schools`);
    return res.status(200).json({ data: data.rows }); // Changed 201 to 200 for GET success
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({ error: "Failed to fetch schools" });
  }
});

// Example POST add school route (using your existing pool)
app.post("/schools", async (req, res) => {
  // Changed route from "/" to "/schools" to avoid conflict
  const { name, location } = req.body;
  try {
    // Assuming 'location' here is a string address, not lat/lng for PostGIS
    // If 'location' is lat/lng, you'd need ST_SetSRID(ST_MakePoint(lng, lat), 4326) here
    await pool.query(`INSERT INTO schools (name, address) VALUES ($1, $2)`, [
      name,
      location,
    ]);
    return res.status(201).json({ message: "School added successfully" });
  } catch (error) {
    console.error("Error adding school:", error);
    res.status(500).json({ error: "Failed to add school" });
  }
});

// Route to setup department tables (using your existing pool)
app.post("/setup", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Add this line for debugging
    const { dept } = req.body;
    
    if (!dept) {
      return res.status(400).json({ error: "Department name is required" });
    }

    console.log("Setting up table for:", dept);
    
    // Basic validation for dept name to prevent SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(dept)) {
      return res.status(400).json({ error: "Invalid department name" });
    }

    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${dept}( 
        id SERIAL PRIMARY KEY, 
        name VARCHAR(100),
        location GEOGRAPHY(Point, 4326)
      );`
    );

    return res.status(201).json({
      message: `${dept} Table created successfully`
    });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({ error: `Failed to set up table: ${error.message}` });
  }
});

// Routes to add/get Fire Brigade stations (using your existing pool)
app.post("/fireBrigade", async (req, res) => {
  const { name, lat, lng } = req.body;
  try {
    await pool.query(
      `INSERT INTO firebrigade (name, location) VALUES ($1,ST_SetSRID(ST_MakePoint($2, $3), 4326))`,
      [name, lng, lat]
    );
    return res
      .status(201)
      .json({ message: "Fire Brigade station added successfully" });
  } catch (error) {
    console.error("Error adding Fire Brigade station:", error);
    res.status(500).json({ error: "Failed to add Fire Brigade station" });
  }
});

app.get("/fireBrigade", async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM fireBrigade`);
    return res.status(200).json({ data: data.rows }); // Changed 201 to 200
  } catch (error) {
    console.error("Error fetching Fire Brigade stations:", error);
    res.status(500).json({ error: "Failed to fetch Fire Brigade stations" });
  }
});

// Route to find places within radius (using your existing controller/dist.js)
// NOTE: This route is now less relevant in the RabbitMQ flow, as the spatial lookup
// happens in the Python worker. You might keep it for testing purposes.
const { findPlacesWithinRadius } = require("./controller/dist.js"); // Assuming this is your Node.js version
app.post("/find_dist", async (req, res) => {
  const { lat, lng, radius, dept } = req.body;
  try {
    // Assuming findPlacesWithinRadius in controller/dist.js returns the closest single place
    const place = await findPlacesWithinRadius(lat, lng, radius, dept); // Assuming it returns a single place
    return res.status(200).json({ data: place }); // Return the single place
  } catch (error) {
    console.error("Error finding places within radius:", error);
    res.status(500).json({ error: "Failed to find places" });
  }
});

// Routes to add/get Hospital stations (using your existing pool)
app.post("/hospital", async (req, res) => {
  const { name, lat, lng } = req.body;
  try {
    await pool.query(
      `INSERT INTO hospital (name, location) VALUES ($1,ST_SetSRID(ST_MakePoint($2, $3), 4326))`,
      [name, lng, lat]
    );
    return res.status(201).json({ message: "Hospital added successfully" }); // Corrected message
  } catch (error) {
    console.error("Error adding Hospital:", error);
    res.status(500).json({ error: "Failed to add Hospital" });
  }
});

app.get("/hospital", async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM hospital`);
    return res.status(200).json({ data: data.rows }); // Changed 201 to 200
  } catch (error) {
    console.error("Error fetching Hospitals:", error);
    res.status(500).json({ error: "Failed to fetch Hospitals" });
  }
});

// Routes to add/get Police stations (using your existing pool)
app.post("/police", async (req, res) => {
  const { name, lat, lng } = req.body;
  try {
    await pool.query(
      `INSERT INTO police (name, location) VALUES ($1,ST_SetSRID(ST_MakePoint($2, $3), 4326))`,
      [name, lng, lat]
    );
    return res
      .status(201)
      .json({ message: "Police station added successfully" });
  } catch (error) {
    console.error("Error adding Police station:", error);
    res.status(500).json({ error: "Failed to add Police station" });
  }
});

app.get("/police", async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM police`);
    return res.status(200).json({ data: data.rows }); // Changed 201 to 200
  } catch (error) {
    console.error("Error fetching Police stations:", error);
    res.status(500).json({ error: "Failed to fetch Police stations" });
  }
});

// --- Modified /emergency route to publish message to RabbitMQ ---
// Removed the direct call to processTranscript and spatial lookup here.
app.post("/emergency", async (req, res) => {
  /* """
    Handles POST requests from the frontend to initiate emergency processing.
    Expects a JSON request body with 'transcript', 'lat', 'lng', and 'clientId' keys.
    Publishes a message to the RabbitMQ task queue for asynchronous processing
    by the Python worker.
    """ */
  // Get the request body data
  const { transcript, lat, lng, clientId } = req.body; // Expecting clientId now
  console.log(clientId);
  // Basic input validation
  if (!transcript || lat === undefined || lng === undefined || !clientId) {
    // Validate clientId
    return res.status(400).json({
      error:
        "Missing 'transcript', 'lat', 'lng', or 'clientId' in request body.",
    });
  }

  // Generate a unique ID for this request
  const requestId = uuidv4();

  // Check if RabbitMQ publish channel is available
  if (!publishChannel) {
    console.error(
      "RabbitMQ publish channel not available. Cannot publish message."
    );
    // Return a 503 Service Unavailable if the message queue is not ready
    return res.status(503).json({
      error:
        "Service temporarily unavailable. RabbitMQ connection not established.",
    });
  }

  try {
    // Create the message payload to send to the Python worker
    const messagePayload = {
      requestId: requestId, // Include the unique request ID for tracking
      clientId: clientId, // Include the client ID to send result back to the correct client
      transcript: transcript,
      lat: parseFloat(lat), // Ensure lat/lng are numbers
      lng: parseFloat(lng),
    };

    // Convert the payload to a buffer (RabbitMQ messages are buffers)
    const messageBuffer = Buffer.from(JSON.stringify(messagePayload));

    // Publish the message to the task queue
    // options: { persistent: true } makes the message durable, recommended for tasks
    const published = publishChannel.sendToQueue(taskQueueName, messageBuffer, {
      persistent: true,
    });

    if (published) {
      console.log(
        `Message published to queue '${taskQueueName}' with Request ID: ${requestId} for Client ID: ${clientId}`
      );
      // Send a successful response back to the client immediately
      // 202 Accepted is the standard status for requests that have been accepted
      // for processing but not yet completed.
      res.status(202).json({
        message: "Emergency processing request received and queued.",
        requestId: requestId, // Return the request ID so the frontend can track it
      });
    } else {
      // If sendToQueue returns false, the buffer is full. Handle this gracefully.
      console.warn(
        `Queue '${taskQueueName}' buffer full. Message not sent for Request ID: ${requestId}`
      );
      // Return a 503 Service Unavailable if the queue is backed up
      res.status(503).json({
        error: "Service temporarily unavailable. Message queue is full.",
      });
    }
  } catch (error) {
    console.error("Error publishing message to RabbitMQ:", error);
    // Handle errors during message publishing (e.g., channel closed unexpectedly)
    res
      .status(500)
      .json({ error: "Failed to queue emergency processing request." });
  }
});

// --- Removed the /emergency/results/:requestId route ---
// Results are now sent via WebSocket, not retrieved via polling.
/*
app.get('/emergency/results/:requestId', (req, res) => { // Nested under /emergency for clarity
    const requestId = req.params.requestId;

    // Basic validation for request ID
    if (!requestId) {
        return res.status(400).json({ error: "Missing request ID in path." });
    }

    // Check if the result is in our in-memory store
    const result = resultsStore[requestId];

    if (result) {
        // Result found, send it back
        // You might want to clean up the in-memory store after sending the result
        // delete resultsStore[requestId]; // Uncomment if you want to remove from memory after fetching
        res.status(200).json(result);
    } else {
        // Result not found (either still processing or invalid ID)
        // In a real application, you would query the database here to check status
        // and potentially return a status like { status: "processing" } or 404 if not found at all.
        res.status(404).json({ message: "Result not found or still processing. Please try again later." });
    }
});
*/

// Code to start the HTTP and WebSocket server
server.listen(port, () => {
  console.log(`HTTP and WebSocket server listening on port ${port}`);
  console.log(`RabbitMQ URL: ${rabbitmqUrl}`);
});

// Optional: Close the RabbitMQ connection and WebSocket server when the Node.js app shuts down
process.on("exit", (code) => {
  console.log(`About to exit with code: ${code}`);
  // Close WebSocket server
  if (wss) {
    wss.close(() => console.log("WebSocket server closed."));
  }
  // Close RabbitMQ channels and connection
  if (publishChannel) {
    publishChannel.close();
    console.log("RabbitMQ publish channel closed.");
  }
  if (consumeChannel) {
    consumeChannel.close();
    console.log("RabbitMQ consume channel closed.");
  }
  if (connection) {
    connection.close();
    console.log("RabbitMQ connection closed.");
  }
});

// Optional: Handle graceful shutdown on SIGINT (e.g., Ctrl+C)
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully.");
  process.exit(0); // Exit cleanly, triggering the 'exit' event
});
