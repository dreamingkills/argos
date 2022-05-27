import { qb } from "../../..";
import { AddTorrentOptions, Torrent } from "qbittorrent";
import { hash } from "@ctrl/torrent-file";
import FormData from "form-data";
import { listTorrents } from "./listTorrents";

export async function addTorrent(
  torrent: Buffer,
  options: AddTorrentOptions = {}
): Promise<Torrent> {
  const form = new FormData();

  form.append("file", torrent, {
    filename: "torrent.torrent",
    contentType: "application/x-bittorrent",
  });

  for (const [key, value] of Object.entries(options)) {
    form.append(key, value);
  }

  const response = await qb.request({
    path: "/torrents/add",
    method: "POST",
    form: form,
    json: false,
  });

  if (response !== "Ok.") {
    throw new Error("Failed to add torrent for some reason...");
  }

  const torrentHash = await hash(torrent);
  const qbTorrent = (await listTorrents({ category: "music" })).find(
    (t) => t.hash === torrentHash || t.name === options?.rename
  );

  if (!qbTorrent) throw new Error("Failed to find added torrent in client.");

  return qbTorrent;
}
