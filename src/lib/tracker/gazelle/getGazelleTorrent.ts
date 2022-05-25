import { got } from "got";
import { GazelleTorrent } from "gazelle";
import { CONSTANTS } from "../../constants";
import { GazelleTracker } from "argos";

export async function getGazelleTorrent({
  id,
  hash,
  tracker,
}: {
  id?: number;
  hash?: string;
  tracker: GazelleTracker;
}): Promise<GazelleTorrent | undefined> {
  let url = `${CONSTANTS.GAZELLE_BASE_URLS[tracker]}/ajax.php?action=torrent`;

  if (id) url += `&id=${id}`;
  if (hash) url += `&hash=${hash}`;

  console.log(url);

  const response = await got<GazelleTorrent>(url, {
    method: "GET",
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
