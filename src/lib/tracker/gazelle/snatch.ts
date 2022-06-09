import { GazelleTracker } from "argos";
import { GazelleTorrent } from "gazelle";
import { Torrent } from "qbittorrent";
import { addTorrent } from "../../qb/torrents/addTorrent";
import { addTorrentTags } from "../../qb/torrents/addTorrentTags";
import { getTorrentName } from "../../qb/torrents/getTorrentName";
import { downloadGazelleTorrent } from "./downloadGazelleTorrent";
import { getTorrentArtists } from "./getTorrentArtists";

export async function snatch({
  tracker,
  torrent,
  freeleech = false,
  isEtc = false,
}: {
  tracker: GazelleTracker;
  torrent: GazelleTorrent;
  freeleech?: boolean;
  isEtc?: boolean;
}): Promise<Torrent> {
  const name = await getTorrentName(tracker, torrent.torrent.id);

  const file = await downloadGazelleTorrent({
    tracker,
    torrentId: torrent.torrent.id,
    freeleech,
  });

  const downloadPath = isEtc
    ? process.env.QBITTORRENT_DOWNLOAD_ETC_PATH!
    : process.env.QBITTORRENT_DOWNLOAD_PATH!;

  const _torrent = await addTorrent(file, {
    contentLayout: "NoSubfolder",
    savepath: `${downloadPath!.replace(
      /%a/gi,
      getTorrentArtists(torrent, !!downloadPath.match(/%A/g))
    )}/${name.replace(/\?/g, "")}`,
    rename: name,
    category: "music",
  });

  if (isEtc) await addTorrentTags("etc", _torrent.hash);

  return _torrent;
}
