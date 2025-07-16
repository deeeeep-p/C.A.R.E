// services/rabbitmqService.js
const amqp = require("amqplib");
const config = require("../config");

let connection = null;
let publishChannel = null;
let consumerChannel = null;

// This will be set by the connect function
let serviceDependencies = {};

const connect = async (dependencies) => {
  serviceDependencies = dependencies; // Store dependencies like sendToClient
  try {
    console.log(`Connecting to RabbitMQ at ${config.RABBITMQ_URL}...`);
    connection = await amqp.connect(config.RABBITMQ_URL);

    // Setup channels and consumers
    await setupChannels();
    await setupConsumer();

    console.log("✅ RabbitMQ service initialized and connected.");
    connection.on("error", (err) => {
      console.error("[AMQP] connection error", err);
      reconnect();
    });
    connection.on("close", () => {
      console.error("[AMQP] connection closed. Reconnecting...");
      reconnect();
    });
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error.message);
    reconnect();
  }
};

const setupChannels = async () => {
  publishChannel = await connection.createChannel();
  await publishChannel.assertQueue(config.TASK_QUEUE_NAME, { durable: true });

  consumerChannel = await connection.createChannel();
  await consumerChannel.assertQueue(config.RESULTS_QUEUE_NAME, {
    durable: true,
  });
};

const setupConsumer = async () => {
  console.log(`Consuming from queue '${config.RESULTS_QUEUE_NAME}'`);
  consumerChannel.consume(config.RESULTS_QUEUE_NAME, onResultReceived, {
    noAck: false,
  });
};

const onResultReceived = (msg) => {
  if (!msg) return;
  try {
    const resultPayload = JSON.parse(msg.content.toString());
    const { requestId, clientId } = resultPayload;

    console.log(
      `[x] Received result for Request ID: ${requestId} for Client ID: ${clientId}`
    );

    // Use the injected dependency to send data via WebSocket
    const sent = serviceDependencies.sendToClient(clientId, {
      type: "processingResult",
      payload: resultPayload,
    });

    if (sent) {
      console.log(
        `Sent result for Request ID: ${requestId} to Client ID: ${clientId} via WebSocket.`
      );
    } else {
      console.warn(
        `Could not send result for Request ID: ${requestId} to Client ID: ${clientId}.`
      );
      // Handle failed delivery, e.g., store in DB for later retrieval.
    }

    consumerChannel.ack(msg);
  } catch (error) {
    console.error("Error processing result message:", error);
    // Acknowledge the message to prevent it from being re-queued in a loop
    consumerChannel.ack(msg);
  }
};

const publishToQueue = (queueName, messagePayload) => {
  if (!publishChannel) {
    console.error("Cannot publish message: Publish channel is not available.");
    return false;
  }
  const buffer = Buffer.from(JSON.stringify(messagePayload));
  return publishChannel.sendToQueue(queueName, buffer, { persistent: true });
};

const reconnect = () => {
  setTimeout(() => connect(serviceDependencies), 5000);
};

const closeConnection = () => {
  if (connection) {
    connection.close();
    console.log("RabbitMQ connection closed.");
  }
};

module.exports = {
  connect,
  publishToQueue,
  closeConnection,
};
