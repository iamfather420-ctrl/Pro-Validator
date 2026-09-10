import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Fingerprint, 
  Clock, 
  Mail, 
  FileCode, 
  Search, 
  History, 
  Lock, 
  Unlock,
  Copy,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Gavel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { generateHash } from "@/src/lib/crypto";
import { GoogleGenAI } from "@google/genai";
import AIDefenseCounsel from "./AIDefenseCounsel";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ValidationRecord {
  id: string;
  logic: string;
  logicHash: string;
  headerHash: string;
  timestamp: number;
  ownerEmail: string;
  fingerprint: string;
}

export default function LogicValidator() {
  const [logic, setLogic] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isValidating, setIsValidating] = React.useState(false);
  const [records, setRecords] = React.useState<ValidationRecord[]>(() => {
    const saved = localStorage.getItem("plov_records");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = React.useState("validate");

  React.useEffect(() => {
    localStorage.setItem("plov_records", JSON.stringify(records));
  }, [records]);

  const handleValidate = async () => {
    if (!logic.trim()) {
      toast.error("Please enter the proprietary logic to validate.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid owner email.");
      return;
    }

    setIsValidating(true);
    try {
      const logicHash = await generateHash(logic);
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this proprietary logic and provide a concise, technical "fingerprint" summary (max 100 words). This summary will be cryptographically sealed to prove ownership of the intent and structure of the logic. Logic:\n\n${logic}`,
        config: {
          systemInstruction: "You are a technical IP analyst. Provide a dense, objective summary of the provided logic's core innovation and structure."
        }
      });

      const fingerprint = response.text || "No fingerprint generated.";
      const timestamp = Date.now();
      const headerHash = await generateHash(`${logicHash}|${timestamp}|${email}|${fingerprint}`);

      const newRecord: ValidationRecord = {
        id: Math.random().toString(36).substring(7),
        logic,
        logicHash,
        headerHash,
        timestamp,
        ownerEmail: email,
        fingerprint
      };

      setRecords([newRecord, ...records]);
      toast.success("Logic successfully validated and sealed.");
      setActiveTab("history");
      setLogic("");
    } catch (error) {
      console.error(error);
      toast.error("Validation failed. Please check your connection.");
    } finally {
      setIsValidating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-500">
              <ShieldCheck className="w-8 h-8" />
              <span className="font-mono text-sm tracking-widest uppercase">Proprietary Protocol v1.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">PLOV</h1>
            <p className="text-white/50 max-w-md">
              Proprietary Logic Ownership Validator. Making tech patents obsolete through immutable header hash validation.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-white/30">Network Status</div>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-xs">DECENTRALIZED_NODE_ACTIVE</span>
              </div>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
            <TabsTrigger value="validate" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Lock className="w-4 h-4 mr-2" /> Validate Logic
            </TabsTrigger>
            <TabsTrigger value="defense" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Gavel className="w-4 h-4 mr-2" /> AI Defense Counsel
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" /> Validation History
            </TabsTrigger>
            <TabsTrigger value="verify" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-2" /> Verify Hash
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-orange-500" />
                      Proprietary Logic Input
                    </CardTitle>
                    <CardDescription className="text-white/40">
                      Paste your code, algorithm description, or proprietary logic here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Enter logic here..." 
                      className="min-h-[300px] bg-black/50 border-white/10 font-mono text-sm focus-visible:ring-orange-500/50"
                      value={logic}
                      onChange={(e) => setLogic(e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-orange-500" />
                      Ownership Identity
                    </CardTitle>
                    <CardDescription className="text-white/40">
                      The email address that will be cryptographically bound to this logic.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input 
                      type="email" 
                      placeholder="owner@example.com" 
                      className="bg-black/50 border-white/10 focus-visible:ring-orange-500/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6"
                      onClick={handleValidate}
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <>
                          <Cpu className="w-5 h-5 mr-2 animate-spin" />
                          GENERATING HEADER HASH...
                        </>
                      ) : (
                        <>
                          <Fingerprint className="w-5 h-5 mr-2" />
                          VALIDATE & SEAL OWNERSHIP
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest text-white/50">Protocol Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                      <h4 className="font-bold text-orange-500 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Header Hash Validation
                      </h4>
                      <p className="text-white/60 leading-relaxed">
                        PLOV uses a composite hashing algorithm that binds your logic, a high-resolution timestamp, and your identity into a single immutable Header Hash.
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                      <h4 className="font-bold text-orange-500 flex items-center gap-2">
                        <Cpu className="w-4 h-4" /> AI Fingerprinting
                      </h4>
                      <p className="text-white/60 leading-relaxed">
                        Gemini AI analyzes the semantic intent of your logic to create a "Logic Fingerprint" which is included in the final validation seal.
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                      <h4 className="font-bold text-orange-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Legal Precedence
                      </h4>
                      <p className="text-white/60 leading-relaxed italic">
                        "Cryptographic proof of existence is the ultimate patent."
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="defense">
            <AIDefenseCounsel />
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Validation History</CardTitle>
                <CardDescription className="text-white/40">
                  Your locally stored ownership records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {records.length === 0 ? (
                      <div className="text-center py-20 text-white/20">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No validation records found.</p>
                      </div>
                    ) : (
                      records.map((record) => (
                        <motion.div 
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4 hover:border-orange-500/30 transition-colors group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                                  SEALED
                                </Badge>
                                <span className="text-xs font-mono text-white/30">ID: {record.id}</span>
                              </div>
                              <h3 className="font-bold text-lg">{record.ownerEmail}</h3>
                            </div>
                            <div className="text-right text-xs text-white/30 font-mono">
                              <div className="flex items-center gap-1 justify-end">
                                <Clock className="w-3 h-3" />
                                {new Date(record.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-white/30">Logic Hash</label>
                              <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/5">
                                <code className="text-[10px] truncate flex-1">{record.logicHash}</code>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(record.logicHash, "Logic Hash")}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-orange-500/50">Header Hash (Seal)</label>
                              <div className="flex items-center gap-2 bg-orange-500/5 p-2 rounded border border-orange-500/10">
                                <code className="text-[10px] truncate flex-1 text-orange-500">{record.headerHash}</code>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-orange-500" onClick={() => copyToClipboard(record.headerHash, "Header Hash")}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/30">Logic Fingerprint (AI Analysis)</label>
                            <p className="text-sm text-white/60 leading-relaxed bg-white/5 p-3 rounded border border-white/5">
                              {record.fingerprint}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verify">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Verify Hash Integrity</CardTitle>
                <CardDescription className="text-white/40">
                  Enter a Header Hash to verify its validity against the protocol.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Input placeholder="Enter Header Hash to verify..." className="bg-black/50 border-white/10" />
                  <Button className="w-full bg-white/10 hover:bg-white/20">
                    <Search className="w-4 h-4 mr-2" /> VERIFY ON PROTOCOL
                  </Button>
                </div>
                
                <div className="p-12 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/20 space-y-4">
                  <Unlock className="w-12 h-12 opacity-10" />
                  <p className="text-sm">Enter a hash to begin verification process.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="pt-20 pb-8 text-center space-y-4">
          <div className="flex justify-center gap-8 text-[10px] uppercase tracking-[0.3em] text-white/20">
            <span>SHA-256 SECURED</span>
            <span>GEMINI POWERED</span>
            <span>IMMUTABLE PROOF</span>
          </div>
          <p className="text-[10px] text-white/10">
            © 2026 PLOV PROTOCOL. ALL RIGHTS RESERVED. PATENTS ARE LEGACY TECHNOLOGY.
          </p>
        </footer>
      </div>
    </div>
  );
}
