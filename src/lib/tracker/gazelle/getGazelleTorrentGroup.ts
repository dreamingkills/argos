import { got } from "got";
import { GazelleTorrentGroup } from "gazelle";
import { CONSTANTS } from "../../constants";
import { GazelleTracker } from "argos";

export async function getGazelleTorrentGroup({
  id,
  tracker,
}: {
  id: number;
  tracker: GazelleTracker;
}): Promise<GazelleTorrentGroup | undefined> {
  const url = `${CONSTANTS.GAZELLE_BASE_URLS[tracker]}/ajax.php?action=torrentgroup&id=${id}`;

  const response = await got<GazelleTorrentGroup>(url, {
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
