export function convertTorrentPath(
  path: string,
  encoding: "CBR" | "VBR"
): string {
  return path
    .replace(
      /FLAC (24bit )?Lossless/gim,
      `MP3 ${encoding === "CBR" ? "320" : "V0 (VBR)"}`
    )
    .replace(/ \((\d{1,3}%)?( - )?(Cue)?\)(?=$|\/|\\)/gim, "")
    .replace(/\.flac$/gim, ".mp3");
}
