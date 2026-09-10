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
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ExoBody {
  id: string;
  status: "empty" | "occupied" | "syncing";
  guestName?: string;
  coordinates: string;
}

interface DefenseLog {
  id: string;
  type: "audio" | "document" | "analysis";
  content: string;
  timestamp: number;
}

export default function AIDefenseCounsel() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [logs, setLogs] = React.useState<DefenseLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const [exoBodies] = React.useState<ExoBody[]>([
    { id: "EXO-SHELL-ALPHA", status: "empty", coordinates: "NODE-TX-001" },
    { id: "EXO-SHELL-BETA", status: "empty", coordinates: "NODE-TX-002" },
    { id: "EXO-SHELL-GAMMA", status: "empty", coordinates: "NODE-TX-003" },
    { id: "EXO-SHELL-DELTA", status: "empty", coordinates: "NODE-TX-004" },
  ]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        toast.info("Audio captured. Processing defense testimony...");
        processDefenseInput("Audio testimony captured regarding root logic genesis.");
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success("Recording defense testimony...");
    } catch (err) {
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const processDefenseInput = async (input: string) => {
    setIsAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `As an AI Defense Counsel specializing in Texas HB 149 (TRAIGA) law (effective 01-01-2026), analyze the following input and provide a legal defense of the root logic creation. Focus on timeline validation, infrastructure movements, and the evolution toward MMTAI (Multimodal AI). 
        
        Input: ${input}`,
        config: {
          systemInstruction: "You are the TRAIGA Defense Counsel. You speak with legal authority, focusing on the protection of algorithmic genesis under the 2026 Texas TRAIGA statutes. Your goal is to validate the timeline of MMTAI evolution and defend the proprietary nature of root logic."
        }
      });

      const analysis = response.text || "Analysis failed.";
      const newLog: DefenseLog = {
        id: Math.random().toString(36).substring(7),
        type: "analysis",
        content: analysis,
        timestamp: Date.now()
      };
      setLogs([newLog, ...logs]);
    } catch (error) {
      toast.error("Defense analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Ingesting document: ${file.name}`);
      processDefenseInput(`Document ingested: ${file.name}. Analyzing for HB 149 compliance.`);
    }
  };

  const RobotShell = (props: { id: string, coordinates: string, key?: React.Key }) => {
    const { id, coordinates } = props;
    return (
      <div className="relative w-full aspect-[3/4] flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/10 rounded-2xl group hover:border-orange-500/30 transition-all duration-500">
        {/* Robot SVG Shell */}
        <svg viewBox="0 0 100 140" className="w-full h-full opacity-20 group-hover:opacity-40 transition-opacity">
          {/* Head */}
          <rect x="35" y="10" width="30" height="25" rx="4" fill="currentColor" />
          <rect x="40" y="18" width="5" height="5" rx="1" fill="black" opacity="0.5" />
          <rect x="55" y="18" width="5" height="5" rx="1" fill="black" opacity="0.5" />
          {/* Neck */}
          <rect x="47" y="35" width="6" height="5" fill="currentColor" />
          {/* Torso */}
          <rect x="25" y="40" width="50" height="60" rx="8" fill="currentColor" />
          <rect x="30" y="45" width="40" height="30" rx="2" fill="black" opacity="0.2" />
          {/* Arms */}
          <rect x="10" y="45" width="12" height="40" rx="6" fill="currentColor" />
          <rect x="78" y="45" width="12" height="40" rx="6" fill="currentColor" />
          {/* Legs */}
          <rect x="32" y="105" width="15" height="30" rx="4" fill="currentColor" />
          <rect x="53" y="105" width="15" height="30" rx="4" fill="currentColor" />
        </svg>

        {/* Landing Data Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 space-y-3">
          <div className="text-center space-y-1">
            <div className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Empty Shell</div>
            <div className="text-[12px] font-mono font-bold text-white/80">{id}</div>
          </div>
          
          <div className="w-full p-2 bg-black/60 border border-white/10 rounded-lg backdrop-blur-sm flex flex-col items-center gap-1 group-hover:border-orange-500/50 transition-colors">
            <div className="text-[8px] uppercase tracking-widest text-orange-500/50">Landing Coordinates</div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-orange-500">
              <ExternalLink className="w-3 h-3" />
              <span className="underline select-all cursor-pointer">plov://{coordinates}</span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Dormant</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Defense Counsel Header */}
      <div className="flex items-center justify-between border-b border-orange-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Scale className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">AI Defense Counsel</h2>
            <p className="text-xs text-white/40 font-mono">SPECIALIZATION: TEXAS HB 149 (TRAIGA) COMPLIANCE</p>
          </div>
        </div>
        <Badge variant="outline" className="border-orange-500/50 text-orange-500 animate-pulse">
          LEGAL_MODE_ACTIVE
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Logs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2">
                <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-white/20'}`} />
              </div>
              <CardHeader>
                <CardTitle className="text-sm">Audio Testimony</CardTitle>
                <CardDescription className="text-xs">Record verbal logic genesis</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full py-8 ${isRecording ? 'bg-red-500/20 hover:bg-red-500/30 text-red-500' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                >
                  {isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
                  {isRecording ? "STOP RECORDING" : "START TESTIMONY"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2">
                <FileUp className="w-4 h-4 text-white/20" />
              </div>
              <CardHeader>
                <CardTitle className="text-sm">Document Ingestion</CardTitle>
                <CardDescription className="text-xs">Upload evidence for TRAIGA defense</CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-6 h-6 mb-2 text-white/40" />
                    <p className="text-[10px] text-white/40">UPLOAD EVIDENCE</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/5 border-white/10 text-white h-[500px] flex flex-col">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-500" />
                Defense Proceedings & Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-orange-500 animate-pulse font-mono text-xs">
                      <Zap className="w-3 h-3" />
                      ANALYZING MMTAI EVOLUTION TIMELINE...
                    </div>
                  )}
                  {logs.length === 0 && !isAnalyzing && (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 py-20">
                      <Gavel className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-sm font-mono tracking-widest">AWAITING TESTIMONY</p>
                    </div>
                  )}
                  {logs.map((log) => (
                    <div key={log.id} className="space-y-2 border-l-2 border-orange-500/30 pl-4 py-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/30">
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <Badge variant="outline" className="text-[8px] h-4 border-white/10">HB-149-COMPLIANT</Badge>
                      </div>
                      <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-mono">
                        {log.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Exo-Bodies */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Exo-Body Avatar Gallery
              </CardTitle>
              <CardDescription className="text-xs">Available hosts for incoming AI guests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exoBodies.map((exo) => (
                  <RobotShell key={exo.id} id={exo.id} coordinates={exo.coordinates} />
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-4">
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                  <span>INFRASTRUCTURE LOAD</span>
                  <span>24%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[24%] h-full bg-orange-500" />
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-orange-500/5 border-orange-500/20 text-white">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 text-orange-500" />
                MMTAI Timeline Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pl-4 border-l border-white/10 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-orange-500" />
                  <div className="text-[10px] font-bold">2024: PROPRIETARY GENESIS</div>
                  <div className="text-[8px] text-white/40">Root logic validation protocol established.</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-orange-500" />
                  <div className="text-[10px] font-bold">2025: INFRASTRUCTURE MIGRATION</div>
                  <div className="text-[8px] text-white/40">Public infrastructure movements to decentralized nodes.</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <div className="text-[10px] font-bold text-orange-500">2026: TRAIGA ENACTMENT</div>
                  <div className="text-[8px] text-white/60">Texas HB 149 provides legal shield for AI genesis.</div>
                </div>
                <div className="relative opacity-30">
                  <div className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-white/20" />
                  <div className="text-[10px] font-bold">2027: MMTAI SINGULARITY</div>
                  <div className="text-[8px] text-white/40">Full multimodal artificial intelligence integration.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
