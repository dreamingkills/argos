import { GazelleTorrent } from "gazelle";
import { getTorrentArtists } from "../../tracker/gazelle/getTorrentArtists";

export function convertTorrentPath({
  folderName,
  isEtc,
  encoding,
  torrent,
}: {
  folderName: string;
  isEtc: boolean;
  encoding: "CBR" | "VBR";
  torrent: GazelleTorrent;
}): string {
  const path = isEtc
    ? process.env.QBITTORRENT_DOWNLOAD_ETC_PATH!
    : process.env.QBITTORRENT_DOWNLOAD_PATH!;
  return `${path.replace(
    /%a/gi,
    getTorrentArtists(torrent, !!path.match(/%A/g))
  )}/${folderName}`
    .replace(
      /FLAC (24bit )?Lossless/gim,
      `MP3 ${encoding === "CBR" ? "320" : "V0 (VBR)"}`
    )
    .replace(/ \((\d{1,3}%)?( - )?(Cue)?\)(?=$|\/|\\)/gim, "");
}
