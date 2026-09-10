/**
 * Cryptographic utility for generating hashes.
 */

export async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function generateHeaderHash(logicHash: string, timestamp: number, ownerEmail: string): string {
  // A composite hash that includes metadata to "seal" the ownership
  const rawHeader = `${logicHash}|${timestamp}|${ownerEmail}`;
  // For simplicity in the UI, we can just return a base64 or another hash of this
  // but let's just return a unique string for now or use the same SHA-256 logic
  return rawHeader;
}
