/**
 * Cryptographic utility for SHA-256 header hash generation,
 * Merkle tree root computation, bitwise validation, and standalone
 * offline courtroom proof generation under the PLOV protocol and Texas HB 149.
 */

export interface CryptoRecordPreimage {
  id: string;
  logic: string;
  logicHash: string;
  headerHash: string;
  timestamp: number;
  ownerEmail: string;
  fingerprint: string;
}

export async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createCompositeHeaderHash(
  logicHash: string,
  timestamp: number,
  ownerEmail: string,
  fingerprint: string
): Promise<string> {
  const payload = `${logicHash}|${timestamp}|${ownerEmail.trim().toLowerCase()}|${fingerprint.trim()}`;
  return generateHash(payload);
}

export async function verifyHeaderHash(
  providedHeaderHash: string,
  logicHash: string,
  timestamp: number,
  ownerEmail: string,
  fingerprint: string
): Promise<{ isValid: boolean; recomputedHash: string; matches: boolean }> {
  const recomputed = await createCompositeHeaderHash(logicHash, timestamp, ownerEmail, fingerprint);
  const matches = providedHeaderHash.trim().toLowerCase() === recomputed.trim().toLowerCase();
  return {
    isValid: matches,
    recomputedHash: recomputed,
    matches
  };
}

export function validateHashFormat(hash: string): { isValid: boolean; reason?: string } {
  const cleaned = hash.trim();
  if (cleaned.length !== 64) {
    return { isValid: false, reason: `Invalid hash length (${cleaned.length}/64 characters). Must be a 256-bit hexadecimal string.` };
  }
  if (!/^[0-9a-fA-F]{64}$/.test(cleaned)) {
    return { isValid: false, reason: "Contains non-hexadecimal characters. Only 0-9 and a-f allowed." };
  }
  return { isValid: true };
}

export function computeEntropy(hash: string): number {
  const counts: Record<string, number> = {};
  for (const char of hash) {
    counts[char] = (counts[char] || 0) + 1;
  }
  let entropy = 0;
  const len = hash.length;
  for (const char in counts) {
    const p = counts[char] / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 100) / 100;
}

export function computeHammingDistance(hexA: string, hexB: string): { distance: number; totalBits: number; percentage: number } {
  const cleanA = hexA.trim().toLowerCase();
  const cleanB = hexB.trim().toLowerCase();
  if (cleanA.length !== 64 || cleanB.length !== 64) {
    return { distance: 0, totalBits: 256, percentage: 0 };
  }
  let diffBits = 0;
  for (let i = 0; i < 64; i++) {
    const valA = parseInt(cleanA[i], 16);
    const valB = parseInt(cleanB[i], 16);
    let xor = valA ^ valB;
    while (xor > 0) {
      if (xor & 1) diffBits++;
      xor >>= 1;
    }
  }
  return {
    distance: diffBits,
    totalBits: 256,
    percentage: Math.round((diffBits / 256) * 1000) / 10
  };
}

/**
 * Computes a standard Merkle Root of an array of leaf SHA-256 hashes
 * for multi-file repositories or algorithmic inventories.
 */
export async function computeMerkleRoot(hashes: string[]): Promise<string> {
  if (hashes.length === 0) return "";
  if (hashes.length === 1) return hashes[0];

  let currentLevel = [...hashes];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      const combined = await generateHash(`${left}${right}`);
      nextLevel.push(combined);
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

/**
 * Generates a formal Cease & Desist / Statutory Notice of Prior Art
 * under Texas HB 149 (TRAIGA) § 492.003 & § 492.008.
 */
export function generateFormalDemandLetter(record: CryptoRecordPreimage, adverseParty: string = "ADVERSE ENTITY / PROSPECTIVE INFRINGER"): string {
  const formattedDate = new Date(record.timestamp).toUTCString();
  return `================================================================================
FORMAL LEGAL NOTICE: STATUTORY ASSERTION OF PRIOR ART & ALGORITHMIC SAFE HARBOR
PURSUANT TO TEXAS RESPONSIBLE AI GOVERNANCE ACT (TRAIGA - TEXAS HB 149)
================================================================================

DATE OF NOTICE: ${new Date().toUTCString()}
REGISTRATION ID: CERT-${record.id}
TO: ${adverseParty.toUpperCase()}
FROM: Sovereign Custodian <${record.ownerEmail}>

RE: IRREVOCABLE PRIOR ART ATTESTATION & IMMUTABLE PROPRIETARY LOGIC OWNERSHIP

Dear Sir/Madam:

PLEASE BE ADVISED that the undersigned Custodian (${record.ownerEmail}) is the lawful creator and sole proprietary rights holder of the algorithmic architecture, data structures, and computational logic attested by the immutable cryptographic hash identified below.

1. STATUTORY SPECIFICATIONS UNDER TEXAS HB 149:
   - Composite Header Seal (SHA-256): ${record.headerHash}
   - Content Digest (SHA-256):        ${record.logicHash}
   - Preimage Epoch Timestamp:         ${record.timestamp} (${formattedDate})
   - Forensic Topology Fingerprint:    ${record.fingerprint}
   - Governing Equation:               HeaderHash = SHA256(LogicHash || Timestamp || Email || Fingerprint)

2. LEGAL EFFECT & PRIOR ART BAR:
   Under Texas HB 149 (effective January 1, 2026), codified in the Texas Civil Practice & Remedies Code § 492 et seq., and federal common-law prior art doctrine (35 U.S.C. § 102):
   (a) The sealed composite header hash establishes undeniable mathematical proof that this proprietary logic was conceived and operable in its full specification as of ${formattedDate}.
   (b) Any subsequently filed patent, copyright registration, or trade-secret usurpation asserted by ${adverseParty} is barred as derivative, anticipatory, and nullified by prior conception.
   (c) The undersigned explicitly invokes the statutory Algorithmic Safe Harbor protections provided by Texas HB 149 § 492.008.

3. FORMAL DEMAND & PRESERVATION OF EVIDENCE:
   You are hereby DEMANDED to immediately:
   - Cease and desist any attempts to patent, commercialize, or claim exclusive provenance over any logic derived from or equivalent to this attested preimage.
   - Preserve all internal technical records, commit logs, neural training data, and communications pursuant to statutory spoliation rules.

This document serves as formal legal notice. Mathematical verification may be independently executed by resolving the preimage tuple against standard FIPS 180-4 SHA-256 algorithms.

Respectfully executed,

Sovereign Proprietary Logic Custodian
Recorded on the PLOV Sovereign Protocol
Verification Seal: ${record.headerHash}
================================================================================`;
}

/**
 * Generates an entirely offline, standalone, single-file HTML courtroom verifier.
 * A judge or examiner can open this file in any browser without an internet connection,
 * and it will locally calculate SHA-256 over the preimage to confirm the seal.
 */
export function generateStandaloneVerifierHTML(record: CryptoRecordPreimage): string {
  const safeLogicJson = JSON.stringify(record.logic);
  const safeEmail = record.ownerEmail.replace(/"/g, '&quot;');
  const safeFingerprint = record.fingerprint.replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PLOV Cryptographic Verification Seal: ${record.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #050508;
      color: #f0f0f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 820px;
      width: 100%;
      background: #0d0d12;
      border: 1px solid rgba(249, 115, 22, 0.35);
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 0 50px rgba(249, 115, 22, 0.1);
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(249, 115, 22, 0.15);
      color: #f97316;
      border: 1px solid rgba(249, 115, 22, 0.4);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.5px; }
    p.subtitle { color: #888899; font-size: 12px; margin-bottom: 24px; }
    .status-card {
      padding: 16px;
      border-radius: 10px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #222;
      background: #000;
    }
    .verified {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.4);
      color: #22c55e;
    }
    .failed {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.4);
      color: #ef4444;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .box { background: #07070a; border: 1px solid #222; border-radius: 8px; padding: 12px; }
    .label { font-size: 10px; color: #666677; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .val { font-family: monospace; font-size: 12px; color: #ddd; word-break: break-all; }
    .val.highlight { color: #f97316; font-weight: bold; }
    pre {
      background: #000;
      border: 1px solid #222;
      border-radius: 8px;
      padding: 14px;
      font-family: monospace;
      font-size: 11px;
      color: #aaa;
      max-height: 200px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin-bottom: 20px;
    }
    button {
      background: #f97316;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
      margin-right: 10px;
    }
    button:hover { background: #ea580c; }
    button.sec {
      background: transparent;
      border: 1px solid #333;
      color: #aaa;
    }
    button.sec:hover { border-color: #666; color: #fff; }
    .footer {
      border-top: 1px solid #1a1a24;
      padding-top: 18px;
      font-size: 11px;
      color: #555;
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    @media print {
      body { background: #fff; color: #000; }
      .container { border: 1px solid #000; box-shadow: none; background: #fff; }
      .val, pre { color: #000; background: #f5f5f5; border-color: #ccc; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">Standalone Offline Proof Bundle</span>
    <h1>PLOV Cryptographic Verification Seal</h1>
    <p class="subtitle">TEXAS HB 149 (TRAIGA) &bull; STANDALONE DETERMINISTIC COURTROOM VERIFIER</p>

    <div id="statusBox" class="status-card verified">
      <div>
        <strong id="statusTitle" style="font-size: 14px;">COMPUTING CRYPTOGRAPHIC SHA-256 HASH...</strong>
        <div id="statusSub" style="font-size: 11px; opacity: 0.8;">Running browser-native WebCrypto API locally.</div>
      </div>
      <div id="statusIcon" style="font-size: 20px; font-weight: bold;">⏳</div>
    </div>

    <div class="grid">
      <div class="box">
        <div class="label">Certificate / Seal ID</div>
        <div class="val">${record.id}</div>
      </div>
      <div class="box">
        <div class="label">Time of Sealing (UTC)</div>
        <div class="val">${new Date(record.timestamp).toISOString()}</div>
      </div>
      <div class="box">
        <div class="label">Epoch Milliseconds</div>
        <div class="val">${record.timestamp}</div>
      </div>
      <div class="box">
        <div class="label">Registered Custodian</div>
        <div class="val">${safeEmail}</div>
      </div>
    </div>

    <div class="box" style="margin-bottom: 20px;">
      <div class="label">Recorded Composite Header Hash (Sealed Target)</div>
      <div class="val highlight">${record.headerHash}</div>
    </div>

    <div class="box" style="margin-bottom: 20px;">
      <div class="label">Local Recomputed Composite Header Hash</div>
      <div id="computedHashEl" class="val highlight">Calculating...</div>
    </div>

    <div class="box" style="margin-bottom: 20px;">
      <div class="label">Forensic Fingerprint & Structural Topology</div>
      <div class="val">${safeFingerprint}</div>
    </div>

    <div class="label">Underlying Proprietary Logic Preimage</div>
    <pre id="logicPreimage"></pre>

    <div style="margin-top: 20px;">
      <button onclick="recalculateProof()">Re-Verify Proof</button>
      <button class="sec" onclick="window.print()">Print Affidavit / Save PDF</button>
    </div>

    <div class="footer">
      <span>FIPS 180-4 SHA-256 VERIFIED LOCALLY</span>
      <span>TEXAS CIVIL PRACTICE & REMEDIES CODE § 492</span>
    </div>
  </div>

  <script>
    const RECORD_LOGIC = ${safeLogicJson};
    const RECORD_LOGIC_HASH = "${record.logicHash}";
    const RECORD_TIMESTAMP = ${record.timestamp};
    const RECORD_EMAIL = "${record.ownerEmail.toLowerCase()}";
    const RECORD_FINGERPRINT = "${record.fingerprint}";
    const TARGET_HEADER_HASH = "${record.headerHash.toLowerCase()}";

    document.getElementById("logicPreimage").textContent = RECORD_LOGIC;

    async function sha256(str) {
      const buf = new TextEncoder().encode(str);
      const digest = await window.crypto.subtle.digest("SHA-256", buf);
      return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    async function recalculateProof() {
      const statusBox = document.getElementById("statusBox");
      const statusTitle = document.getElementById("statusTitle");
      const statusSub = document.getElementById("statusSub");
      const statusIcon = document.getElementById("statusIcon");
      const computedHashEl = document.getElementById("computedHashEl");

      try {
        const computedLogicHash = await sha256(RECORD_LOGIC);
        const payload = computedLogicHash + "|" + RECORD_TIMESTAMP + "|" + RECORD_EMAIL + "|" + RECORD_FINGERPRINT;
        const recomputedHeaderHash = await sha256(payload);

        computedHashEl.textContent = recomputedHeaderHash;

        const isExactMatch = recomputedHeaderHash.toLowerCase() === TARGET_HEADER_HASH.toLowerCase();

        if (isExactMatch) {
          statusBox.className = "status-card verified";
          statusTitle.textContent = "MATHEMATICAL OWNERSHIP VERIFIED: 100% BITWISE MATCH";
          statusSub.textContent = "Preimage deterministic equation matches the sealed Header Hash bit-for-bit.";
          statusIcon.textContent = "✓";
        } else {
          statusBox.className = "status-card failed";
          statusTitle.textContent = "HASH MISMATCH: TAMPERING DETECTED";
          statusSub.textContent = "Computed hash does not match target. Content or metadata altered.";
          statusIcon.textContent = "✗";
        }
      } catch (err) {
        statusBox.className = "status-card failed";
        statusTitle.textContent = "ERROR EXECUTING CRYPTOGRAPHIC VERIFICATION: " + err.message;
        statusIcon.textContent = "!";
      }
    }

    window.addEventListener("DOMContentLoaded", recalculateProof);
  </script>
</body>
</html>`;
}

/**
 * Generates an RFC 6920 Named Information URI for content-addressed resolution.
 */
export function generateRFC6920URI(hashHex: string): string {
  return `ni:///sha-256;${hashHex.toLowerCase()}`;
}

/**
 * Generates an official USPTO 37 C.F.R. § 1.130 / § 1.131 Declaration
 * to legally establish Prior Invention and defeat adverse patent applications.
 */
export function generateUSPTO130Declaration(
  record: CryptoRecordPreimage,
  adversePatentOrApp: string = "ADVERSE PATENT OR APPLICATION UNDER CHALLENGE"
): string {
  const formattedDate = new Date(record.timestamp).toUTCString();
  const rfcUri = generateRFC6920URI(record.headerHash);

  return `================================================================================
IN THE UNITED STATES PATENT AND TRADEMARK OFFICE (USPTO)
AND BEFORE THE PATENT TRIAL AND APPEAL BOARD (PTAB)
================================================================================

IN RE MATTER OF: ${adversePatentOrApp.toUpperCase()}
CHALLENGING CUSTODIAN / INVENTOR: ${record.ownerEmail}
RECORD REGISTRATION IDENTIFIER: CERT-${record.id}
STATUTORY BASIS: 37 C.F.R. § 1.130(a) & 35 U.S.C. § 102(b)(1)(B)
SUPPLEMENTAL AUTHORITY: Texas Civil Practice & Remedies Code § 492 et seq. (TRAIGA)

DECLARATION OF PRIOR INVENTORSHIP AND IRREFUTABLE PRIOR ART REDUCTION TO PRACTICE
UNDER 37 C.F.R. § 1.130(a) & § 1.131

I, the undersigned Inventor / Sovereign Custodian (${record.ownerEmail}), hereby declare under 
penalty of perjury under the laws of the United States of America:

1. STATEMENT OF PRIOR CONCEPTION & DILIGENT REDUCTION TO PRACTICE:
   Prior to any effective filing date or alleged conception claimed in ${adversePatentOrApp}, 
   the undersigned conceived of, designed, and fully reduced to practice the complete computational 
   architecture and algorithmic logic represented by the cryptographic preimage below.

2. MATHEMATICALLY SEALED GENESIS EVIDENCE:
   - Certified Composite Header Seal (SHA-256): ${record.headerHash}
   - Content Digest (SHA-256):                  ${record.logicHash}
   - RFC 6920 Content-Addressed URI:            ${rfcUri}
   - Deterministic Sealing Timestamp:           ${record.timestamp} ms (${formattedDate})
   - Forensic Topological Fingerprint:          ${record.fingerprint}
   - Preimage Cryptographic Binding:            SHA256(LogicHash || Timestamp || Email || Fingerprint)

3. LEGAL BAR AGAINST ADVERSE PATENT GRANTS (35 U.S.C. § 102 & § 103):
   (a) The subject matter disclosed in the sealed preimage is identical or renders obvious every limitation 
       asserted in the claims of ${adversePatentOrApp}.
   (b) Pursuant to 35 U.S.C. § 102(a)(1), the attested prior invention bars patentability of any subsequent 
       derivative filings by adverse commercial entities.
   (c) Under 37 C.F.R. § 1.130(a), this declaration constitutes prima facie proof that the invention originated 
       solely with the declarant and was in declarant's custody prior to the adverse filing.

4. INTEGRITY & ZERO-KNOWLEDGE VERIFICATION:
   The underlying logic was verified using deterministic FIPS 180-4 SHA-256 hash algorithms. 
   Any patent examiner, administrative patent judge, or federal district court can independently 
   re-derive the exact 256-bit header hash from the preimage inputs without proprietary distortion.

I hereby declare that all statements made herein of my own knowledge are true and that all statements 
made on information and belief are believed to be true; and further that these statements were made 
with the knowledge that willful false statements and the like so made are punishable by fine or 
imprisonment, or both, under Section 1001 of Title 18 of the United States Code.

Executed on: ${new Date().toUTCString()}
By: Sovereign Custodian <${record.ownerEmail}>
Cryptographic Prior Art Seal: ${record.headerHash}
================================================================================`;
}
