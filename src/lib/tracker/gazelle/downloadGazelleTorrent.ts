import { GazelleTracker } from "argos";
import { got, OptionsOfBufferResponseBody } from "got";
import { CONSTANTS } from "../../constants";

export async function downloadGazelleTorrent({
  tracker,
  torrentId,
  freeleech = false,
}: {
  tracker: GazelleTracker;
  torrentId: number;
  freeleech?: boolean;
}): Promise<Buffer> {
  let url = `${
    CONSTANTS.GAZELLE_BASE_URLS[tracker]
  }/torrents.php?action=download&id=${torrentId}&torrent_pass=${
    process.env[
      `${CONSTANTS.TRACKER_FULL_NAME[tracker].toUpperCase()}_TORRENT_PASS`
    ]
  }`;

  if (tracker === "red") url += `&authkey=${process.env.REDACTED_AUTH_KEY}`;
  if (freeleech) url += `&usetoken=1`;

  const res = await got(url, {
    method: "GET",
    responseType: "buffer",
  } as OptionsOfBufferResponseBody);

  return res.body;
}
