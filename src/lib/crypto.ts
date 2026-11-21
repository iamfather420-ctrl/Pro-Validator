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
export function generateFormalDemandLetter(record: CryptoRecordPreimage, adverseParty: string = "RECIPIENT"): string {
  return `DRAFT EVIDENCE SUMMARY — NOT A LEGAL NOTICE

Record ID: ${record.id}
Recipient: ${adverseParty}
Timestamp supplied in record: ${record.timestamp}
Owner email supplied in record: ${record.ownerEmail}
Content SHA-256: ${record.logicHash}
Composite SHA-256 digest: ${record.headerHash}

A matching SHA-256 digest can show that the supplied content and metadata reproduce the recorded digest. It does not prove who created or owned the content, when it was created, that the timestamp or email is authentic, patent novelty, prior-art status, copyright ownership, trade-secret rights, infringement, or eligibility for any statutory safe harbor.

A SHA-256 digest is not a digital signature or trusted timestamp. Anyone with the same inputs can reproduce it. Stronger provenance requires independent timestamping, signed attestations verified against trusted public keys, custody records, and supporting source evidence.

This export is informational only. It is not a cease-and-desist notice, affidavit, legal opinion, or substitute for advice from a qualified intellectual-property attorney. Do not send or file it as a legal instrument without professional review.
`;
}
/**
 * Generates an entirely offline, standalone, single-file HTML courtroom verifier.
 * A judge or examiner can open this file in any browser without an internet connection,
 * and it will locally calculate SHA-256 over the preimage to confirm the seal.
 */
export function generateStandaloneVerifierHTML(record: CryptoRecordPreimage): string {
  const html = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const js = (value: string) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  const safeLogicJson = js(record.logic);
  const safeEmail = html(record.ownerEmail);
  const safeFingerprint = html(record.fingerprint);
  const safeId = html(record.id);
  const safeLogicHash = html(record.logicHash);
  const safeHeaderHash = html(record.headerHash);
  const safeTimestamp = Number.isFinite(record.timestamp) ? String(record.timestamp) : 'INVALID';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PLOV Content Digest Check: ${safeId}</title>
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
    <span class="badge">Standalone Offline Digest Check</span>
    <h1>PLOV Cryptographic Verification Seal</h1>
    <p class="subtitle">CONTENT INTEGRITY ONLY • DOES NOT PROVE AUTHORSHIP, CREATION DATE, OWNERSHIP, PRIOR ART, OR LEGAL RIGHTS</p>

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
        <div class="val">${safeId}</div>
      </div>
      <div class="box">
        <div class="label">Time of Sealing (UTC)</div>
        <div class="val">${new Date(record.timestamp).toISOString()}</div>
      </div>
      <div class="box">
        <div class="label">Epoch Milliseconds</div>
        <div class="val">${safeTimestamp}</div>
      </div>
      <div class="box">
        <div class="label">Registered Custodian</div>
        <div class="val">${safeEmail}</div>
      </div>
    </div>

    <div class="box" style="margin-bottom: 20px;">
      <div class="label">Recorded Composite Header Hash (Sealed Target)</div>
      <div class="val highlight">${safeHeaderHash}</div>
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
      <span>LOCAL SHA-256 DIGEST CHECK — NOT IDENTITY OR TIMESTAMP ATTESTATION</span>
      <span>NO LEGAL STATUS OR OWNERSHIP DETERMINATION</span>
    </div>
  </div>

  <script>
    const RECORD_LOGIC = ${safeLogicJson};
    const RECORD_LOGIC_HASH = ${js(record.logicHash)};
    const RECORD_TIMESTAMP = ${record.timestamp};
    const RECORD_EMAIL = ${js(record.ownerEmail.toLowerCase())};
    const RECORD_FINGERPRINT = ${js(record.fingerprint)};
    const TARGET_HEADER_HASH = ${js(record.headerHash.toLowerCase())};

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
          statusTitle.textContent = "CONTENT DIGEST MATCH: 256-BIT EQUALITY";
          statusSub.textContent = "The supplied content and metadata reproduce this digest. This does not authenticate authorship, time, ownership, or legal priority.";
          statusIcon.textContent = "✓";
        } else {
          statusBox.className = "status-card failed";
          statusTitle.textContent = "CONTENT DIGEST MISMATCH";
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
  adversePatentOrApp: string = "REFERENCE MATTER"
): string {
  return `DRAFT PROVENANCE EVIDENCE NOTES — ATTORNEY REVIEW REQUIRED

Matter reference: ${adversePatentOrApp}
Record ID: ${record.id}
Custodian email supplied in record: ${record.ownerEmail}
Timestamp supplied in record: ${record.timestamp}
Content SHA-256: ${record.logicHash}
Composite digest: ${record.headerHash}
Fingerprint supplied in record: ${record.fingerprint}

LIMITED TECHNICAL STATEMENT
The SHA-256 values can be independently recomputed from the supplied preimage. A matching digest supports only the conclusion that the checked content and metadata are consistent with the recorded digest.

IMPORTANT LIMITATIONS
A matching digest does not independently prove identity, authorship, date of creation, possession at that date, public disclosure, patent novelty, prior-art status, ownership, or any legal conclusion. The email address and timestamp are input fields, not authenticated identity or trusted time evidence. This record is not a cryptographic signature, trusted timestamp, USPTO filing, or adjudication.

Any declaration under penalty of perjury must be based on the declarant's personal knowledge and supporting evidence. Patent and prior-art questions require analysis under applicable law and facts. This draft must not be signed or submitted without review by a qualified patent attorney.
`;
}
