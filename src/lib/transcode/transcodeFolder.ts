import { Torrent } from "qbittorrent";
import glob from "fast-glob";
import { copyFile, mkdir } from "fs/promises";
import mm from "music-metadata";
import { lame } from "./lame";

export async function transcodeFolder(
  torrent: Torrent,
  bitrate: "320" | "v0"
): Promise<string> {
  const path = torrent.content_path
    .replace(/\\/gim, "/")
    .replace(/\[/gim, "\\[")
    .replace(/\]/gim, "\\]")
    .replace(/\(/gim, "\\(")
    .replace(/\)/gim, "\\)");

  const files = await glob(`${path}/**/*`);
  if (files.length === 0) throw new Error("no files");

  const flacs = files.filter((f) => f.endsWith(".flac"));
  if (flacs.length === 0) throw new Error("no flacs");

  const misc = files.filter((f) => !f.endsWith(".flac"));

  const outPath = torrent.content_path
    .replace(
      /FLAC (24bit )?Lossless/gim,
      `MP3 ${bitrate === "320" ? "320" : "V0 (VBR)"}`
    )
    .replace(/\((\d{1,3}%)?( - )?(Cue)?\)$/gim, "");

  try {
    await mkdir(outPath);
  } catch {}

  for (let file of misc) {
    const output = file
      .replace(
        /FLAC (24bit )?Lossless/gim,
        `MP3 ${bitrate === "320" ? "320" : "V0 (VBR)"}`
      )
      .replace(/\((\d{1,3}%)?( - )?(Cue)?\)$/gim, "");

    await copyFile(file, output);
  }

  for (let file of flacs) {
    const metadata = await mm.parseFile(file);

    const output = file
      .replace(
        /FLAC (24bit )?Lossless/gim,
        `MP3 ${bitrate === "320" ? "320" : "V0 (VBR)"}`
      )
      .replace(/\((\d{1,3}%)?( - )?(Cue)?\)$/gim, "")
      .replace(/\.flac$/gim, ".mp3");

    await lame({ input: file, output, tags: metadata.common, type: bitrate });
  }

  return outPath;
}
