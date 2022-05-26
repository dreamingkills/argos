import FormData from "form-data";
import { qb } from "../../..";
import { normalizeHashes } from "../util/normalizeHashes";

export async function addTorrentTags(
  tags: string | string[],
  hashes: string | string[]
): Promise<void> {
  const form = new FormData();
  form.append("hashes", normalizeHashes(hashes));
  form.append("tags", typeof tags === "string" ? tags : tags.join(","));

  await qb.request({
    path: "/torrents/addTags",
    method: "POST",
    form,
    json: false,
  });

  return;
}
