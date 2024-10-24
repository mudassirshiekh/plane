import "@/core/config/sentry-config.js";

import express from "express";
import expressWs from "express-ws";
import * as Sentry from "@sentry/node";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import * as Y from "yjs";
// core hocuspocus server
import { getHocusPocusServer } from "@/core/hocuspocus-server.js";
// helpers
import { errorHandler } from "@/core/helpers/error-handler.js";
import { applyUpdatesToBinaryData } from "@/core/helpers/document.js";
import { getAllDocumentFormatsFromRichTextEditorBinaryData } from "@/core/helpers/issue.js";
import { logger, manualLogger } from "@/core/helpers/logger.js";

const app = express();
expressWs(app);

app.set("port", process.env.PORT || 3000);

// Security middleware
app.use(helmet());

// Middleware for response compression
app.use(
  compression({
    level: 6,
    threshold: 5 * 1000,
  })
);

// Logging middleware
app.use(logger);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors middleware
app.use(cors());

const router = express.Router();

const HocusPocusServer = await getHocusPocusServer().catch((err) => {
  manualLogger.error("Failed to initialize HocusPocusServer:", err);
  process.exit(1);
});

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

router.ws("/collaboration", (ws, req) => {
  try {
    HocusPocusServer.handleConnection(ws, req);
  } catch (err) {
    manualLogger.error("WebSocket connection error:", err);
    ws.close();
  }
});

app.post("/resolve-document-conflicts", (req, res) => {
  const { original_document, updates } = req.body;
  try {
    if (original_document === undefined || updates === undefined) {
      res.status(400).send({
        message: "Missing required fields",
      });
      throw new Error("Missing required fields");
    }
    // convert from base64 to buffer
    const originalDocumentBuffer = original_document ? Buffer.from(original_document, "base64") : null;
    const updatesBuffer = updates ? Buffer.from(updates, "base64") : null;
    // decode req.body
    const decodedOriginalDocument = originalDocumentBuffer ? new Uint8Array(originalDocumentBuffer) : new Uint8Array();
    const decodedUpdates = updatesBuffer ? new Uint8Array(updatesBuffer) : new Uint8Array();
    // resolve conflicts
    let resolvedDocument: Uint8Array;
    if (decodedOriginalDocument.length === 0) {
      const yDoc = new Y.Doc();
      Y.applyUpdate(yDoc, decodedUpdates);
      resolvedDocument = Y.encodeStateAsUpdate(yDoc);
    } else {
      resolvedDocument = applyUpdatesToBinaryData(decodedOriginalDocument, decodedUpdates);
    }

    const { contentBinaryEncoded, contentHTML, contentJSON } =
      getAllDocumentFormatsFromRichTextEditorBinaryData(resolvedDocument);

    res.status(200).json({
      description_html: contentHTML,
      description_binary: contentBinaryEncoded,
      description: contentJSON,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

app.use(process.env.LIVE_BASE_PATH || "/live", router);

app.use((_req, res) => {
  res.status(404).send("Not Found");
});

Sentry.setupExpressErrorHandler(app);

app.use(errorHandler);

const liveServer = app.listen(app.get("port"), () => {
  manualLogger.info(`Plane Live server has started at port ${app.get("port")}`);
});

const gracefulShutdown = async () => {
  manualLogger.info("Starting graceful shutdown...");

  try {
    // Close the HocusPocus server WebSocket connections
    await HocusPocusServer.destroy();
    manualLogger.info("HocusPocus server WebSocket connections closed gracefully.");

    // Close the Express server
    liveServer.close(() => {
      manualLogger.info("Express server closed gracefully.");
      process.exit(1);
    });
  } catch (err) {
    manualLogger.error("Error during shutdown:", err);
    process.exit(1);
  }

  // Forcefully shut down after 10 seconds if not closed
  setTimeout(() => {
    manualLogger.error("Forcing shutdown...");
    process.exit(1);
  }, 10000);
};

// Graceful shutdown on unhandled rejection
process.on("unhandledRejection", (err: any) => {
  manualLogger.info("Unhandled Rejection: ", err);
  manualLogger.info(`UNHANDLED REJECTION! 💥 Shutting down...`);
  gracefulShutdown();
});

// Graceful shutdown on uncaught exception
process.on("uncaughtException", (err: any) => {
  manualLogger.info("Uncaught Exception: ", err);
  manualLogger.info(`UNCAUGHT EXCEPTION! 💥 Shutting down...`);
  gracefulShutdown();
});
