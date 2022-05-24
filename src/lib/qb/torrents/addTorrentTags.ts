import { qb } from "../../..";
import { normalizeHashes } from "../util/normalizeHashes";

export async function addTorrentTags(
  tags: string | string[],
  hashes: string | string[]
): Promise<void> {
  await qb.request({
    path: "/torrents/addTags",
    method: "POST",
    form: {
      hashes: normalizeHashes(hashes),
      tags: typeof tags === "string" ? tags : tags.join(","),
    },
    json: false,
  });

  return;
}
