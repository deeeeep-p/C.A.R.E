// config/index.js
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
  TASK_QUEUE_NAME: "transcript_processing_queue",
  RESULTS_QUEUE_NAME: "processing_results_queue",
};
