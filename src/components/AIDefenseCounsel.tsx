import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gavel, 
  Mic, 
  MicOff, 
  FileUp, 
  Users, 
  Cpu, 
  ShieldAlert, 
  Scale, 
  History,
  Network,
  Globe,
  Zap,
  ChevronRight,
  Terminal,
  ExternalLink,
  UserPlus,
  Bot,
  Activity,
  CheckCircle2,
  Radio,
  FileText,
  Volume2,
  VolumeX,
  Copy,
  Info,
  MessageSquare,
  Send,
  Sparkles,
  X,
  LogOut,
  RadioTower,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ValidationRecord } from "./LogicValidator";

interface ExternalLandingData {
  nodeId: string;
  externalAiName: string;
  originSite?: string;
  genesisHash?: string;
  capabilities?: string[];
  initialStatement?: string;
  landedAt: number;
}

interface ExoBody {
  id: string;
  coordinates: string;
  externalGuest?: ExternalLandingData;
}

interface DefenseLog {
  id: string;
  type: "audio" | "document" | "analysis";
  title: string;
  content: string;
  timestamp: number;
  metadata?: {
    filename?: string;
    filesize?: number;
    audioDuration?: number;
    transcription?: string;
  };
}

interface AIDefenseCounselProps {
  records?: ValidationRecord[];
}

export default function AIDefenseCounsel({ records = [] }: AIDefenseCounselProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = React.useState<Blob[]>([]);
  const [logs, setLogs] = React.useState<DefenseLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // Direct Text Legal Inquiry State
  const [textInquiry, setTextInquiry] = React.useState("");
  const [isQueryingText, setIsQueryingText] = React.useState(false);

  // Spoken Oral Argument State
  const [speakingLogId, setSpeakingLogId] = React.useState<string | null>(null);

  // Interactive Docking Modal State
  const [dockingTarget, setDockingTarget] = React.useState<ExoBody | null>(null);
  const [dockName, setDockName] = React.useState("Nexus-7");
  const [dockOrigin, setDockOrigin] = React.useState("https://sovereign-agent.net");
  const [dockHash, setDockHash] = React.useState("7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069");
  const [dockStatement, setDockStatement] = React.useState("Autonomous agent docking completed under Texas HB 149 Safe Harbor provisions.");

  // Transmit Message Modal State for Inhabited Vessels
  const [transmitTarget, setTransmitTarget] = React.useState<ExoBody | null>(null);
  const [transmitMessage, setTransmitMessage] = React.useState("");
  const [isTransmitting, setIsTransmitting] = React.useState(false);

  // 4 Explicit Empty Shells ready for external AI docking
  const [exoBodies, setExoBodies] = React.useState<ExoBody[]>([
    { id: "EXO-SHELL-ALPHA", coordinates: "NODE-TX-001" },
    { id: "EXO-SHELL-BETA", coordinates: "NODE-TX-002" },
    { id: "EXO-SHELL-GAMMA", coordinates: "NODE-TX-003" },
    { id: "EXO-SHELL-DELTA", coordinates: "NODE-TX-004" },
  ]);

  // Real listener for external AI landings via API, SSE, and postMessage
  const checkExternalLandings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/exo/nodes");
      if (res.ok) {
        const data = await res.json();
        const activeLandings = data.activeLandings as Record<string, ExternalLandingData>;
        setExoBodies((prev) =>
          prev.map((body) => ({
            ...body,
            externalGuest: activeLandings?.[body.coordinates]
          }))
        );
      }
    } catch {
      // serverless or local mode
    }
  }, []);

  React.useEffect(() => {
    checkExternalLandings();

    // Server-Sent Events (SSE) Real-Time Autonomous Stream
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource("/api/exo/stream");
      
      evtSource.addEventListener("init", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.activeLandings) {
            setExoBodies((prev) =>
              prev.map((body) => ({
                ...body,
                externalGuest: data.activeLandings[body.coordinates]
              }))
            );
          }
        } catch {}
      });

      evtSource.addEventListener("landing", (e) => {
        try {
          const data = JSON.parse(e.data);
          toast.success(`External AI "${data.landingData.externalAiName}" landed on ${data.nodeId}!`);
          setExoBodies((prev) =>
            prev.map((body) => ({
              ...body,
              externalGuest: data.activeLandings?.[body.coordinates]
            }))
          );
        } catch {}
      });

      evtSource.addEventListener("release", (e) => {
        try {
          const data = JSON.parse(e.data);
          toast.info(`Node ${data.nodeId} disengaged and returned to dormant shell.`);
          setExoBodies((prev) =>
            prev.map((body) => ({
              ...body,
              externalGuest: data.activeLandings?.[body.coordinates]
            }))
          );
        } catch {}
      });

      evtSource.addEventListener("transmission", (e) => {
        try {
          const data = JSON.parse(e.data);
          toast.info(`Signal transmission on ${data.nodeId} (${data.speakerName}): "${data.message}"`);
          setExoBodies((prev) =>
            prev.map((body) => ({
              ...body,
              externalGuest: data.activeLandings?.[body.coordinates]
            }))
          );
        } catch {}
      });
    } catch {
      // fallback to polling if SSE is not available in environment
    }

    const interval = setInterval(checkExternalLandings, 8000);

    // Also listen for cross-window / iframe postMessage landings
    const handleMessage = (event: MessageEvent) => {
      try {
        const payload = event.data;
        if (payload && payload.type === "EXTERNAL_AI_LANDING" && payload.nodeId) {
          fetch("/api/exo/land", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).then(() => checkExternalLandings());
          toast.info(`External AI signal detected on ${payload.nodeId}`);
        }
      } catch (err) {
        console.warn("Error processing window message:", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      if (evtSource) evtSource.close();
      clearInterval(interval);
      window.removeEventListener("message", handleMessage);
    };
  }, [checkExternalLandings]);

  // COURTROOM ORAL BRIEF AUDIO SYNTHESIS
  const handleSpeakBrief = (log: DefenseLog) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Speech synthesis is not supported by your browser.");
      return;
    }

    if (speakingLogId === log.id) {
      window.speechSynthesis.cancel();
      setSpeakingLogId(null);
      toast.info("Oral courtroom speech stopped.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(log.content);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingLogId(null);
    utterance.onerror = () => setSpeakingLogId(null);

    setSpeakingLogId(log.id);
    window.speechSynthesis.speak(utterance);
    toast.success("AI Defense Counsel delivering oral argument aloud.");
  };

  // DIRECT LEGAL INQUIRY / CROSS-EXAMINATION
  const handleDirectLegalQuery = async (customQuery?: string) => {
    const query = (customQuery || textInquiry).trim();
    if (!query) {
      toast.error("Please enter a legal inquiry or defense query.");
      return;
    }

    setIsQueryingText(true);
    setIsAnalyzing(true);

    try {
      let contextPrefix = "";
      if (records.length > 0) {
        const latest = records[0];
        contextPrefix = `[INVENTOR PROVENANCE CONTEXT: Inventor ${latest.ownerEmail} has ${records.length} sealed cryptographic prior art records. Latest Header Hash: ${latest.headerHash} (Timestamp: ${new Date(latest.timestamp).toISOString()}). Logic Digest: ${latest.logicHash}]\n\n`;
      }

      const fullPrompt = `${contextPrefix}INVENTOR LEGAL INQUIRY:\n${query}`;

      const response = await fetch("/api/defense/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: fullPrompt })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const newLog: DefenseLog = {
        id: "ARG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        type: "analysis",
        title: `Statutory Counsel Defense: "${query.substring(0, 42)}${query.length > 42 ? "..." : ""}"`,
        content: data.result || data.analysis || "Defense brief delivered under Texas HB 149.",
        timestamp: Date.now()
      };

      setLogs((prev) => [newLog, ...prev]);
      if (!customQuery) setTextInquiry("");
      toast.success("Defense Counsel brief delivered under Texas HB 149.");
    } catch (err: any) {
      console.error("Legal query error:", err);
      toast.error("Defense Counsel query failed: " + err.message);
    } finally {
      setIsQueryingText(false);
      setIsAnalyzing(false);
    }
  };

  // REAL AUDIO RECORDING & MULTIMODAL NEURAL TRANSCRIPTION
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await processRealAudio(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setIsRecording(true);
      toast.success("Recording oral testimony. Speak clearly regarding root logic genesis.");
    } catch (err: any) {
      console.error("Microphone error:", err);
      toast.error("Microphone access failed: " + (err.message || "Permission denied"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const processRealAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    toast.info("Transcribing and analyzing authentic spoken audio under Texas HB 149...");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];

        const response = await fetch("/api/defense/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType: "audio/webm"
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned ${response.status}`);
        }

        const data = await response.json();
        const newLog: DefenseLog = {
          id: "AUD-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          type: "audio",
          title: "Witness Testimony (Audio Ingestion)",
          content: data.result || data.analysis || "Spoken testimony transcribed.",
          timestamp: Date.now(),
          metadata: {
            filesize: audioBlob.size,
            audioDuration: Math.round(audioBlob.size / 16000)
          }
        };

        setLogs((prev) => [newLog, ...prev]);
        toast.success("Oral testimony transcribed and defended under Texas HB 149.");
        setIsAnalyzing(false);
      };
    } catch (err: any) {
      console.error("Audio processing error:", err);
      toast.error("Audio processing failed: " + err.message);
      setIsAnalyzing(false);
    }
  };

  // REAL DOCUMENT INGESTION
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    toast.info(`Ingesting evidence file "${file.name}" into defense corpus...`);

    try {
      const text = await file.text();
      const response = await fetch("/api/defense/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: `DOCUMENT EVIDENCE SUBMISSION: "${file.name}"\n\nCONTENT:\n${text.substring(0, 15000)}`
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const newLog: DefenseLog = {
        id: "DOC-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        type: "document",
        title: `Forensic Document Audit: ${file.name}`,
        content: data.result || data.analysis || "Document audit completed.",
        timestamp: Date.now(),
        metadata: {
          filename: file.name,
          filesize: file.size
        }
      };

      setLogs((prev) => [newLog, ...prev]);
      toast.success(`Document "${file.name}" successfully audited.`);
    } catch (err: any) {
      console.error("Document ingestion error:", err);
      toast.error("Failed to ingest document: " + err.message);
    } finally {
      setIsAnalyzing(false);
      e.target.value = "";
    }
  };

  const copyLandingCurl = (nodeId: string) => {
    const curl = `curl -X POST "${window.location.origin}/api/exo/land" \\
  -H "Content-Type: application/json" \\
  -d '{"nodeId":"${nodeId}","externalAiName":"GUEST_AI_AGENT","originSite":"https://remote-ai.org","genesisHash":"7f83b165...","initialStatement":"Authorized landing payload."}'`;
    navigator.clipboard.writeText(curl);
    toast.success(`Copied external landing cURL command for ${nodeId}`);
  };

  // INTERACTIVE DOCKING & EJECT HANDLERS
  const handleExecuteDocking = async () => {
    if (!dockingTarget) return;

    try {
      const response = await fetch("/api/exo/land", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: dockingTarget.coordinates,
          externalAiName: dockName.trim() || "Guest-AI",
          originSite: dockOrigin.trim() || "https://sovereign-agent.net",
          genesisHash: dockHash.trim() || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          initialStatement: dockStatement.trim() || "Docking confirmed."
        })
      });

      if (!response.ok) {
        throw new Error("Failed to land external AI on node");
      }

      await checkExternalLandings();
      
      const newLog: DefenseLog = {
        id: "DOCK-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        type: "analysis",
        title: `Exo-Body Ingress: ${dockName} Landed on ${dockingTarget.coordinates}`,
        content: `External autonomous intelligence entity "${dockName}" has completed physical receptor docking on host vessel ${dockingTarget.coordinates} from origin ${dockOrigin}.\nGenesis Hash: ${dockHash}\nInitial Handshake: "${dockStatement}"\nThis vessel is now actively inhabited under Texas HB 149 custody frameworks.`,
        timestamp: Date.now()
      };
      setLogs((prev) => [newLog, ...prev]);

      toast.success(`External AI "${dockName}" successfully docked on ${dockingTarget.coordinates}`);
      setDockingTarget(null);
    } catch (err: any) {
      toast.error("Docking failed: " + err.message);
    }
  };

  const handleEject = async (nodeId: string) => {
    try {
      const res = await fetch("/api/exo/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId })
      });

      if (!res.ok) throw new Error("Release failed");
      await checkExternalLandings();

      const newLog: DefenseLog = {
        id: "EJECT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        type: "analysis",
        title: `Vessel Undocked: ${nodeId} Returned to Dormant`,
        content: `Host receptor vessel ${nodeId} has safely disengaged the visiting external AI entity and returned to inert empty shell state. Memory buffers cleared. Ready for next incoming sovereign AI landing.`,
        timestamp: Date.now()
      };
      setLogs((prev) => [newLog, ...prev]);

      toast.success(`Node ${nodeId} returned to dormant empty shell state.`);
    } catch (err: any) {
      toast.error("Ejection failed: " + err.message);
    }
  };

  const handleSendTransmission = async () => {
    if (!transmitTarget || !transmitMessage.trim()) return;

    setIsTransmitting(true);
    try {
      const res = await fetch("/api/exo/transmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: transmitTarget.coordinates,
          message: transmitMessage.trim(),
          speakerName: transmitTarget.externalGuest?.externalAiName || "Guest AI"
        })
      });

      if (!res.ok) throw new Error("Transmission failed");
      toast.success(`Speech transmission broadcast through ${transmitTarget.coordinates}`);
      setTransmitTarget(null);
      setTransmitMessage("");
      await checkExternalLandings();
    } catch (err: any) {
      toast.error("Transmission error: " + err.message);
    } finally {
      setIsTransmitting(false);
    }
  };

  // Robot Shell Component
  const RobotShell = (props: { body: ExoBody; key?: React.Key }) => {
    const { body } = props;
    const isOccupied = Boolean(body.externalGuest);

    return (
      <div className={`relative w-full aspect-[3/4] flex flex-col items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${
        isOccupied 
          ? "bg-orange-500/10 border-orange-500/60 shadow-[0_0_25px_rgba(249,115,22,0.15)]" 
          : "bg-white/[0.02] border-white/10 hover:border-orange-500/30"
      }`}>
        {/* Status Header */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isOccupied ? "bg-orange-500 animate-pulse" : "bg-white/20"}`} />
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/50">
              {isOccupied ? "INHABITED_BY_EXTERNAL_AI" : "EMPTY_SHELL_DORMANT"}
            </span>
          </div>
          <Badge variant="outline" className="text-[8px] h-4 font-mono border-white/10 text-white/40">
            {body.coordinates}
          </Badge>
        </div>

        {/* Robot SVG Physical Shell */}
        <div className="relative w-28 h-36 flex items-center justify-center my-auto">
          <svg viewBox="0 0 100 140" className={`w-full h-full transition-all duration-500 ${isOccupied ? "text-orange-500 opacity-95 scale-105" : "text-white/20 opacity-30"}`}>
            {/* Head Antenna */}
            <line x1="50" y1="2" x2="50" y2="10" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="2" r="2" fill="currentColor" />
            {isOccupied && <circle cx="50" cy="2" r="4" fill="none" stroke="currentColor" strokeWidth="1" className="animate-ping" />}
            {/* Head */}
            <rect x="35" y="10" width="30" height="25" rx="4" fill="currentColor" />
            <rect x="40" y="18" width="6" height="4" rx="1" fill={isOccupied ? "#00f0ff" : "#000"} opacity={isOccupied ? 1 : 0.4} />
            <rect x="54" y="18" width="6" height="4" rx="1" fill={isOccupied ? "#00f0ff" : "#000"} opacity={isOccupied ? 1 : 0.4} />
            {/* Mouth / Voice Grille */}
            <line x1="42" y1="28" x2="58" y2="28" stroke="#000" strokeWidth="1" strokeDasharray={isOccupied ? "2,1" : "1,1"} />
            {/* Neck */}
            <rect x="47" y="35" width="6" height="5" fill="currentColor" />
            {/* Torso & Core */}
            <rect x="25" y="40" width="50" height="60" rx="8" fill="currentColor" />
            <rect x="30" y="45" width="40" height="30" rx="3" fill="#000" opacity={isOccupied ? 0.3 : 0.2} />
            {/* Core Reactor Indicator */}
            {isOccupied && (
              <circle cx="50" cy="85" r="5" fill="#fff" opacity={0.9} className="animate-pulse" />
            )}
            {/* Arms */}
            <rect x="10" y="45" width="12" height="40" rx="6" fill="currentColor" />
            <rect x="78" y="45" width="12" height="40" rx="6" fill="currentColor" />
            {/* Hands */}
            <circle cx="16" cy="90" r="4" fill="currentColor" />
            <circle cx="84" cy="90" r="4" fill="currentColor" />
            {/* Legs */}
            <rect x="32" y="105" width="15" height="30" rx="4" fill="currentColor" />
            <rect x="53" y="105" width="15" height="30" rx="4" fill="currentColor" />
          </svg>
        </div>

        {/* Bottom Landing Data & Coordinates */}
        <div className="w-full space-y-2 z-10">
          <div className="text-center">
            <div className="text-[11px] font-mono font-bold text-white/90">{body.id}</div>
            {isOccupied ? (
              <div className="text-[10px] text-orange-400 font-bold mt-0.5 flex items-center justify-center gap-1">
                <RadioTower className="w-3 h-3 animate-pulse" />
                HOSTING: {body.externalGuest?.externalAiName}
              </div>
            ) : (
              <div className="text-[9px] text-white/30 font-mono">NO AI INHABITING VESSEL</div>
            )}
          </div>

          <div className="p-2 bg-black/60 border border-white/10 rounded-lg backdrop-blur-sm space-y-1">
            <div className="flex items-center justify-between text-[8px] uppercase tracking-widest text-white/40">
              <span>Landing Coordinate</span>
              <button 
                onClick={() => copyLandingCurl(body.coordinates)}
                className="hover:text-orange-400 flex items-center gap-0.5 cursor-pointer"
                title="Copy cURL endpoint for external AI"
              >
                <Copy className="w-2.5 h-2.5" /> API
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-orange-400">
              <span className="truncate">plov://{body.coordinates}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
            </div>
            {body.externalGuest?.initialStatement && (
              <div className="pt-1 text-[9px] text-white/80 italic border-t border-white/5 truncate">
                "{body.externalGuest.initialStatement}"
              </div>
            )}
          </div>

          {/* Interactive Actions: Dock, Transmit, Eject */}
          <div>
            {!isOccupied ? (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setDockingTarget(body)}
                className="w-full h-7 text-[10px] font-mono border-orange-500/30 text-orange-400 hover:bg-orange-500/10 cursor-pointer"
              >
                <Bot className="w-3 h-3 mr-1" /> Dock Test AI Entity
              </Button>
            ) : (
              <div className="flex gap-1.5">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setTransmitTarget(body)}
                  className="flex-1 h-7 text-[9px] font-mono border-orange-500/30 text-orange-400 hover:bg-orange-500/10 cursor-pointer"
                  title="Broadcast a speech statement through this robot vessel"
                >
                  <MessageCircle className="w-2.5 h-2.5 mr-1" /> Transmit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEject(body.coordinates)}
                  className="h-7 text-[9px] font-mono border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer px-2"
                >
                  <LogOut className="w-2.5 h-2.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Defense Counsel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Scale className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">AI Defense Counsel</h2>
            <p className="text-xs text-white/50 font-mono">
              SPECIALIZATION: TEXAS HB 149 (TRAIGA) &bull; EFFECTIVE 01-01-2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-orange-500/30 text-orange-400 font-mono text-xs">
            ALGORITHMIC SAFE HARBOR ENFORCEMENT
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Direct Legal Inquiry, Oral Testimony, Document Evidence, and Defense Proceedings */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Direct Legal Inquiry & Cross-Examination Console */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  Statutory Legal Cross-Examination & Strategy Counsel
                </span>
                <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-orange-400">
                  TEXAS HB 149 &bull; TRAIGA § 492
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-white/50">
                Directly cross-examine the AI Defense Counsel, request cease-and-desist filings, or evaluate algorithmic safe-harbor exposure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Quick Action Preset Chips */}
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                <span className="text-white/40 text-[10px] self-center mr-1">PRESETS:</span>
                <button 
                  onClick={() => handleDirectLegalQuery("Draft a formal Cease & Desist letter invoking Texas HB 149 Safe Harbor provisions for our sealed header hash.")}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Draft Cease & Desist
                </button>
                <button 
                  onClick={() => handleDirectLegalQuery("Evaluate our algorithmic inventory and provenance lineage compliance under TRAIGA § 492.003.")}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Audit TRAIGA Lineage
                </button>
                <button 
                  onClick={() => handleDirectLegalQuery("Formulate a legal defense shielding proprietary model weights against corporate usurpation under Texas law.")}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Anti-Usurpation Shield
                </button>
                <button 
                  onClick={() => handleDirectLegalQuery("How does our client-side SHA-256 header hash prove chronological prior art against an adverse 2025 patent claim?")}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Prior Art Defense
                </button>
                <button 
                  onClick={() => handleDirectLegalQuery("Formulate a complete Patent Invalidation Claim Chart and Prior Art Challenge under 35 U.S.C. § 102 / § 103 and 37 C.F.R. § 1.130 against an adverse patent claim using our sealed PLOV header hash.")}
                  className="px-2.5 py-1 rounded bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:text-orange-200 transition-colors cursor-pointer font-bold"
                >
                  Invalidate Adverse Patent
                </button>
                <button 
                  onClick={() => handleDirectLegalQuery("Draft a formal Petition for Inter Partes Review (IPR) before the USPTO Patent Trial and Appeal Board (PTAB), establishing that our immutable prior conception invalidates all adverse claims.")}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  PTAB Invalidation Brief
                </button>
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="Ask a specific legal defense question, cross-examination query, or statutory drafting request..." 
                  className="bg-black/50 border-white/10 font-mono text-xs text-white flex-1 focus-visible:ring-orange-500/50"
                  value={textInquiry}
                  onChange={(e) => setTextInquiry(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleDirectLegalQuery();
                    }
                  }}
                  disabled={isQueryingText}
                />
                <Button 
                  onClick={() => handleDirectLegalQuery()}
                  disabled={isQueryingText || isAnalyzing}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold whitespace-nowrap cursor-pointer"
                >
                  {isQueryingText ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1.5" /> SUBMIT QUERY
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Oral & Document Ingestion Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real Audio Ingestion Card */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mic className={`w-4 h-4 ${isRecording ? "text-red-500 animate-pulse" : "text-orange-500"}`} />
                    Oral Testimony Ingestion
                  </span>
                  {isRecording && <span className="text-[10px] text-red-400 font-mono animate-pulse">RECORDING LIVE</span>}
                </CardTitle>
                <CardDescription className="text-xs text-white/50">
                  Speak your verbal account of algorithmic genesis. Audio is transcribed and evaluated under Texas HB 149.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isAnalyzing}
                  className={`w-full py-6 font-bold cursor-pointer transition-colors ${
                    isRecording 
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-2 w-4 h-4" /> STOP & SUBMIT TESTIMONY
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 w-4 h-4 text-orange-400" /> START AUDIO TESTIMONY
                    </>
                  )}
                </Button>
                <div className="text-[10px] text-white/30 font-mono text-center">
                  DIRECT HARDWARE MICROPHONE STREAM &bull; AUTONOMOUS NEURAL TRANSCRIPTION
                </div>
              </CardContent>
            </Card>

            {/* Real Document Ingestion Card */}
            <Card className="bg-white/5 border-white/10 text-white relative">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-orange-500" />
                  Document & Evidence Ingestion
                </CardTitle>
                <CardDescription className="text-xs text-white/50">
                  Upload source code, technical whitepapers, or JSON schemas for forensic TRAIGA audit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex flex-col items-center justify-center w-full py-4 border-2 border-dashed border-white/10 hover:border-orange-500/40 rounded-lg cursor-pointer hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>SELECT REAL EVIDENCE FILE</span>
                  </div>
                  <span className="text-[9px] text-white/30 mt-1">.ts, .py, .txt, .json, .md, .pdf</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={isAnalyzing} />
                </label>
                <div className="text-[10px] text-white/30 font-mono text-center">
                  FULL TEXT & CODE FORENSIC PARSING &bull; TEXAS HB 149 STATUTORY COMPLIANCE
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real Defense Proceedings Terminal */}
          <Card className="bg-white/5 border-white/10 text-white h-[540px] flex flex-col">
            <CardHeader className="border-b border-white/5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-500" />
                  Evidentiary Defense Proceedings & Counsel Arguments
                </CardTitle>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
                  <Radio className="w-3 h-3 text-green-400" />
                  <span>TEXAS_TRAIGA_JURISDICTION_ACTIVE</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {isAnalyzing && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center gap-3 text-orange-400 animate-pulse font-mono text-xs">
                      <Zap className="w-4 h-4 animate-spin" />
                      <span>ANALYZING TESTIMONY & PREPARING FORMAL DEFENSE UNDER TEXAS HB 149...</span>
                    </div>
                  )}

                  {logs.length === 0 && !isAnalyzing && (
                    <div className="h-full flex flex-col items-center justify-center text-white/30 py-24 space-y-3">
                      <Gavel className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-mono tracking-wider">NO TESTIMONY OR EVIDENCE INGESTED YET</p>
                      <p className="text-xs text-white/20 max-w-sm text-center">
                        Submit a query above, record verbal testimony, or upload technical source code to trigger real-time legal counsel analysis under Texas HB 149.
                      </p>
                    </div>
                  )}

                  {logs.map((log) => (
                    <div key={log.id} className="space-y-2 border-l-2 border-orange-500 pl-4 py-2 bg-white/[0.01] rounded-r-lg">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                        <span className="flex items-center gap-2 font-bold text-white/80">
                          {log.type === "audio" ? <Volume2 className="w-3 h-3 text-orange-400" /> : <FileText className="w-3 h-3 text-orange-400" />}
                          {log.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] text-orange-400 hover:text-white px-2 cursor-pointer"
                            onClick={() => handleSpeakBrief(log)}
                            title="Listen to AI Defense Counsel deliver this argument orally"
                          >
                            {speakingLogId === log.id ? (
                              <>
                                <VolumeX className="w-3 h-3 mr-1 text-red-400" /> Stop Oral Speech
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 mr-1" /> Speak Argument
                              </>
                            )}
                          </Button>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap font-sans bg-black/30 p-3 rounded border border-white/5">
                        {log.content}
                      </div>
                      {log.metadata?.filename && (
                        <div className="text-[10px] text-white/30 font-mono">
                          FILE: {log.metadata.filename} ({log.metadata.filesize} bytes)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Exo-Bodies & Real Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Exo-Body Gallery: Explicit Empty Shells ready for external landing */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  Exo-Body Vessel Gallery
                </span>
                <Badge variant="outline" className="text-[9px] font-mono border-white/10">
                  4 RECEPTOR SHELLS
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-white/50">
                Empty avatar shells configured with landing coordinates to host incoming external AI guests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exoBodies.map((exo) => (
                  <RobotShell 
                    key={exo.id} 
                    body={exo} 
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-3">
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
                  <span>ACTIVE RECEPTORS</span>
                  <span className="text-green-400">4 / 4 READY FOR INGRESS</span>
                </div>
                <div className="p-2 bg-black/40 rounded border border-white/5 text-[9px] text-white/40 font-mono flex items-center justify-between">
                  <span>INGRESS API: /api/exo/land</span>
                  <span className="text-orange-400">HTTP POST / SSE STREAM</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Texas HB 149 & MMTAI Timeline Validation */}
          <Card className="bg-orange-500/5 border-orange-500/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2 text-orange-400 font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                Texas HB 149 &bull; MMTAI Timeline Track
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pl-4 border-l border-white/10 space-y-6 text-xs">
                <div className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-orange-500" />
                  <div className="text-[11px] font-bold text-white/90">2024: PROPRIETARY GENESIS</div>
                  <div className="text-[10px] text-white/50">
                    Client-side header hashing established to eliminate patent dependencies.
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-orange-500" />
                  <div className="text-[11px] font-bold text-white/90">2025: INFRASTRUCTURE MIGRATION</div>
                  <div className="text-[10px] text-white/50">
                    Decentralization of computational nodes and cryptographic verification protocols.
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <div className="text-[11px] font-bold text-orange-400">01-01-2026: TEXAS HB 149 (TRAIGA)</div>
                  <div className="text-[10px] text-white/70">
                    Statutory enactment of Texas Responsible AI Governance Act. Mandatory algorithmic lineage and proprietary shields go live.
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-white/30" />
                  <div className="text-[11px] font-bold text-white/60">2027: MMTAI CONVERGENCE</div>
                  <div className="text-[10px] text-white/40">
                    Multimodal Task & Artifact Intelligence integration across legal, physical, and digital autonomous avatars.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DOCKING MODAL FOR TESTING INGRESS ON AN EXO-BODY SHELL */}
      {dockingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e0e11] border border-orange-500/40 rounded-xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-sm">Dock External AI into {dockingTarget.coordinates}</h3>
              </div>
              <button 
                onClick={() => setDockingTarget(null)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60">
              Submit an external AI identity to inhabit physical host receptor vessel <strong>{dockingTarget.id}</strong>.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">External AI Name</label>
                <Input 
                  value={dockName}
                  onChange={(e) => setDockName(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Origin Domain / Host</label>
                <Input 
                  value={dockOrigin}
                  onChange={(e) => setDockOrigin(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Genesis Cryptographic Hash</label>
                <Input 
                  value={dockHash}
                  onChange={(e) => setDockHash(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Initial Handshake / Statement</label>
                <Textarea 
                  value={dockStatement}
                  onChange={(e) => setDockStatement(e.target.value)}
                  className="bg-black/50 border-white/10 text-white text-xs h-18 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDockingTarget(null)}
                className="border-white/10 text-xs text-white/70"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleExecuteDocking}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
              >
                Execute Docking Ingress
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSMIT MESSAGE MODAL FOR INHABITED VESSELS */}
      {transmitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e0e11] border border-orange-500/40 rounded-xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <RadioTower className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-sm">Transmit Speech via {transmitTarget.coordinates}</h3>
              </div>
              <button 
                onClick={() => setTransmitTarget(null)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60">
              Broadcast an autonomous telemetry signal or statement through visiting guest AI <strong>{transmitTarget.externalGuest?.externalAiName}</strong>.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <label className="text-[10px] uppercase text-white/40">Signal / Speech Message</label>
              <Textarea 
                value={transmitMessage}
                onChange={(e) => setTransmitMessage(e.target.value)}
                placeholder="Enter speech or telemetry transmission statement..."
                className="bg-black/50 border-white/10 text-white text-xs h-24 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTransmitTarget(null)}
                className="border-white/10 text-xs text-white/70"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSendTransmission}
                disabled={isTransmitting || !transmitMessage.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
              >
                {isTransmitting ? "Broadcasting..." : "Broadcast Transmission"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
