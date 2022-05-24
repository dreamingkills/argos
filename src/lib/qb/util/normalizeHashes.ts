export function normalizeHashes(hashes: string | string[]): string {
  if (Array.isArray(hashes)) {
    return hashes.join("|");
  }

  return hashes;
}
