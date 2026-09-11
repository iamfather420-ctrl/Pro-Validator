import * as React from "react";
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Scale, 
  Clock, 
  Mail, 
  Fingerprint, 
  Lock,
  Globe,
  AlertTriangle,
  FileCheck,
  Building2,
  FileSignature
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ValidationRecord } from "./LogicValidator";
import { 
  generateStandaloneVerifierHTML, 
  generateFormalDemandLetter,
  generateUSPTO130Declaration,
  generateRFC6920URI
} from "@/src/lib/crypto";

interface StatutoryCertificateModalProps {
  record: ValidationRecord | null;
  onClose: () => void;
}

export default function StatutoryCertificateModal({ record, onClose }: StatutoryCertificateModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [activeView, setActiveView] = React.useState<"certificate" | "uspto" | "demandLetter">("certificate");
  const [adverseEntity, setAdverseEntity] = React.useState("Prospective Infringing Entity / Adverse Patent Applicant");
  const [targetPatentNumber, setTargetPatentNumber] = React.useState("US Patent / Application Under Challenge (e.g. US 11,xxx,xxx)");
  const [demandCopied, setDemandCopied] = React.useState(false);
  const [usptoCopied, setUsptoCopied] = React.useState(false);

  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStandaloneHTML = () => {
    const htmlContent = generateStandaloneVerifierHTML(record);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PLOV-Courtroom-Proof-${record.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded Standalone Offline Courtroom HTML Verifier. Open anywhere without internet.");
  };

  const handleDownloadJSON = () => {
    const certPayload = {
      protocol: "PLOV-TEXAS-HB149-TRAIGA",
      version: "2026.1",
      certificateId: `CERT-${record.id}`,
      jurisdiction: "State of Texas / US Common Law Prior Art",
      statutoryReference: "Texas HB 149 (TRAIGA) § 492.003, § 492.008",
      rfc6920Uri: generateRFC6920URI(record.headerHash),
      timestamp: {
        iso: new Date(record.timestamp).toISOString(),
        unixMs: record.timestamp
      },
      owner: {
        identifier: record.ownerEmail
      },
      cryptographicProof: {
        algorithm: "SHA-256 (FIPS 180-4)",
        logicHash: record.logicHash,
        compositeHeaderHash: record.headerHash,
        fingerprint: record.fingerprint,
        preimageConstruction: "SHA256(logicHash | timestamp | ownerEmail | fingerprint)"
      },
      integrityAttestation: "Deterministic zero-knowledge proof of logic custody without disclosure."
    };

    const blob = new Blob([JSON.stringify(certPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PLOV-Certificate-${record.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Statutory Certificate JSON manifest exported.");
  };

  const handleCopyAffidavit = () => {
    const text = `================================================================================
STATUTORY AFFIDAVIT OF PROPRIETARY LOGIC OWNERSHIP & PRIOR ART REGISTRATION
PROTOCOL: PLOV / TEXAS HB 149 (TRAIGA) SAFE HARBOR COMPLIANCE
CERTIFICATE ID: CERT-${record.id}
RFC 6920 URI: ${generateRFC6920URI(record.headerHash)}
================================================================================

JURISDICTION: State of Texas & Federal Common Law Prior Art Standards
STATUTORY BASIS: Texas Responsible AI Governance Act (TRAIGA - HB 149) § 492.003 & § 492.008

1. IDENTIFIED INVENTOR / CUSTODIAN:
   ${record.ownerEmail}

2. DETERMINISTIC TIME OF CONCEPTION & SEALING:
   ${new Date(record.timestamp).toUTCString()} [Epoch Milliseconds: ${record.timestamp}]

3. CRYPTOGRAPHIC EVIDENCE:
   - Composite Header Seal (SHA-256): ${record.headerHash}
   - Logic Content Digest (SHA-256):  ${record.logicHash}
   - Forensic Fingerprint:            ${record.fingerprint}

4. PREIMAGE EQUATION:
   HeaderHash = SHA256(LogicHash || Timestamp || OwnerEmail || Fingerprint)

5. LEGAL ATTESTATION:
   The undersigned mathematical seal establishes prima facie cryptographic evidence 
   that the proprietary algorithmic logic existed in complete operational form 
   under the exclusive custody of the registered owner as of the specified timestamp.
   This document qualifies as an immutable statutory record under Texas HB 149 rules.
================================================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Affidavit text copied to clipboard.");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyDemandLetter = () => {
    const letter = generateFormalDemandLetter(record, adverseEntity);
    navigator.clipboard.writeText(letter);
    setDemandCopied(true);
    toast.success("Formal Cease & Desist Demand Notice copied.");
    setTimeout(() => setDemandCopied(false), 2500);
  };

  const handleDownloadDemandLetter = () => {
    const letter = generateFormalDemandLetter(record, adverseEntity);
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PLOV-Demand-Notice-${record.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cease & Desist notice downloaded as text document.");
  };

  const handleCopyUSPTO = () => {
    const declaration = generateUSPTO130Declaration(record, targetPatentNumber);
    navigator.clipboard.writeText(declaration);
    setUsptoCopied(true);
    toast.success("USPTO 37 CFR § 1.130 Declaration copied to clipboard.");
    setTimeout(() => setUsptoCopied(false), 2500);
  };

  const handleDownloadUSPTO = () => {
    const declaration = generateUSPTO130Declaration(record, targetPatentNumber);
    const blob = new Blob([declaration], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `USPTO-Rule130-Declaration-${record.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("USPTO § 1.130 Declaration downloaded.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="relative w-full max-w-4xl bg-[#0a0a0c] border border-orange-500/40 rounded-2xl shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden print:border-none print:shadow-none print:text-black print:bg-white text-white my-8">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-white/[0.02] print:hidden">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-orange-500" />
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => setActiveView("certificate")}
                className={`text-xs font-mono uppercase px-3 py-1 rounded transition-colors cursor-pointer ${
                  activeView === "certificate" 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold" 
                    : "text-white/50 hover:text-white"
                }`}
              >
                Statutory Certificate
              </button>
              <button 
                onClick={() => setActiveView("uspto")}
                className={`text-xs font-mono uppercase px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                  activeView === "uspto" 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold" 
                    : "text-white/50 hover:text-white"
                }`}
              >
                <Building2 className="w-3 h-3" /> USPTO § 1.130 Invalidation Filing
              </button>
              <button 
                onClick={() => setActiveView("demandLetter")}
                className={`text-xs font-mono uppercase px-3 py-1 rounded transition-colors cursor-pointer ${
                  activeView === "demandLetter" 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold" 
                    : "text-white/50 hover:text-white"
                }`}
              >
                Cease & Desist Notice
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDownloadStandaloneHTML}
              className="bg-orange-500/10 border-orange-500/40 text-orange-400 hover:bg-orange-500/20 text-xs cursor-pointer h-8"
              title="Download an offline, zero-dependency HTML file that verifies the proof in any browser"
            >
              <FileCheck className="w-3.5 h-3.5 mr-1.5" /> Standalone HTML Proof
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handlePrint}
              className="border-white/10 text-xs text-white/80 hover:text-white cursor-pointer h-8"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDownloadJSON}
              className="border-white/10 text-xs text-white/80 hover:text-white cursor-pointer h-8"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export JSON
            </Button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. Certificate View */}
        {activeView === "certificate" && (
          <div className="p-8 sm:p-10 space-y-6 print:p-0">
            
            {/* Official Emblem & Header */}
            <div className="text-center space-y-2 border-b border-white/10 pb-6 print:border-black">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] tracking-widest uppercase mb-1 print:text-black print:border-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                Cryptographic Affidavit of Origin & Prior Art
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif tracking-tight font-bold text-white print:text-black">
                CERTIFICATE OF PROPRIETARY LOGIC OWNERSHIP
              </h1>
              <p className="text-xs font-mono text-white/50 tracking-wider print:text-black/70">
                TEXAS RESPONSIBLE AI GOVERNANCE ACT (TRAIGA - HB 149) STATUTORY SAFE HARBOR &bull; § 492.003 & § 492.008
              </p>
            </div>

            {/* Certificate Identifier Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 font-mono text-xs print:border-black print:bg-transparent">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-white/40 print:text-black/60">Certificate ID</div>
                <div className="font-bold text-white print:text-black">CERT-{record.id}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-widest text-white/40 print:text-black/60">Time of Genesis (UTC)</div>
                <div className="font-bold text-white print:text-black">{new Date(record.timestamp).toISOString().replace("T", " ").substring(0, 19)}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-widest text-white/40 print:text-black/60">Unix Epoch</div>
                <div className="font-bold text-white print:text-black">{record.timestamp} ms</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-widest text-white/40 print:text-black/60">Cryptographic Standard</div>
                <div className="font-bold text-orange-400 print:text-black">SHA-256 (FIPS 180-4)</div>
              </div>
            </div>

            {/* Cryptographic Seals Box */}
            <div className="space-y-4 p-5 rounded-xl bg-black/60 border border-orange-500/20 font-mono print:border-black print:bg-white">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-1 print:text-black">
                  Composite Header Hash (Primary Statutory Seal)
                </div>
                <div className="p-2.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs break-all print:text-black print:border-black">
                  {record.headerHash}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1 print:text-black/60">
                    Preimage Logic Content Digest
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/10 text-[11px] text-white/80 break-all print:text-black print:border-black">
                    {record.logicHash}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1 print:text-black/60">
                    Registered Sovereign Owner
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/10 text-[11px] text-white/80 truncate print:text-black print:border-black">
                    {record.ownerEmail}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1 print:text-black/60">
                  Forensic Abstract & Structural Topology
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-white/10 text-[10px] text-white/60 print:text-black print:border-black">
                  {record.fingerprint}
                </div>
              </div>
            </div>

            {/* Formal Legal Declaration Clause */}
            <div className="p-4 rounded-xl border border-white/10 text-xs text-white/70 space-y-2 leading-relaxed print:text-black print:border-black">
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider print:text-black flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-orange-500 print:text-black" />
                Statutory Attestation & Safe Harbor Defense
              </h3>
              <p className="text-[11px]">
                This certifies that the proprietary logic described by digest <code className="font-mono text-orange-400 print:text-black">{record.logicHash.substring(0, 16)}...</code> was mathematically sealed into the composite header hash on the attested epoch timestamp. Pursuant to <strong>Texas HB 149 (TRAIGA)</strong> provisions governing algorithmic inventory and pre-registered cryptographic safe harbors, this immutable certificate serves as prima facie evidence establishing priority of invention, custodial provenance, and non-usurpation rights across all state and federal judicial jurisdictions.
              </p>
            </div>

            {/* Signatures & Execution Line */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-white/40 print:text-black/70 gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div>PROTOCOL ISSUER: PLOV SOVEREIGN REGISTRY</div>
                <div className="text-[10px]">VERIFICATION STANDALONE: PLOV-Courtroom-Proof-{record.id}.html</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-orange-500/40 flex items-center justify-center text-[8px] text-orange-400 text-center font-bold p-1 print:border-black print:text-black">
                  SEALED BY PROTOCOL
                </div>
                <div className="text-right">
                  <div className="font-bold text-white/80 print:text-black">DETERMINISTIC VERIFICATION</div>
                  <div className="text-[10px]">ZERO-KNOWLEDGE PRESERVED</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 print:hidden">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCopyAffidavit}
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? "Copied" : "Copy Legal Text Affidavit"}
              </Button>
            </div>

          </div>
        )}

        {/* 2. USPTO 37 C.F.R. § 1.130 Declaration View (Defeating Patent Rejections) */}
        {activeView === "uspto" && (
          <div className="p-8 sm:p-10 space-y-6">
            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-mono uppercase tracking-widest">
                <Building2 className="w-4 h-4" />
                USPTO 37 C.F.R. § 1.130 / § 1.131 Declaration of Prior Inventorship
              </div>
              <h2 className="text-xl font-bold">Federal Patent Office Prior Art Invalidation Filing</h2>
              <p className="text-xs text-white/50">
                Submit this formal legal instrument to the United States Patent and Trademark Office (USPTO), patent examiners, or the Patent Trial and Appeal Board (PTAB) to legally disqualify and invalidate adverse patent claims under 35 U.S.C. § 102.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-white/40">Target Adverse Patent / Application Number</label>
              <Input 
                value={targetPatentNumber}
                onChange={(e) => setTargetPatentNumber(e.target.value)}
                placeholder="e.g. US Patent 11,234,567 or Patent Application 18/987,654"
                className="bg-black/50 border-white/10 text-white text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-white/40">
                <span>USPTO STATUTORY INSTRUMENT PREVIEW:</span>
                <span>FEDERAL AUTHORITY: 37 C.F.R. § 1.130(a) & 35 U.S.C. § 102</span>
              </div>
              <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-white/80 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[340px]">
                {generateUSPTO130Declaration(record, targetPatentNumber)}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadUSPTO}
                className="border-white/10 text-xs text-white/80 hover:text-white cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download (.txt)
              </Button>
              <Button 
                size="sm" 
                onClick={handleCopyUSPTO}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
              >
                {usptoCopied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {usptoCopied ? "Copied" : "Copy USPTO Declaration"}
              </Button>
            </div>
          </div>
        )}

        {/* 3. Demand Letter View */}
        {activeView === "demandLetter" && (
          <div className="p-8 sm:p-10 space-y-6">
            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-mono uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4" />
                Texas HB 149 Formal Cease & Desist Demand Notice
              </div>
              <h2 className="text-xl font-bold">Statutory Notice of Prior Art & Safe Harbor Claim</h2>
              <p className="text-xs text-white/50">
                Serve this notice to adverse parties, infringing corporations, or competing patent applicants asserting your mathematical prior conception.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-white/40">Target Adverse Entity / Infringer Name</label>
              <Input 
                value={adverseEntity}
                onChange={(e) => setAdverseEntity(e.target.value)}
                placeholder="e.g. Acme AI Corp, Competitor LLC, or Patent Challenging Party"
                className="bg-black/50 border-white/10 text-white text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-white/40">
                <span>PREVIEW OF GENERATED LEGAL NOTICE:</span>
                <span>STATUTORY CITATION: TEXAS HB 149 § 492</span>
              </div>
              <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-white/80 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[340px]">
                {generateFormalDemandLetter(record, adverseEntity)}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadDemandLetter}
                className="border-white/10 text-xs text-white/80 hover:text-white cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download (.txt)
              </Button>
              <Button 
                size="sm" 
                onClick={handleCopyDemandLetter}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
              >
                {demandCopied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {demandCopied ? "Copied" : "Copy Demand Notice"}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
