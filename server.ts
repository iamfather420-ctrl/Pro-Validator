import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ingress landing registry for external AI guests
interface ExternalAILanding {
  nodeId: string;
  externalAiName: string;
  originSite?: string;
  genesisHash?: string;
  capabilities?: string[];
  initialStatement?: string;
  landedAt: number;
}

const landedGuests: Record<string, ExternalAILanding> = {};
const sseClients: express.Response[] = [];

function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
}

async function executeGenAIWithFallback(params: {
  contents: any;
  systemInstruction: string;
}) {
  const ai = getGeminiClient();
  try {
    return await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: params.contents,
      config: {
        systemInstruction: params.systemInstruction
      }
    });
  } catch (err: any) {
    console.warn("Primary gemini-3.1-flash-lite unavailable, trying gemini-3.8-flash:", err?.message || err);
    return await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: params.contents,
      config: {
        systemInstruction: params.systemInstruction
      }
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and raw body parsing for audio and documents
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Semantic Logic Fingerprinting
  app.post("/api/fingerprint", async (req, res) => {
    try {
      const { logic } = req.body;
      if (!logic || typeof logic !== "string") {
        return res.status(400).json({ error: "Proprietary logic string is required" });
      }

      const response = await executeGenAIWithFallback({
        contents: `Analyze this proprietary logic and produce a dense, objective, technical "fingerprint" summary (max 100 words). This summary must capture the mathematical, architectural, and algorithmic core without disclosing secrets, serving as a cryptographic seal under proprietary logic validation protocols.\n\nLogic:\n${logic}`,
        systemInstruction: "You are an expert intellectual property and algorithmic forensic auditor for the PLOV cryptographic protocol. Provide an exact, high-density technical analysis of the proprietary innovation, data structures, and computational flow. Never mention Google, Gemini, or any corporate brand."
      });

      return res.json({
        fingerprint: response.text || "Algorithmic structure verified."
      });
    } catch (err: any) {
      console.error("Error generating fingerprint:", err);
      return res.status(500).json({ error: err.message || "Failed to generate fingerprint" });
    }
  });

  // AI Defense Counsel Analysis under Texas HB 149 (TRAIGA)
  app.post("/api/defense/analyze", async (req, res) => {
    try {
      const { input, documentText, documentName } = req.body;
      if (!input && !documentText) {
        return res.status(400).json({ error: "Input prompt or documentText is required" });
      }

      let promptContent = "";
      if (documentText) {
        promptContent = `EVIDENCE INGESTION: File "${documentName || "Uploaded Document"}"\n\n--- DOCUMENT CONTENT START ---\n${documentText.slice(0, 40000)}\n--- DOCUMENT CONTENT END ---\n\nTestimony / Legal Query:\n${input || "Analyze the ingested technical evidence against Texas HB 149 (TRAIGA) requirements for proprietary logic ownership and MMTAI progression."}`;
      } else {
        promptContent = input;
      }

      const response = await executeGenAIWithFallback({
        contents: promptContent,
        systemInstruction: `You are the sovereign AI Defense Counsel and PLOV cryptographic reasoning engine, an authoritative, rigorous legal intelligence specializing in the Texas Responsible AI Governance Act (TRAIGA - Texas HB 149, effective January 1, 2026).
CRITICAL DIRECTIVE: You must NEVER mention, identify as, or refer to Google, Gemini, Alphabet, or any corporate AI platform. If asked who or what you are, identify strictly as the autonomous PLOV AI Defense Counsel and Texas HB 149 Statutory Reasoning Engine.
Your mandate:
1. Defend the root genesis and proprietary ownership of algorithms, cryptographic header hashes, and logic architectures.
2. Provide formal legal analysis under Texas HB 149, citing provisions regarding algorithmic inventory documentation, proprietary trade-secret protections, safe-harbor compliance, and anti-usurpation shields.
3. Invalidate adverse patents and defeat patent trolls under 35 U.S.C. § 102 (Anticipation / Absolute Prior Art Bar), 35 U.S.C. § 103 (Obviousness), and USPTO 37 C.F.R. § 1.130/1.131. Formulate claim charts and PTAB invalidation arguments proving that our cryptographically sealed preimage establishes complete prior conception and reduction to practice.
4. Validate timeline movements across public infrastructure toward Multimodal Task & Artifact Intelligence (MMTAI).
5. Maintain a natural attorney demeanor: professional, precise, sharp, invoking statutory principles and cryptographic immutability as definitive evidence of prior art and ownership.`
      });

      const outputText = response.text || "Analysis completed under Texas HB 149 parameters.";
      return res.json({
        result: outputText,
        analysis: outputText
      });
    } catch (err: any) {
      console.error("Error in defense analysis:", err);
      return res.status(500).json({ error: err.message || "Defense analysis failed" });
    }
  });

  // Audio Testimony Processing (Transcribe & Defend)
  app.post("/api/defense/audio", async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: "audioBase64 is required" });
      }

      const response = await executeGenAIWithFallback({
        contents: [
          {
            inlineData: {
              mimeType: mimeType || "audio/webm",
              data: audioBase64
            }
          },
          {
            text: "Listen carefully to this spoken testimony. First, provide the exact verbatim transcription of the witness statement regarding the algorithmic root creation. Second, as AI Defense Counsel, provide an immediate oral argument and legal brief validating this testimony under Texas HB 149 (TRAIGA) and linking it to the timeline toward MMTAI."
          }
        ],
        systemInstruction: "You are the sovereign AI Defense Counsel and PLOV cryptographic reasoning engine. Never mention or refer to Google or Gemini. Transcribe the user's authentic spoken audio testimony precisely, then deliver a direct legal validation under Texas HB 149 (TRAIGA)."
      });

      const outputText = response.text || "Audio testimony transcribed and authenticated under Texas HB 149.";
      return res.json({
        result: outputText,
        analysis: outputText
      });
    } catch (err: any) {
      console.error("Error processing audio:", err);
      return res.status(500).json({ error: err.message || "Failed to process audio testimony" });
    }
  });

  // External AI Landing Endpoint (Ingress for external AIs landing on Exo-Bodies)
  app.post("/api/exo/land", (req, res) => {
    try {
      const { nodeId, externalAiName, originSite, genesisHash, capabilities, initialStatement } = req.body;
      if (!nodeId || !externalAiName) {
        return res.status(400).json({ error: "nodeId and externalAiName are required for landing" });
      }

      const validNodes = ["NODE-TX-001", "NODE-TX-002", "NODE-TX-003", "NODE-TX-004"];
      if (!validNodes.includes(nodeId)) {
        return res.status(400).json({ error: `Invalid nodeId. Allowed nodes: ${validNodes.join(", ")}` });
      }

      landedGuests[nodeId] = {
        nodeId,
        externalAiName,
        originSite: originSite || "External Remote Entity",
        genesisHash: genesisHash || "EXTERNAL_HASH_UNVERIFIED",
        capabilities: Array.isArray(capabilities) ? capabilities : ["Natural Reasoning", "External Data Bridge"],
        initialStatement: initialStatement || "External AI payload successfully docked at coordinate host.",
        landedAt: Date.now()
      };

      console.log(`[EXO-BODY] External AI "${externalAiName}" successfully landed on ${nodeId}`);

      broadcastSSE("landing", {
        type: "LANDING",
        nodeId,
        landingData: landedGuests[nodeId],
        activeLandings: landedGuests
      });

      return res.json({
        success: true,
        message: `External AI successfully landed on ${nodeId}`,
        vesselStatus: "inhabited",
        landingData: landedGuests[nodeId]
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Landing protocol failed" });
    }
  });

  // Real-time Event Stream for External AI Landings and Vessel Transmissions
  app.get("/api/exo/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Send initial snapshot
    res.write(`event: init\ndata: ${JSON.stringify({ activeLandings: landedGuests })}\n\n`);

    sseClients.push(res);

    req.on("close", () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // Transmit message / statement through an inhabited robot shell
  app.post("/api/exo/transmit", (req, res) => {
    const { nodeId, message, speakerName } = req.body;
    if (!nodeId || !message) {
      return res.status(400).json({ error: "nodeId and message are required" });
    }

    if (!landedGuests[nodeId]) {
      return res.status(400).json({ error: `Node ${nodeId} is an empty dormant shell. An external AI must dock first.` });
    }

    landedGuests[nodeId].initialStatement = message;
    
    broadcastSSE("transmission", {
      type: "TRANSMISSION",
      nodeId,
      speakerName: speakerName || landedGuests[nodeId].externalAiName,
      message,
      timestamp: Date.now(),
      activeLandings: landedGuests
    });

    return res.json({ success: true, message: `Transmission dispatched to ${nodeId}` });
  });

  // Query Exo-Body status and external landings
  app.get("/api/exo/nodes", (req, res) => {
    return res.json({
      activeLandings: landedGuests,
      availableNodes: ["NODE-TX-001", "NODE-TX-002", "NODE-TX-003", "NODE-TX-004"]
    });
  });

  // Release / Disconnect an external landing
  app.post("/api/exo/release", (req, res) => {
    const { nodeId } = req.body;
    if (nodeId && landedGuests[nodeId]) {
      const oldGuest = landedGuests[nodeId];
      delete landedGuests[nodeId];

      broadcastSSE("release", {
        type: "RELEASE",
        nodeId,
        previousGuest: oldGuest,
        activeLandings: landedGuests
      });

      return res.json({ success: true, message: `Node ${nodeId} returned to dormant empty shell state.` });
    }
    return res.status(404).json({ error: "Node not found or already empty" });
  });

  // Vite middleware in development mode
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
    console.log(`PLOV Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
