import { Torrent } from "qbittorrent";
import glob from "fast-glob";
import { unlink } from "fs/promises";
import mm from "music-metadata";
import { lame } from "./lame";
import cpr from "cpr";
import { sanitizePath } from "../util/sanitizePath";
import { listTorrents } from "../qb/torrents/listTorrents";

export async function transcodeFolder(
  torrent: Torrent,
  bitrate: "CBR" | "VBR"
): Promise<string> {
  const path = sanitizePath(torrent.content_path);

  const flacs = await glob(`${path}/**/*.flac`);
  if (flacs.length === 0) throw new Error("no files");

  const outPath = torrent.content_path
    .replace(
      /FLAC (24bit )?Lossless/gim,
      `MP3 ${bitrate === "CBR" ? "320" : "V0 (VBR)"}`
    )
    .replace(/ \((\d{1,3}%)?( - )?(Cue)?\)(?=$|\/|\\)/gim, "");

  const torrents = await listTorrents();
  const torrentExists = torrents.find(
    (t) => t.name === outPath.split("/")[outPath.split("/").length - 1]
  );

  if (torrentExists) return outPath;

  await new Promise<void>((resolve, reject) => {
    cpr(
      torrent.content_path,
      outPath,
      {
        deleteFirst: true,
        overwrite: true,
        confirm: true,
      },
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });

  const discard = await glob(`${sanitizePath(outPath)}/**/*.flac`);
  for (let file of discard) {
    await unlink(file);
  }

  for (let file of flacs) {
    const metadata = await mm.parseFile(file);

    const output = file
      .replace(
        /FLAC (24bit )?Lossless/gim,
        `MP3 ${bitrate === "CBR" ? "320" : "V0 (VBR)"}`
      )
      .replace(/ \((\d{1,3}%)?( - )?(Cue)?\)(?=$|\/|\\)/gim, "")
      .replace(/\.flac$/gim, ".mp3");

    await lame({ input: file, output, tags: metadata.common, type: bitrate });
  }

  return outPath;
}
