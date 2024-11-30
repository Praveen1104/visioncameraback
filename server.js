const express = require("express");
const http = require("http");
require("dotenv").config();
const WebSocket = require("ws");
const cors = require("cors"); // Import CORS
const connectDB = require("./src/config/db"); // Adjust the path as necessary
const { logger } = require("./src/logger/logger"); // Adjust the path as necessary
const { router } = require("./src/routes/routes");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const cron = require("node-cron");
const VisionX = require("./src/models/VisionXDetails.model."); // Adjust based on your model path
const { eraseOldHistory } = require("./src/services/kit/visionX.service");
const historyModel = require("./src/models/history.model");

const app = express();
const PORT = process.env.PORT || 3000;

process.env.GOOGLE_APPLICATION_CREDENTIALS;
// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.use("/uploads", express.static("/src/public"));
initializeApp({
  credential: applicationDefault(),
  projectId: "potion-for-creators",
});
// Create an HTTP server
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });
(async () => {
  try {
    console.log("Running cleanup now for testing...");
    await eraseOldHistory(historyModel);
    console.log("Immediate cleanup test completed successfully.");
  } catch (error) {
    console.error("Error during immediate cleanup test:", error);
  }
})();
// WebSocket connection handling
wss.on("connection", (ws) => {
  logger.info("New client connected");

  ws.on("close", () => {
    logger.info("Client disconnected");
  });
});

// Sample route
app.get("/api", (req, res) => {
  res.send("Hello, World!");
});
app.use("/", router);
// Connect to MongoDB and start watching for changes
connectDB(wss);
app.post("/send", function (req, res) {
  const receivedToken = req.body.fcmToken;
  console.log(receivedToken);
  const message = {
    notification: {
      title: "Notif",
      body: "This is a Test Notification",
    },
    token: "YOUR FCM TOKEN HERE",
  };

  getMessaging()
    .send(message)
    .then((response) => {
      res.status(200).json({
        message: "Successfully sent message",
        token: receivedToken,
      });
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      res.status(400);
      res.send(error);
      console.log("Error sending message:", error);
    });
});

// Schedule the function to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  await eraseOldHistory(VisionX);
  console.log("Daily cleanup of old history completed.");
});
// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
