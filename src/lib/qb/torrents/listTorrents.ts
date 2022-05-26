import { Torrent, TorrentFilters } from "qbittorrent";
import { qb } from "../../..";
import { normalizeHashes } from "../util/normalizeHashes";

export async function listTorrents({
  hashes,
  filter,
  category,
  sort,
  offset,
  reverse,
  tag,
}: {
  hashes?: string | string[];
  filter?: TorrentFilters;
  sort?: string;
  tag?: string;
  category?: string;
  offset?: number;
  reverse?: boolean;
} = {}): Promise<Torrent[]> {
  const params: Record<string, string> = {};

  if (hashes) params.hashes = normalizeHashes(hashes);
  if (filter) params.filter = filter;
  if (category) params.category = category;
  if (tag) params.tag = tag;
  if (offset !== undefined) params.offset = `${offset}`;
  if (sort) params.sort = sort;
  if (reverse) params.reverse = JSON.stringify(reverse);

  const res = await qb.request<Torrent[]>({
    path: "/torrents/info",
    method: "GET",
    params,
  });

  return res;
}
