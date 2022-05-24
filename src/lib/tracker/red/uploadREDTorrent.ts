import { got } from "got";
import { RedactedUpload } from "redacted";
import FormData from "form-data";
import { OrpheusTorrent } from "orpheus";

export async function uploadREDTorrent(
  torrent: Buffer,
  filename: string,
  format: string,
  encoding: string,
  ops: OrpheusTorrent
): Promise<RedactedUpload> {
  let url = `https://redacted.ch/ajax.php?action=upload`;

  const g = ops.response.group;
  const t = ops.response.torrent;

  const form = new FormData();
  form.append("file_input", torrent, {
    contentType: "application/x-bittorrent",
    filename,
  });
  form.append("type", 0);

  console.log(g.year);
  for (let { name } of g.musicInfo.artists) {
    form.append("artists[]", name);
    form.append("importance[]", 1);
  }

  form.append("title", g.name);
  form.append("year", g.year);
  form.append("releasetype", g.releaseType);
  form.append("format", format);
  form.append("bitrate", encoding);
  form.append("media", t.media);
  form.append("tags", g.tags.toString());
  if (g.wikiImage) form.append("image", g.wikiImage);
  if (g.wikiBBcode) form.append("album_desc", g.wikiBBcode);
  form.append("remaster_year", t.remasterYear || g.year);
  if (t.remasterTitle) form.append("remaster_title", t.remasterTitle);
  if (t.remasterRecordLabel)
    form.append("remaster_record_label", t.remasterRecordLabel);
  if (t.remasterCatalogueNumber)
    form.append("remaster_catalogue_number", t.remasterCatalogueNumber);
  form.append(
    "release_desc",
    `[align=center][quote][size=1]originally uploaded to [url=https://orpheus.network/torrents.php?torrentid=${
      t.id
    }]OPS[/url] by [url=https://orpheus.network/user.php?id=${t.userId}]${
      t.username
    }[/url][/size]
    ${
      t.description || ""
    }[/quote]• Automatically uploaded with [b][color=#d05141]Argos[/color][/b] •[/align]`
  );

  try {
    const response = await got<RedactedUpload>({
      method: "POST",
      url,
      headers: {
        Authorization: process.env.REDACTED_API_TOKEN,
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
