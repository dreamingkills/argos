import { got } from "got";
import FormData from "form-data";
import { GazelleTorrent, GazelleTorrentGroup, GazelleUpload } from "gazelle";
import { GazelleTracker } from "argos";
import { CONSTANTS } from "../../constants";

export async function uploadGazelleTorrent({
  tracker,
  torrent,
  filename,
  format,
  encoding,
  original,
  targetGroup,
  subtext,
}: {
  tracker: GazelleTracker;
  torrent: Buffer;
  filename: string;
  format: string;
  encoding: string;
  original: { tracker: GazelleTracker; torrent: GazelleTorrent };
  targetGroup: GazelleTorrentGroup["response"]["group"];
  subtext?: string;
}): Promise<GazelleUpload> {
  let url = `${CONSTANTS.GAZELLE_BASE_URLS[tracker]}/ajax.php?action=upload`;

  const g = original.torrent.response.group;
  const t = original.torrent.response.torrent;

  const form = new FormData();
  form.append("file_input", torrent, {
    contentType: "application/x-bittorrent",
    filename,
  });

  /*for (let { name } of g.musicInfo.artists) {
    form.append("artists[]", name);
    form.append("importance[]", 1);
  }*/

  form.append("groupid", targetGroup.id);
  form.append("format", format);
  form.append("bitrate", encoding);
  form.append("media", t.media);
  form.append("tags", g.tags.toString());
  form.append("remaster_year", t.remasterYear || g.year);
  if (t.remastered) form.append("remaster", `${t.remastered}`);
  if (t.remasterTitle) form.append("remaster_title", t.remasterTitle);
  if (t.remasterRecordLabel)
    form.append("remaster_record_label", t.remasterRecordLabel);
  if (t.remasterCatalogueNumber)
    form.append("remaster_catalogue_number", t.remasterCatalogueNumber);
  form.append(
    "release_desc",
    `[align=center][quote][size=1]originally uploaded to [url=${
      CONSTANTS.GAZELLE_BASE_URLS[original.tracker]
    }/torrents.php?torrentid=${
      t.id
    }]${original.tracker.toUpperCase()}[/url] by [url=${
      CONSTANTS.GAZELLE_BASE_URLS[original.tracker]
    }/user.php?id=${t.userId}]${t.username}[/url]${
      subtext ? `\n${subtext}` : ""
    }[/size]${
      t.description || ""
    }[/quote]• Automatically uploaded with [b][color=#d05141]Argos[/color][/b] •[/align]`
  );

  try {
    const response = await got<GazelleUpload>({
      method: "POST",
      url,
      headers: {
        Authorization:
          process.env[
            `${CONSTANTS.TRACKER_FULL_NAME[tracker].toUpperCase()}_API_TOKEN`
          ],
      },
      body: form,
      responseType: "json",
    });

    return response.body;
  } catch (e: any) {
    console.log(e.response.body);
    throw e;
  }
}
