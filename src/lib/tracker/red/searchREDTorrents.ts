import { got } from "got";
import { RedactedSearch } from "redacted";

export async function searchREDTorrents(
  search: string,
  options?: { format?: string; groupname?: string; releasetype?: number }
): Promise<RedactedSearch[]> {
  let url = `https://redacted.ch/ajax.php?action=browse&searchstr=${encodeURIComponent(
    search
  )}`;

  if (options) {
    for (let [k, v] of Object.entries(options)) {
      if (!v) continue;
      url += `&${k}=${encodeURIComponent(v)}`;
    }
  }

  const response = await got<RedactedSearch[]>({
    method: "GET",
    url,
    headers: {
      Authorization: process.env.REDACTED_API_TOKEN,
    },
    responseType: "json",
  });

  return response.body;
}
