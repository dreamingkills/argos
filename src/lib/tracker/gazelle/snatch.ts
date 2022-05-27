import { GazelleTracker } from "argos";
import { Torrent } from "qbittorrent";
import { addTorrent } from "../../qb/torrents/addTorrent";
import { addTorrentTags } from "../../qb/torrents/addTorrentTags";
import { getTorrentName } from "../../qb/torrents/getTorrentName";
import { downloadGazelleTorrent } from "./downloadGazelleTorrent";

export async function snatch({
  tracker,
  torrentId,
  freeleech = false,
  isEtc = false,
}: {
  tracker: GazelleTracker;
  torrentId: number;
  freeleech?: boolean;
  isEtc?: boolean;
}): Promise<Torrent> {
  const name = await getTorrentName(tracker, torrentId);

  const file = await downloadGazelleTorrent({
    tracker,
    torrentId,
    freeleech,
  });

  const torrent = await addTorrent(file, {
    contentLayout: "NoSubfolder",
    savepath: `${
      isEtc
        ? process.env.QBITTORRENT_DOWNLOAD_ETC_PATH
        : process.env.QBITTORRENT_DOWNLOAD_PATH
    }/${name}`,
    rename: name,
    category: "music",
  });

  if (isEtc) await addTorrentTags("etc", torrent.hash);

  return torrent;
}
