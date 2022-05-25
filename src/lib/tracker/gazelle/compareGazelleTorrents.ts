import { GazelleEncoding, GazelleTorrent, GazelleTorrentGroup } from "gazelle";

export function compareGazelleTorrents(
  t:
    | GazelleTorrent["response"]["torrent"]
    | GazelleTorrentGroup["response"]["torrents"][number],
  o:
    | GazelleTorrent["response"]["torrent"]
    | GazelleTorrentGroup["response"]["torrents"][number],
  desiredFormat?: "FLAC" | "MP3",
  desiredEncoding?: GazelleEncoding,
  useRemaster: boolean = true
): boolean {
  return (
    t.media === o.media &&
    t.format === desiredFormat &&
    t.encoding === desiredEncoding &&
    (useRemaster
      ? t.remasterCatalogueNumber === o.remasterCatalogueNumber &&
        t.remasterRecordLabel === o.remasterRecordLabel &&
        t.remasterTitle === o.remasterTitle &&
        t.remasterYear === o.remasterYear
      : true)
  );
}
