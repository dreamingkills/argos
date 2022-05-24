import { Torrent } from "qbittorrent";
import { listTorrents } from "./listTorrents";

export async function getTorrent(hash: string): Promise<Torrent | undefined> {
  const torrentsResponse = await listTorrents({ hashes: hash.toLowerCase() });
  const torrentData = torrentsResponse[0];
  if (!torrentData) return undefined;

  return torrentData;
}
