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
// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
// // const express = require("express");
// // const http = require("http");
// // const WebSocket = require("ws");
// // const cors = require("cors"); // Import CORS
// // const connectDB = require("./src/config/db"); // Adjust the path as necessary
// // const { logger } = require("./src/logger/logger"); // Adjust the path as necessary
// // const app = express();
// // const PORT = process.env.PORT || 3000;

// // // Middleware
// // app.use(cors()); // Enable CORS
// // app.use(express.json()); // Parse JSON request bodies

// // // Create an HTTP server
// // const server = http.createServer(app);

// // // Set up WebSocket server
// // const wss = new WebSocket.Server({ server });

// // // WebSocket connection handling
// // wss.on("connection", (ws) => {
// //   logger.info("New client connected");

// //   ws.on("close", () => {
// //     logger.info("Client disconnected");
// //   });
// // });

// // app.use("/uploads", express.static("src/public"));
// // // Sample route
// // app.get("/api", (req, res) => {
// //   res.send("Hello, World!");
// // });
// // // Connect to MongoDB and start watching for changes
// // connectDB(wss);

// // // Start the server
// // server.listen(PORT, () => {
// //   logger.info(Server is running on port ${PORT});
// // });

// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const WebSocket = require("ws");
// const mongoose = require("mongoose");
// const visioXDetails = require("./src/models/VisionXDetails.model.");
// const PersonalInfo = require("./src/models/PersonalInfo.model");
// const { router } = require("./src/routes/routes");
// const { logger } = require("./src/logger/logger");
// require("dotenv").config();

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// // CORS configuration
// const corsOptions = {
//   origin: "http://localhost:5173", // Replace with your client’s origin
//   methods: ["GET", "POST", "PATCH", "PUT", "DELETE"], // Allowed methods
//   credentials: true, // Allow credentials if needed
// };

// app.use(cors(corsOptions));
// app.use(cors());
// app.get("/api", (req, res) => {
//   res.send("Hello, World!");
// });
// app.use("/", router);

// // MongoDB connection function
// const connectDB = async () => {
//   const mongoURI = process.env.MONGODB_URI;
//   console.log(mongoURI, "checking.....");
//   try {
//     await mongoose.connect(mongoURI, {
//       autoCreate: true,
//       autoIndex: false,
//     });
//     logger.info("MongoDB connected successfully");

//     // Set up change streams for MongoDB collections
//     const changeStream = visioXDetails.watch();
//     changeStream.on("change", (change) => {
//       if (
//         change.operationType === "insert" ||
//         change.operationType === "update" ||
//         change.operationType === "delete"
//       ) {
//         wss.clients.forEach((client) => {
//           if (client.readyState === WebSocket.OPEN) {
//             client.send(
//               JSON.stringify({
//                 message: "Data updated",
//                 change: change,
//               })
//             );
//           }
//         });
//       }
//     });

//     const personalStream = PersonalInfo.watch();
//     personalStream.on("change", (change) => {
//       if (
//         change.operationType === "insert" ||
//         change.operationType === "update" ||
//         change.operationType === "delete"
//       ) {
//         wss.clients.forEach((client) => {
//           if (client.readyState === WebSocket.OPEN) {
//             client.send(
//               JSON.stringify({
//                 message: "Data updated",
//                 change: change,
//               })
//             );
//           }
//         });
//       }
//     });
//   } catch (err) {
//     logger.error(`MongoDB connection error: ${err}`);
//     process.exit(1);
//   }
// };

// // Start the server and connect to the database
// const startServer = async () => {
//   await connectDB();

//   server.listen(process.env.PORT || 3000, () => {
//     console.log(`Server running on port ${process.env.PORT || 3000}`);
//   });
// };

// // Start the server
// startServer();
