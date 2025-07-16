// controllers/emergencyController.js
const { v4: uuidv4 } = require("uuid");
const rabbitmqService = require("../services/rabbitmqService");
const config = require("../config");

const processEmergencyRequest = async (req, res) => {
  console.log("object");
  const { transcript, lat, lng, clientId } = req.body;

  if (!transcript || lat === undefined || lng === undefined || !clientId) {
    return res.status(400).json({
      error:
        "Missing 'transcript', 'lat', 'lng', or 'clientId' in request body.",
    });
  }

  const requestId = uuidv4();
  const messagePayload = {
    requestId,
    clientId,
    transcript,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  };

  try {
    const published = rabbitmqService.publishToQueue(
      config.TASK_QUEUE_NAME,
      messagePayload
    );

    if (published) {
      console.log(
        `Message queued with Request ID: ${requestId} for Client ID: ${clientId}`
      );
      res.status(202).json({
        message: "Emergency processing request received and queued.",
        requestId: requestId,
      });
    } else {
      console.warn(
        `Queue buffer full. Message not sent for Request ID: ${requestId}`
      );
      res.status(503).json({
        error: "Service temporarily unavailable. Message queue is full.",
      });
    }
  } catch (error) {
    console.error("Error publishing message to RabbitMQ:", error);
    res
      .status(500)
      .json({ error: "Failed to queue emergency processing request." });
  }
};

module.exports = {
  processEmergencyRequest,
};
