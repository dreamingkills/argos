import { GazelleTracker } from "argos";
import { getGazelleTorrent } from "../../tracker/gazelle/getGazelleTorrent";
import { getTorrentArtists } from "../../tracker/gazelle/getTorrentArtists";

export async function getTorrentName(
  tracker: GazelleTracker,
  torrentId: number
): Promise<string> {
  const gazelleTorrent = await getGazelleTorrent({ id: torrentId, tracker });
  if (!gazelleTorrent) throw new Error("Torrent not found");

  const { torrent, group } = gazelleTorrent;

  let name = process.env.TORRENT_CONTENT_FOLDER_NAME || "[%m-%f %b] %a - %n %c";

  const hasArtist = name.match(/%a/gi);
  if (hasArtist) {
    const artist = getTorrentArtists(gazelleTorrent, hasArtist[0] === "%A");
    name = name.replace(/%a/gi, artist);
  }

  const hasName = name.match(/%n/gi);
  if (hasName) {
    let groupName = group.name;

    if (hasName[0] === "%N") groupName = groupName.toUpperCase();

    name = name.replace(/%n/gi, groupName);
  }

  name = name
    .replace(/%m/gi, torrent.media)
    .replace(/%f/gi, torrent.format)
    .replace(/%b/gi, torrent.encoding)
    .replace(
      /%c/gi,
      torrent.remasterCatalogueNumber || group.catalogueNumber
        ? `{${torrent.remasterCatalogueNumber || group.catalogueNumber}}`
        : ""
    )
    .trim();

  return name;
}
