import { got } from "got";
import { GazelleSearch } from "gazelle";
import { CONSTANTS } from "../../constants";

export async function searchGazelleTorrents(
  tracker: "red" | "ops",
  search: string,
  options?: { format?: string; groupname?: string; releasetype?: number }
): Promise<GazelleSearch> {
  let url = `${
    CONSTANTS.GAZELLE_BASE_URLS[tracker]
  }/ajax.php?action=browse&searchstr=${encodeURIComponent(search)}`;

  if (options) {
    for (let [k, v] of Object.entries(options)) {
      if (!v) continue;
      url += `&${k}=${encodeURIComponent(v)}`;
    }
  }

  const response = await got<GazelleSearch>({
    method: "GET",
    url,
    headers: {
      Authorization:
        process.env[
          `${CONSTANTS.TRACKER_FULL_NAME[tracker].toUpperCase()}_API_TOKEN`
        ],
    },
    responseType: "json",
  });

  return response.body;
}
