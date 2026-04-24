import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT not found in environment variables.");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Endpoint to send push notifications
  app.post("/api/send-push", async (req, res) => {
    const { title, body, topic, userIds } = req.body;

    try {
      const db = admin.firestore();
      let targetTokens: string[] = [];

      if (topic === 'admin') {
        const tokensSnap = await db.collection("artifacts")
          .doc(process.env.VITE_PROJECT_ID || "gen-lang-client-0807701307")
          .collection("public")
          .doc("data")
          .collection("fcm_tokens")
          .get();
        
        tokensSnap.forEach(doc => {
          const data = doc.data();
          if (data.tokens && Array.isArray(data.tokens)) {
            targetTokens.push(...data.tokens);
          }
        });
      } else if (userIds && Array.isArray(userIds)) {
        for (const userId of userIds) {
          const doc = await db.collection("artifacts")
            .doc(process.env.VITE_PROJECT_ID || "gen-lang-client-0807701307")
            .collection("public")
            .doc("data")
            .collection("fcm_tokens")
            .doc(userId)
            .get();
          
          if (doc.exists) {
            const data = doc.data();
            if (data?.tokens) targetTokens.push(...data.tokens);
          }
        }
      }

      if (targetTokens.length === 0) {
        return res.json({ success: true, message: "No tokens found to send." });
      }

      // Remove duplicates
      targetTokens = [...new Set(targetTokens)];

      const message = {
        notification: { title, body },
        tokens: targetTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      res.json({ success: true, response });
    } catch (error) {
      console.error("Error sending push notification:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
