import { GazelleTorrent, GazelleTorrentGroup } from "gazelle";

export function getGazelleTorrentFormats(
  group: GazelleTorrentGroup["response"],
  origin: GazelleTorrent["torrent"],
  useRemaster: boolean
): {
  flac: boolean;
  cbr: boolean;
  vbr: boolean;
} {
  const applicableTorrents = group.torrents.filter(
    (t) =>
      t.media === origin.media &&
      (useRemaster
        ? t.remasterCatalogueNumber === origin.remasterCatalogueNumber
        : true)
  );

  const flac = !applicableTorrents.find((t) => t.format === "FLAC");
  const cbr = !applicableTorrents.find(
    (t) => t.format === "MP3" && t.encoding === "320"
  );
  const vbr = !applicableTorrents.find(
    (t) => t.format === "MP3" && t.encoding === "V0 (VBR)"
  );

  return { flac, cbr, vbr };
}
