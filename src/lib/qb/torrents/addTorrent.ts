import { qb } from "../../..";
import { File, FormData } from "formdata-node";
import { AddTorrentOptions, Torrent } from "qbittorrent";
import { hash } from "@ctrl/torrent-file";
import { getTorrent } from "./getTorrent";

export async function addTorrent(
  torrent: Buffer,
  filename: string,
  options: AddTorrentOptions = {}
): Promise<Torrent> {
  const form = new FormData();

  const file = new File([torrent], filename, {
    type: "application/x-bittorrent",
  });
  form.set("file", file);

  for (const [key, value] of Object.entries(options)) {
    form.append(key, value);
  }

  const response = await qb.request({
    path: "/torrents/add",
    method: "POST",
    body: form,
    json: false,
  });

  if (response.body !== "Ok.") {
    throw new Error("Failed to add torrent for some reason...");
  }

  const torrentHash = await hash(torrent);
  const qbTorrent = await getTorrent(torrentHash);

  if (!qbTorrent) throw new Error("Failed to find added torrent in client.");

  return qbTorrent;
}
