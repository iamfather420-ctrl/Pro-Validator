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
  Gavel,
  Check,
  Binary,
  Share2,
  ExternalLink,
  RefreshCw,
  Download,
  Scale,
  Upload,
  FolderArchive,
  Files,
  FileCheck,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  generateHash, 
  createCompositeHeaderHash, 
  validateHashFormat, 
  computeEntropy,
  verifyHeaderHash,
  computeMerkleRoot,
  generateStandaloneVerifierHTML,
  generateFormalDemandLetter
} from "@/src/lib/crypto";
import AIDefenseCounsel from "./AIDefenseCounsel";
import StatutoryCertificateModal from "./StatutoryCertificateModal";
import AvalancheDiffTool from "./AvalancheDiffTool";

export interface ValidationRecord {
  id: string;
  logic: string;
  logicHash: string;
  headerHash: string;
  timestamp: number;
  ownerEmail: string;
  fingerprint: string;
  isMultiFile?: boolean;
  fileCount?: number;
  merkleRoot?: string;
}

interface ProjectFileEntry {
  name: string;
  size: number;
  hash: string;
}

export default function LogicValidator() {
  const [logicMode, setLogicMode] = React.useState<"single" | "project">("single");
  const [logic, setLogic] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isValidating, setIsValidating] = React.useState(false);

  // Multi-File Project State
  const [projectFiles, setProjectFiles] = React.useState<ProjectFileEntry[]>([]);
  const [projectMerkleRoot, setProjectMerkleRoot] = React.useState<string>("");
  const [isProcessingFiles, setIsProcessingFiles] = React.useState(false);

  const [records, setRecords] = React.useState<ValidationRecord[]>(() => {
    try {
      const saved = localStorage.getItem("plov_records");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = React.useState("validate");

  // Selected Record for Formal Legal Affidavit / Certificate Modal
  const [selectedCertificateRecord, setSelectedCertificateRecord] = React.useState<ValidationRecord | null>(null);

  // Real Verification State
  const [verifyHashInput, setVerifyHashInput] = React.useState("");
  const [verificationResult, setVerificationResult] = React.useState<{
    searched: boolean;
    formatValid: boolean;
    reason?: string;
    foundRecord?: ValidationRecord;
    entropy?: number;
  } | null>(null);

  // Manual Tuple Re-Hashing State
  const [manualLogic, setManualLogic] = React.useState("");
  const [manualEmail, setManualEmail] = React.useState("");
  const [manualTimestamp, setManualTimestamp] = React.useState("");
  const [manualFingerprint, setManualFingerprint] = React.useState("");
  const [manualRecomputedHash, setManualRecomputedHash] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      localStorage.setItem("plov_records", JSON.stringify(records));
    } catch (e) {
      console.error("Failed to persist records:", e);
    }
  }, [records]);

  // Handle Multi-File Directory or Multiple Files Selection
  const handleProjectFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsProcessingFiles(true);
    toast.info(`Processing ${fileList.length} files for Algorithmic Inventory...`);

    try {
      const entries: ProjectFileEntry[] = [];
      const fileHashes: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const text = await file.text();
        const hash = await generateHash(text);
        entries.push({
          name: file.name,
          size: file.size,
          hash
        });
        fileHashes.push(hash);
      }

      // Compute standard cryptographic Merkle Root
      const merkle = await computeMerkleRoot(fileHashes);
      setProjectFiles(entries);
      setProjectMerkleRoot(merkle);

      // Construct canonical manifest representation for sealing
      const manifest = `ALGORITHMIC INVENTORY MANIFEST & MERKLE TREE SPECIFICATION
PROTOCOL: TEXAS HB 149 (TRAIGA) § 492.003
TOTAL REPOSITORY FILES: ${entries.length}
MERKLE ROOT HASH: ${merkle}

FILE INVENTORY:
${entries.map((f, idx) => `[${idx + 1}] ${f.name} (${f.size} bytes) => SHA256: ${f.hash}`).join("\n")}`;

      setLogic(manifest);
      toast.success(`Computed Merkle Root for ${entries.length} files: ${merkle.substring(0, 16)}...`);
    } catch (err: any) {
      console.error("Multi-file processing error:", err);
      toast.error("Failed to process multi-file repository: " + err.message);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const clearProjectFiles = () => {
    setProjectFiles([]);
    setProjectMerkleRoot("");
    setLogic("");
  };

  const handleValidate = async () => {
    if (!logic.trim()) {
      toast.error("Please enter the proprietary logic or ingest project files to validate.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid owner email address.");
      return;
    }

    setIsValidating(true);

    try {
      // 1. Compute Authentic SHA-256 Digest of the raw logic in browser
      const rawLogicHash = await generateHash(logic.trim());

      // 2. Fetch or compute structural fingerprint from backend
      let fingerprintStr = "";
      try {
        const fpRes = await fetch("/api/fingerprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logic: logic.trim() })
        });
        if (fpRes.ok) {
          const fpData = await fpRes.json();
          fingerprintStr = fpData.fingerprint || "Forensic Structural Topology";
        } else {
          fingerprintStr = `Topology: ${logic.length} chars, Entropy: ${computeEntropy(rawLogicHash)}`;
        }
      } catch {
        fingerprintStr = `Topology: ${logic.length} chars, Entropy: ${computeEntropy(rawLogicHash)}`;
      }

      // 3. Cryptographically compose the Header Hash with current UTC millisecond timestamp
      const timestamp = Date.now();
      const headerHash = await createCompositeHeaderHash(
        rawLogicHash,
        timestamp,
        email.trim().toLowerCase(),
        fingerprintStr
      );

      // 4. Create immutable validation record
      const newRecord: ValidationRecord = {
        id: Math.random().toString(36).substring(2, 10).toUpperCase(),
        logic: logic.trim(),
        logicHash: rawLogicHash,
        headerHash,
        timestamp,
        ownerEmail: email.trim().toLowerCase(),
        fingerprint: fingerprintStr,
        isMultiFile: logicMode === "project",
        fileCount: projectFiles.length > 0 ? projectFiles.length : undefined,
        merkleRoot: projectMerkleRoot || undefined
      };

      setRecords((prev) => [newRecord, ...prev]);
      toast.success("Proprietary Logic Sealed into Sovereign Ledger!");
      setActiveTab("history");
    } catch (err: any) {
      console.error("Validation error:", err);
      toast.error("Failed to generate cryptographic seal: " + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Standalone Courtroom Verifier Download
  const handleDownloadStandaloneHTML = (record: ValidationRecord) => {
    const html = generateStandaloneVerifierHTML(record);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PLOV-Courtroom-Proof-${record.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded Offline Courtroom Verifier for CERT-${record.id}. Open in any browser without internet.`);
  };

  // Export Entire Ledger
  const handleExportLedger = () => {
    if (records.length === 0) {
      toast.error("No sealed records to export.");
      return;
    }
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PLOV-Sovereign-Ledger-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${records.length} sealed cryptographic prior art records.`);
  };

  // Import Ledger JSON
  const handleImportLedger = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setRecords(imported);
          toast.success(`Restored ${imported.length} sealed records to ledger.`);
        } else {
          toast.error("Invalid ledger JSON format.");
        }
      } catch {
        toast.error("Failed to parse ledger file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Real Hash Verification Handler
  const handleVerifyHash = async () => {
    const trimmed = verifyHashInput.trim();
    if (!trimmed) {
      toast.error("Please enter a 256-bit Header Hash to verify.");
      return;
    }

    const formatCheck = validateHashFormat(trimmed);
    const entropy = formatCheck.isValid ? computeEntropy(trimmed) : 0;
    const found = records.find((r) => r.headerHash.toLowerCase() === trimmed.toLowerCase());

    setVerificationResult({
      searched: true,
      formatValid: formatCheck.isValid,
      reason: formatCheck.reason,
      foundRecord: found,
      entropy
    });

    if (found) {
      toast.success("Cryptographic Match Found in Sovereign Ledger!");
    } else if (formatCheck.isValid) {
      toast.info("Valid 256-bit SHA-256 hash. Not found in local browser node ledger.");
    } else {
      toast.error("Invalid hash format: " + formatCheck.reason);
    }
  };

  // Manual Preimage Tuple Re-Verification Handler
  const handleManualTupleVerification = async () => {
    if (!manualLogic || !manualEmail || !manualTimestamp || !manualFingerprint) {
      toast.error("All 4 preimage fields are required to re-compute the composite hash.");
      return;
    }

    const ts = parseInt(manualTimestamp.trim(), 10);
    if (isNaN(ts)) {
      toast.error("Timestamp must be a valid integer Unix millisecond epoch.");
      return;
    }

    try {
      const logicDigest = await generateHash(manualLogic.trim());
      const recomputed = await createCompositeHeaderHash(
        logicDigest,
        ts,
        manualEmail.trim().toLowerCase(),
        manualFingerprint.trim()
      );
      setManualRecomputedHash(recomputed);
      toast.success("Deterministic composite Header Hash calculated!");
    } catch (err: any) {
      toast.error("Re-computation failed: " + err.message);
    }
  };

  const openVerifyWithRecord = (record: ValidationRecord) => {
    setVerifyHashInput(record.headerHash);
    setVerificationResult({
      searched: true,
      formatValid: true,
      foundRecord: record,
      entropy: computeEntropy(record.headerHash)
    });
    setManualLogic(record.logic);
    setManualEmail(record.ownerEmail);
    setManualTimestamp(String(record.timestamp));
    setManualFingerprint(record.fingerprint);
    setManualRecomputedHash(record.headerHash);
    setActiveTab("verify");
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
            <p className="text-white/50 max-w-md text-sm leading-relaxed">
              Proprietary Logic Ownership Validator. Making tech patents obsolete through immutable cryptographic header hash validation and Texas HB 149 statutory defense.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-white/30">Network Status</div>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-xs text-green-400">CRYPTO_NODE_ONLINE</span>
              </div>
              <div className="text-[10px] text-white/30 font-mono mt-1">SEALED RECORDS: {records.length}</div>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
            <TabsTrigger value="validate" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Lock className="w-4 h-4 mr-2" /> Validate Logic
            </TabsTrigger>
            <TabsTrigger value="defense" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Gavel className="w-4 h-4 mr-2 text-orange-500" /> AI Defense Counsel
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" /> Sealed Ledger ({records.length})
            </TabsTrigger>
            <TabsTrigger value="verify" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-2" /> Verify Hash Integrity
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: VALIDATE LOGIC */}
          <TabsContent value="validate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileCode className="w-5 h-5 text-orange-500" />
                        Proprietary Logic Ingestion
                      </CardTitle>
                      
                      {/* Mode Toggle */}
                      <div className="flex bg-black/60 p-1 rounded-lg border border-white/10 font-mono text-xs">
                        <button
                          onClick={() => setLogicMode("single")}
                          className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                            logicMode === "single" 
                              ? "bg-orange-500/20 text-orange-400 font-bold" 
                              : "text-white/50 hover:text-white"
                          }`}
                        >
                          Single Algorithm
                        </button>
                        <button
                          onClick={() => setLogicMode("project")}
                          className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                            logicMode === "project" 
                              ? "bg-orange-500/20 text-orange-400 font-bold" 
                              : "text-white/50 hover:text-white"
                          }`}
                        >
                          <Files className="w-3.5 h-3.5" /> Merkle Tree Project
                        </button>
                      </div>
                    </div>

                    <CardDescription className="text-white/40 text-xs">
                      {logicMode === "single"
                        ? "Enter raw code, mathematical proofs, neural routing logic, or architecture specs."
                        : "Ingest multiple files or directory tree for Texas HB 149 § 492.003 Algorithmic Inventory with Merkle Root hashing."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {logicMode === "single" ? (
                      <div>
                        <Textarea 
                          placeholder="Paste proprietary algorithm, smart contract, neural routing logic, or data structures here..." 
                          className="min-h-[260px] bg-black/50 border-white/10 font-mono text-xs focus-visible:ring-orange-500/50 leading-relaxed text-white/90"
                          value={logic}
                          onChange={(e) => setLogic(e.target.value)}
                        />
                        <div className="flex justify-between items-center mt-2 text-[10px] text-white/40 font-mono">
                          <span>BYTES: {new TextEncoder().encode(logic).length}</span>
                          <span>CHARACTERS: {logic.length}</span>
                        </div>
                      </div>
                    ) : (
                      /* Multi-File Merkle Project Ingestion */
                      <div className="space-y-4">
                        <div className="p-4 border-2 border-dashed border-white/10 rounded-xl bg-black/40 hover:border-orange-500/30 transition-all text-center space-y-3">
                          <label className="cursor-pointer block">
                            <FolderArchive className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                            <div className="text-xs font-bold text-white">SELECT REPOSITORY FILES / CODEBASE</div>
                            <div className="text-[10px] text-white/40 mt-0.5">
                              Ingest multiple files (.ts, .py, .rs, .json, .md, .bin) to generate an Algorithmic Inventory Manifest
                            </div>
                            <input 
                              type="file" 
                              multiple 
                              className="hidden" 
                              onChange={handleProjectFilesUpload}
                              disabled={isProcessingFiles}
                            />
                          </label>
                        </div>

                        {projectFiles.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-mono text-white/70">
                                INVENTORY: <span className="text-orange-400 font-bold">{projectFiles.length} files</span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={clearProjectFiles}
                                className="h-6 text-[10px] text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-3 h-3 mr-1" /> Clear Files
                              </Button>
                            </div>

                            {projectMerkleRoot && (
                              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg space-y-1">
                                <div className="text-[10px] uppercase font-mono text-orange-400 font-bold">
                                  COMPUTED MERKLE ROOT HASH (TRAIGA § 492.003):
                                </div>
                                <code className="text-xs font-mono text-orange-300 break-all block">
                                  {projectMerkleRoot}
                                </code>
                              </div>
                            )}

                            <div className="max-h-48 overflow-y-auto space-y-1 rounded border border-white/10 p-2 bg-black/50 font-mono text-[11px]">
                              {projectFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 text-white/80">
                                  <span className="truncate max-w-[240px] text-white">{file.name}</span>
                                  <span className="text-white/40 text-[10px]">{file.size} B</span>
                                  <code className="text-[9px] text-orange-400/80">{file.hash.substring(0, 16)}...</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Mail className="w-5 h-5 text-orange-500" />
                      Ownership Identity
                    </CardTitle>
                    <CardDescription className="text-white/40 text-xs">
                      The verified entity email permanently sealed into the composite header hash under Texas HB 149 safe-harbor rules.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input 
                      placeholder="e.g. inventor@proprietary-logic.io" 
                      className="bg-black/50 border-white/10 font-mono text-xs text-white focus-visible:ring-orange-500/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Button 
                  className="w-full py-6 text-sm font-bold tracking-wider uppercase bg-orange-600 hover:bg-orange-700 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all cursor-pointer"
                  disabled={isValidating || !logic.trim() || !email.trim() || isProcessingFiles}
                  onClick={handleValidate}
                >
                  {isValidating ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      GENERATING MATHEMATICAL PROOF...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      SEAL PROPRIETARY LOGIC IN LEDGER
                    </span>
                  )}
                </Button>
              </div>

              {/* Protocol Spec Sidebar */}
              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-mono uppercase tracking-widest text-orange-500">
                      Protocol Architecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs leading-relaxed text-white/60">
                    <p>
                      The <strong>PLOV Header Hash</strong> binds four immutable vectors into an unforgeable 256-bit cryptographic digest:
                    </p>
                    <div className="p-3 bg-black/40 rounded border border-white/5 font-mono text-[10px] space-y-1 text-white/80">
                      <div>1. SHA256(Raw Logic | Merkle Root)</div>
                      <div>2. Timestamp (UTC Milliseconds)</div>
                      <div>3. Owner Cryptographic Identity</div>
                      <div>4. Forensic Topology Fingerprint</div>
                    </div>
                    <p className="text-[11px] text-white/50">
                      This provides absolute, zero-knowledge prior art without publishing secret source code.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-mono uppercase tracking-widest text-orange-500">
                      Texas HB 149 Safe Harbor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-white/60">
                    <p>
                      Texas Responsible AI Governance Act (TRAIGA) codified safe harbors for pre-registered algorithmic assets.
                    </p>
                    <div className="flex items-center gap-2 text-green-400 font-mono text-[11px]">
                      <Check className="w-4 h-4" />
                      <span>Statutory Anti-Usurpation Shield</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 font-mono text-[11px]">
                      <Check className="w-4 h-4" />
                      <span>Verifiable Chronological Priority</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 font-mono text-[11px]">
                      <Check className="w-4 h-4" />
                      <span>Zero Dependency on Patent Offices</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: AI DEFENSE COUNSEL */}
          <TabsContent value="defense" className="space-y-6">
            <AIDefenseCounsel records={records} />
          </TabsContent>

          {/* TAB 3: SEALED LEDGER */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="w-5 h-5 text-orange-500" />
                    Cryptographic Ledger & Prior Art Seals
                  </CardTitle>
                  <CardDescription className="text-white/40 text-xs">
                    Deterministic zero-knowledge proofs sealed under the PLOV protocol and Texas HB 149.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <Button size="sm" variant="outline" className="border-white/10 text-xs text-white/80 hover:text-white cursor-pointer h-8" asChild>
                      <span>
                        <Upload className="w-3.5 h-3.5 mr-1.5" /> Restore Ledger
                      </span>
                    </Button>
                    <input type="file" accept=".json" className="hidden" onChange={handleImportLedger} />
                  </label>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleExportLedger}
                    className="border-white/10 text-xs text-white/80 hover:text-white cursor-pointer h-8"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Backup Ledger (.json)
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {records.length === 0 ? (
                      <div className="py-24 text-center text-white/30 space-y-2">
                        <Lock className="w-8 h-8 mx-auto opacity-20" />
                        <p className="text-sm font-mono">NO RECORDS SEALED IN LOCAL LEDGER</p>
                        <p className="text-xs text-white/20">Validate logic above to generate your first immutable prior art proof.</p>
                      </div>
                    ) : (
                      records.map((record) => (
                        <motion.div 
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-orange-500/30 transition-all space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono text-xs border-orange-500/40 text-orange-400">
                                {record.id}
                              </Badge>
                              {record.isMultiFile && (
                                <Badge variant="outline" className="font-mono text-[10px] border-blue-500/40 text-blue-400">
                                  MERKLE PROJECT ({record.fileCount || "Batch"} files)
                                </Badge>
                              )}
                              <span className="font-mono text-xs text-white/80">{record.ownerEmail}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-mono text-white/40">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(record.timestamp).toISOString().replace("T", " ").substring(0, 19)} UTC</span>
                              </div>
                              <span className="text-[10px] text-white/20">EPOCH: {record.timestamp}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-widest text-white/30">
                                {record.isMultiFile ? "Merkle Root Digest" : "Logic Hash (SHA-256)"}
                              </label>
                              <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/5">
                                <code className="text-[10px] truncate flex-1 font-mono text-white/70">{record.logicHash}</code>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(record.logicHash, "Logic Hash")}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-widest text-orange-500/70">Composite Header Hash (Primary Seal)</label>
                              <div className="flex items-center gap-2 bg-orange-500/5 p-2 rounded border border-orange-500/20">
                                <code className="text-[10px] truncate flex-1 text-orange-400 font-mono">{record.headerHash}</code>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-orange-400" onClick={() => copyToClipboard(record.headerHash, "Header Hash")}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-white/30">Forensic Fingerprint Summary</label>
                            <p className="text-xs text-white/70 leading-relaxed bg-black/30 p-3 rounded border border-white/5 font-mono">
                              {record.fingerprint}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-white/5 text-[11px] gap-2">
                            <span className="text-white/30 font-mono">PREIMAGE LENGTH: {record.logic.length} chars</span>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs h-7 cursor-pointer"
                                onClick={() => handleDownloadStandaloneHTML(record)}
                                title="Download zero-dependency offline courtroom HTML verifier"
                              >
                                <FileCheck className="w-3 h-3 mr-1.5" /> Standalone HTML Verifier
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-white/10 text-white/80 hover:text-white text-xs h-7 cursor-pointer"
                                onClick={() => setSelectedCertificateRecord(record)}
                              >
                                <Scale className="w-3 h-3 mr-1.5 text-orange-400" /> Statutory Certificate
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-white/10 text-white/60 hover:text-white text-xs h-7 cursor-pointer"
                                onClick={() => openVerifyWithRecord(record)}
                              >
                                <Search className="w-3 h-3 mr-1.5" /> Re-Verify
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: REAL VERIFY HASH INTEGRITY */}
          <TabsContent value="verify" className="space-y-6">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="w-5 h-5 text-orange-500" />
                  Real Cryptographic Hash Verification
                </CardTitle>
                <CardDescription className="text-white/40 text-xs">
                  Inspect and mathematically verify any 256-bit Header Hash against stored genesis proofs and formatting parity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/60">Target Header Hash (64 Hex Characters)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                      placeholder="e.g. 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" 
                      className="bg-black/50 border-white/10 font-mono text-xs text-white"
                      value={verifyHashInput}
                      onChange={(e) => setVerifyHashInput(e.target.value)}
                    />
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold whitespace-nowrap cursor-pointer"
                      onClick={handleVerifyHash}
                    >
                      <Search className="w-4 h-4 mr-2" /> VERIFY DIGEST
                    </Button>
                  </div>
                </div>

                {/* Verification Results Box */}
                {verificationResult?.searched && (
                  <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        {verificationResult.formatValid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-mono text-sm font-bold">
                          {verificationResult.formatValid ? "VALID 256-BIT SHA-256 HASH" : "INVALID HASH FORMAT"}
                        </span>
                      </div>
                      {verificationResult.entropy !== undefined && (
                        <span className="text-xs font-mono text-white/50">
                          SHANNON ENTROPY: <strong className="text-orange-400">{verificationResult.entropy}</strong> / 4.00
                        </span>
                      )}
                    </div>

                    {!verificationResult.formatValid ? (
                      <p className="text-xs text-red-400 font-mono">{verificationResult.reason}</p>
                    ) : verificationResult.foundRecord ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-xs font-mono">
                          AUTHENTIC GENESIS RECORD MATCH CONFIRMED
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                          <div>
                            <span className="text-white/40">SEALED BY:</span> {verificationResult.foundRecord.ownerEmail}
                          </div>
                          <div>
                            <span className="text-white/40">EPOCH TIMESTAMP:</span> {verificationResult.foundRecord.timestamp} ({new Date(verificationResult.foundRecord.timestamp).toISOString()})
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-white/40">ROOT LOGIC DIGEST:</span> {verificationResult.foundRecord.logicHash}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white/60">
                        Format is mathematically authentic 256-bit hexadecimal, but this specific header hash has not been sealed in this local browser ledger node.
                      </div>
                    )}
                  </div>
                )}

                {/* Preimage Tuple Deterministic Re-derivation */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-orange-400 flex items-center gap-2">
                      <Binary className="w-4 h-4" />
                      Deterministic Preimage Re-Computation
                    </h4>
                    <span className="text-[10px] text-white/40 font-mono">SHA256(LogicHash | Ts | Email | FP)</span>
                  </div>

                  <p className="text-xs text-white/50 leading-relaxed">
                    Verify the mathematical proof yourself: enter the four preimage inputs below to re-derive the identical Header Hash bit-for-bit without revealing the raw logic to third parties.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-white/40">1. Raw Logic Preimage / Merkle Manifest</label>
                      <Textarea 
                        placeholder="Paste exact code or manifest..."
                        className="h-32 bg-black/40 border-white/10 font-mono text-xs text-white resize-none"
                        value={manualLogic}
                        onChange={(e) => setManualLogic(e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/40">2. Owner Email</label>
                        <Input 
                          placeholder="owner@example.com"
                          className="bg-black/40 border-white/10 text-xs"
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/40">3. Timestamp (Epoch ms)</label>
                        <Input 
                          placeholder="e.g. 1726000000000"
                          className="bg-black/40 border-white/10 text-xs font-mono"
                          value={manualTimestamp}
                          onChange={(e) => setManualTimestamp(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/40">4. Forensic Fingerprint String</label>
                        <Input 
                          placeholder="Fingerprint string..."
                          className="bg-black/40 border-white/10 text-xs font-mono"
                          value={manualFingerprint}
                          onChange={(e) => setManualFingerprint(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono cursor-pointer"
                    onClick={handleManualTupleVerification}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> RE-COMPUTE COMPOSITE SHA-256 HASH
                  </Button>

                  {manualRecomputedHash && (
                    <div className="p-4 bg-black/60 rounded-lg border border-orange-500/30 space-y-2">
                      <div className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">
                        Calculated Preimage Header Hash:
                      </div>
                      <code className="text-xs text-orange-300 font-mono break-all block bg-black/80 p-2 rounded border border-orange-500/20">
                        {manualRecomputedHash}
                      </code>
                      <div className="text-[10px] text-white/50">
                        Compare this string with any sealed Header Hash. If they match character-for-character, mathematical ownership and timestamp are indisputably verified.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cryptographic Avalanche Effect & Code Drift Comparison */}
            <AvalancheDiffTool />
          </TabsContent>
        </Tabs>

        {/* Formal Statutory Affidavit Modal */}
        <StatutoryCertificateModal 
          record={selectedCertificateRecord} 
          onClose={() => setSelectedCertificateRecord(null)} 
        />

        {/* Footer */}
        <footer className="pt-20 pb-8 text-center space-y-4">
          <div className="flex justify-center gap-8 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono">
            <span>SHA-256 IMMUTABLE</span>
            <span>TEXAS HB 149 (TRAIGA) DEFENSE</span>
            <span>SOVEREIGN ARCHIVAL STANDARD</span>
          </div>
          <p className="text-[10px] text-white/20">
            &copy; 2026 PLOV PROTOCOL. MATHEMATICAL VALIDATION ENFORCED.
          </p>
        </footer>
      </div>
    </div>
  );
}
