import { got } from "got";
import { OrpheusTorrent } from "orpheus";

export async function getOrpheusTorrent({
  id,
  hash,
}: {
  id?: number;
  hash?: string;
}): Promise<OrpheusTorrent> {
  let url = `https://orpheus.network/ajax.php?action=torrent`;

  if (id) url += `&id=${id}`;
  if (hash) url += `&hash=${hash}`;

  const response = await got<OrpheusTorrent>(url, {
    method: "GET",
    headers: { Authorization: process.env.ORPHEUS_API_TOKEN },
    responseType: "json",
  });

  return response.body;
}
