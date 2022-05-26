import { GazelleTracker, RunCommand } from "argos";
import { Embed } from "eris";
import { CONSTANTS } from "../../lib/constants";
import { addTorrent } from "../../lib/qb/torrents/addTorrent";
import { addTorrentTags } from "../../lib/qb/torrents/addTorrentTags";
import { getTorrent } from "../../lib/qb/torrents/getTorrent";
import { compareGazelleTorrents } from "../../lib/tracker/gazelle/compareGazelleTorrents";
import { getGazelleTorrent } from "../../lib/tracker/gazelle/getGazelleTorrent";
import { getGazelleTorrentGroup } from "../../lib/tracker/gazelle/getGazelleTorrentGroup";
import { searchGazelleTorrents } from "../../lib/tracker/gazelle/searchGazelleTorrents";
import { snatch } from "../../lib/tracker/gazelle/snatch";
import { uploadGazelleTorrent } from "../../lib/tracker/gazelle/uploadGazelleTorrent";
import { makeTorrent } from "../../lib/tracker/makeTorrent";
import { isGazelleTracker } from "../../lib/tracker/util/isTracker";
import { transcodeFolder } from "../../lib/transcode/transcodeFolder";

export const transcode: RunCommand = async ({ message, client }) => {
  const tracker = message.content.split(" ")[1]?.toLowerCase();
  if (!isGazelleTracker(tracker)) throw new Error("invalid tracker");
  const target: GazelleTracker = tracker === "ops" ? "red" : "ops";

  const torrentId = parseInt(message.content.split(" ")[2], 10);
  const trackerTorrent = await getGazelleTorrent({ id: torrentId, tracker });

  if (!trackerTorrent) {
    throw new Error("No torrent found");
  }

  let torrent = await getTorrent(trackerTorrent.torrent.infoHash);

  if (!torrent) {
    torrent = await snatch({ tracker, torrentId });
    let downloaded = false;

    while (downloaded === false) {
      const _torrent = await getTorrent(torrent.hash);
      if (!_torrent) return;

      console.log(_torrent.progress);
      if (_torrent.progress === 1) downloaded = true;

      await new Promise<void>((res) => {
        setTimeout(() => res(), 2500);
      });
    }
  }

  const originTorrent = trackerTorrent.torrent;

  const torrentGroup = await getGazelleTorrentGroup({
    id: trackerTorrent?.group.id,
    tracker,
  });

  if (!torrentGroup) {
    throw new Error("Tracker torrent has no group... wtf?");
  }

  const upload = {
    origin: {
      cbr: false,
      vbr: false,
    },
    target: {
      originalFormat: false,
      cbr: false,
      vbr: false,
    },
  };

  upload.origin.cbr = !torrentGroup.response.torrents.find((t) =>
    compareGazelleTorrents(t, originTorrent, "MP3", "320")
  );

  upload.origin.vbr = !torrentGroup.response.torrents.find((t) =>
    compareGazelleTorrents(t, originTorrent, "MP3", "V0 (VBR)")
  );

  const search = await searchGazelleTorrents(
    target,
    `${trackerTorrent.group.musicInfo.artists[0].name} - ${trackerTorrent.group.name}`
  );

  const match = search.response.results.find(
    (r) =>
      r.groupName.toLowerCase() === trackerTorrent.group.name.toLowerCase() &&
      trackerTorrent.group.musicInfo.artists
        .map((a) => a.name.toLowerCase())
        .includes(r.artist.toLowerCase())
  );

  if (!match) throw new Error("No match");

  const targetTorrentGroup = (await getGazelleTorrentGroup({
    id: match.groupId,
    tracker: target,
  }))!;

  upload.target.originalFormat = !targetTorrentGroup.response.torrents.find(
    (t) => compareGazelleTorrents(t, originTorrent, "FLAC", "Lossless", false)
  );

  upload.target.cbr = !targetTorrentGroup.response.torrents.find((t) =>
    compareGazelleTorrents(t, originTorrent, "MP3", "320", false)
  );

  upload.target.vbr = !targetTorrentGroup.response.torrents.find((t) =>
    compareGazelleTorrents(t, originTorrent, "MP3", "V0 (VBR)", false)
  );

  if (
    !upload.target.cbr &&
    !upload.target.vbr &&
    !upload.target.originalFormat &&
    !upload.origin.cbr &&
    !upload.origin.vbr
  ) {
    await client.createMessage(
      message.channel.id,
      "This torrent does not need to be transcoded"
    );
    return;
  }

  const embed: Embed = {
    type: "",
    author: { icon_url: client.user.dynamicAvatarURL(), name: "Transcode Job" },
    description:
      "Torrent" +
      `\n**[[${trackerTorrent.torrent.media}-${trackerTorrent.torrent.format} ${trackerTorrent.torrent.encoding}] ${trackerTorrent.group.musicInfo.artists[0].name} - ${trackerTorrent.group.name}](${CONSTANTS.GAZELLE_BASE_URLS[tracker]}/torrents.php?torrentid=${trackerTorrent.torrent.id})**` +
      `\n\nJobs` +
      (upload.target.cbr || upload.origin.cbr
        ? `\nTranscode **FLAC -> MP3 320** (in progress)`
        : "") +
      (upload.target.vbr || upload.origin.vbr
        ? `\nTranscode **FLAC -> MP3 V0 (VBR)** (in progress)`
        : "") +
      (upload.target.originalFormat
        ? `\n**↑ Upload FLAC to ${target.toUpperCase()}**`
        : "") +
      (upload.target.cbr
        ? `\n**↑ Upload MP3 320 to ${target.toUpperCase()}**`
        : "") +
      (upload.target.vbr
        ? `\n**↑ Upload MP3 V0 (VBR) to ${target.toUpperCase()}**`
        : "") +
      (upload.origin.cbr
        ? `\n**↑ Upload MP3 320 to ${tracker.toUpperCase()}**`
        : "") +
      (upload.origin.vbr
        ? `\n**↑ Upload MP3 V0 (VBR) to ${tracker.toUpperCase()}**`
        : ""),
  };

  const msg = await client.createMessage(message.channel.id, {
    embeds: [embed],
  });

  if (upload.target.originalFormat) {
    const file = await makeTorrent({
      path: torrent.content_path,
      announce:
        process.env[
          `${CONSTANTS.TRACKER_FULL_NAME[target].toUpperCase()}_ANNOUNCE_URL`
        ]!,
      source: target.toUpperCase(),
      name: torrent.name,
    });

    const upload = await uploadGazelleTorrent({
      tracker: target,
      torrent: file,
      filename: `${torrent.name}.torrent`,
      format: trackerTorrent.torrent.format,
      encoding: trackerTorrent.torrent.encoding,
      original: { tracker, torrent: trackerTorrent },
      targetGroup: targetTorrentGroup.response.group,
    });

    embed.description = embed.description!.replace(
      /(\*\*↑ Upload FLAC to ...\*\*)/gim,
      `~~$1~~ [(completed)](${CONSTANTS.GAZELLE_BASE_URLS[target]}/torrents.php?torrentid=${upload.response.torrentid})`
    );
    await msg.edit({ embeds: [embed] });

    await addTorrent(file, { category: "music" });
  }

  if (upload.origin.cbr || upload.target.cbr) {
    transcodeFolder(torrent!, "320").then(async (path) => {
      embed.description = embed
        .description!.replace(
          /(Transcode \*\*FLAC -> MP3 320\*\*)/gim,
          "~~$1~~"
        )
        .replace(/in progress/gim, "completed");
      await msg.edit({ embeds: [embed] });

      const name = path.split("/")[path.split("/").length - 1];

      for (let source of ["origin", "target"] as const) {
        if (upload[source]["cbr"]) {
          const trackerSource = source === "origin" ? tracker : target;
          const trackerName =
            CONSTANTS.TRACKER_FULL_NAME[trackerSource].toUpperCase();

          const file = await makeTorrent({
            path,
            announce: process.env[`${trackerName}_ANNOUNCE_URL`]!,
            source: trackerSource.toUpperCase(),
            name,
          });

          const upload = await uploadGazelleTorrent({
            tracker: trackerSource,
            torrent: file,
            filename: `${name}.torrent`,
            format: "MP3",
            encoding: "320",
            original: { tracker, torrent: trackerTorrent },
            targetGroup:
              trackerSource === target
                ? targetTorrentGroup.response.group
                : torrentGroup!.response.group,
            subtext:
              "[code]flac --decode --stdout | lame -b 320 --add-id3v2[/code]",
          });

          const expr = new RegExp(
            `(\\*\\*↑ Upload MP3 320 to ${trackerSource.toUpperCase()}\\*\\*)`,
            "gim"
          );

          embed.description = embed.description!.replace(
            expr,
            `~~$1~~ [(completed)](${CONSTANTS.GAZELLE_BASE_URLS[trackerSource]}/torrents.php?torrentid=${upload.response.torrentid})`
          );
          await msg.edit({ embeds: [embed] });

          const addedTorrent = await addTorrent(file, { category: "music" });
          await addTorrentTags("etc", addedTorrent.hash);
        }
      }
    });
  }

  if (upload.origin.vbr || upload.target.vbr) {
    transcodeFolder(torrent!, "v0").then(async (path) => {
      embed.description = embed
        .description!.replace(
          /(Transcode \*\*FLAC -> MP3 V0 \(VBR\)\*\*)/gim,
          "~~$1~~"
        )
        .replace(/in progress/gim, "completed");
      await msg.edit({ embeds: [embed] });

      const name = path.split("/")[path.split("/").length - 1];

      for (let source of ["origin", "target"] as const) {
        if (upload[source]["vbr"]) {
          const trackerSource = source === "origin" ? tracker : target;
          const trackerName =
            CONSTANTS.TRACKER_FULL_NAME[trackerSource].toUpperCase();

          const file = await makeTorrent({
            path,
            announce: process.env[`${trackerName}_ANNOUNCE_URL`]!,
            source: trackerSource.toUpperCase(),
            name,
          });

          const upload = await uploadGazelleTorrent({
            tracker: trackerSource,
            torrent: file,
            filename: `${name}.torrent`,
            format: "MP3",
            encoding: "V0 (VBR)",
            original: { tracker, torrent: trackerTorrent },
            targetGroup:
              trackerSource === target
                ? targetTorrentGroup.response.group
                : torrentGroup!.response.group,
            subtext:
              "[code]flac --decode --stdout | lame -V0 --vbr-new --add-id3v2[/code]",
          });

          const expr = new RegExp(
            `(\\*\\*↑ Upload MP3 V0 \\(VBR\\) to ${trackerSource.toUpperCase()}\\*\\*)`,
            "gim"
          );

          embed.description = embed.description!.replace(
            expr,
            `~~$1~~ [(completed)](${CONSTANTS.GAZELLE_BASE_URLS[trackerSource]}/torrents.php?torrentid=${upload.response.torrentid})`
          );
          await msg.edit({ embeds: [embed] });

          const addedTorrent = await addTorrent(file, { category: "music" });
          await addTorrentTags("etc", addedTorrent.hash);
        }
      }
    });
  }

  return;
};
