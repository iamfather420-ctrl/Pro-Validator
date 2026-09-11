import * as React from "react";
import { Binary, ArrowRightLeft, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateHash, computeHammingDistance } from "@/src/lib/crypto";

export default function AvalancheDiffTool() {
  const [logicA, setLogicA] = React.useState<string>(
    `function calculateConsensusScore(validators) {\n  return validators.reduce((acc, v) => acc + v.stake, 0);\n}`
  );
  const [logicB, setLogicB] = React.useState<string>(
    `function calculateConsensusScore(validators) {\n  return validators.reduce((acc, v) => acc + v.stake, 1);\n}`
  );

  const [hashA, setHashA] = React.useState<string>("");
  const [hashB, setHashB] = React.useState<string>("");
  const [diffStats, setDiffStats] = React.useState<{ distance: number; totalBits: number; percentage: number }>({
    distance: 0,
    totalBits: 256,
    percentage: 0
  });

  React.useEffect(() => {
    let cancelled = false;
    async function recompute() {
      const hA = await generateHash(logicA);
      const hB = await generateHash(logicB);
      if (cancelled) return;
      setHashA(hA);
      setHashB(hB);
      setDiffStats(computeHammingDistance(hA, hB));
    }
    recompute();
    return () => {
      cancelled = true;
    };
  }, [logicA, logicB]);

  const mutateSingleBit = () => {
    // Modify one character in logic B
    if (logicB.endsWith(";")) {
      setLogicB(logicB.slice(0, -1));
    } else {
      setLogicB(logicB + ";");
    }
  };

  const copyAToB = () => {
    setLogicB(logicA);
  };

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Binary className="w-5 h-5 text-orange-500" />
              Cryptographic Avalanche & Tamper Sensitivity Analyzer
            </CardTitle>
            <CardDescription className="text-white/40 text-xs">
              Demonstrates why any unauthorized modification to your logic—even a single character—completely changes the 256-bit hash.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={mutateSingleBit}
              className="border-white/10 text-xs text-white/70 hover:text-white cursor-pointer h-7"
            >
              <Sparkles className="w-3 h-3 mr-1 text-orange-400" /> Flip 1 Char
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={copyAToB}
              className="border-white/10 text-xs text-white/70 hover:text-white cursor-pointer h-7"
            >
              <ArrowRightLeft className="w-3 h-3 mr-1" /> Reset Parity
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Avalanche Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-black/40 border border-white/10 font-mono">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">Hamming Bit Disparity</div>
            <div className="text-xl font-bold text-orange-400 mt-0.5">
              {diffStats.distance} <span className="text-xs text-white/40 font-normal">/ {diffStats.totalBits} bits</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">Avalanche Entropy Rate</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {diffStats.percentage}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">Integrity Verdict</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {diffStats.distance === 0 ? (
                <span className="text-green-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> EXACT MATCH (0 DRIFT)
                </span>
              ) : (
                <span className="text-orange-400 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> TAMPER-EVIDENT DRIFT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Side by side code comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60">Specimen A (Original Proprietary Logic)</span>
              <span className="text-[10px] font-mono text-white/30">{logicA.length} chars</span>
            </div>
            <Textarea
              className="h-28 bg-black/50 border-white/10 font-mono text-xs text-white resize-none"
              value={logicA}
              onChange={(e) => setLogicA(e.target.value)}
            />
            <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
              <div className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Hash A (SHA-256)</div>
              <div className="font-mono text-[10px] text-white/70 break-all">{hashA}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-orange-400/80">Specimen B (Modified / Disputed Logic)</span>
              <span className="text-[10px] font-mono text-white/30">{logicB.length} chars</span>
            </div>
            <Textarea
              className="h-28 bg-black/50 border-white/10 font-mono text-xs text-white resize-none"
              value={logicB}
              onChange={(e) => setLogicB(e.target.value)}
            />
            <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
              <div className="text-[9px] uppercase tracking-widest text-orange-500/70 font-mono">Hash B (SHA-256)</div>
              <div className="font-mono text-[10px] text-orange-400 break-all">{hashB}</div>
            </div>
          </div>
        </div>

        {/* Character-by-character visual nibble comparison */}
        {hashA && hashB && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
              Hex Nibble Diff Comparison (Green = Matching Nibble, Orange = Flipped Nibble)
            </div>
            <div className="flex flex-wrap gap-1 p-3 bg-black/60 rounded-lg border border-white/10 font-mono text-[11px]">
              {Array.from({ length: 64 }).map((_, idx) => {
                const charA = hashA[idx] || "";
                const charB = hashB[idx] || "";
                const matches = charA === charB;
                return (
                  <span 
                    key={idx} 
                    className={`px-1 rounded ${
                      matches 
                        ? "bg-green-500/20 text-green-300 font-bold" 
                        : "bg-orange-500/20 text-orange-400"
                    }`}
                    title={`Pos ${idx}: A=${charA}, B=${charB}`}
                  >
                    {charB}
                  </span>
                );
              })}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
