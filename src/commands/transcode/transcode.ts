import { RunCommand } from "argos";
import { Embed } from "eris";
import { getTorrent } from "../../lib/qb/torrents/getTorrent";
import { makeTorrent } from "../../lib/tracker/makeTorrent";
import { getOrpheusTorrent } from "../../lib/tracker/ops/getOrpheusTorrent";
import { uploadREDTorrent } from "../../lib/tracker/red/uploadREDTorrent";
import { transcodeFolder } from "../../lib/transcode/transcodeFolder";

export const transcode: RunCommand = async ({ message, client }) => {
  const torrentId = parseInt(message.content.split(" ")[1], 10);
  const trackerTorrent = await getOrpheusTorrent({ id: torrentId });

  const torrent = await getTorrent(trackerTorrent.response.torrent.infoHash);

  const embed: Embed = {
    type: "",
    author: { icon_url: client.user.dynamicAvatarURL(), name: "Transcode" },
    description: `Transcoding [**${trackerTorrent.response.group.musicInfo.artists[0].name} - ${trackerTorrent.response.group.name}** (${trackerTorrent.response.torrent.media}-${trackerTorrent.response.torrent.format} ${trackerTorrent.response.torrent.encoding})](https://orpheus.network/torrents.php?torrentid=${trackerTorrent.response.torrent.id})...`,
  };

  const msg = await client.createMessage(message.channel.id, {
    embeds: [embed],
  });

  const cbr = await transcodeFolder(torrent!, "320");
  embed.description += `\n**FLAC -> MP3 320** completed!`;
  await msg.edit({ embeds: [embed] });

  const vbr = await transcodeFolder(torrent!, "v0");
  embed.description += `\n**FLAC -> MP3 V0 (VBR)** completed!`;
  await msg.edit({ embeds: [embed] });

  const cbrName = cbr.split("\\")[cbr.split("\\").length - 1];
  const vbrName = vbr.split("\\")[vbr.split("\\").length - 1];

  const cbrFile = await makeTorrent({
    path: cbr,
    announce: process.env.REDACTED_ANNOUNCE_URL!,
    source: "RED",
    name: cbrName,
  });

  const cbrUpload = await uploadREDTorrent(
    cbrFile,
    `${cbrName}.torrent`,
    "MP3",
    "320",
    trackerTorrent
  );

  embed.description += `\n[**FLAC -> MP3 320** uploaded to RED!](https://redacted.ch/torrents.php?torrentid=${cbrUpload.response.torrentid})`;
  await msg.edit({ embeds: [embed] });

  const vbrFile = await makeTorrent({
    path: vbr,
    announce: process.env.REDACTED_ANNOUNCE_URL!,
    source: "RED",
    name: vbrName,
  });

  const vbrUpload = await uploadREDTorrent(
    vbrFile,
    `${cbrName}.torrent`,
    "MP3",
    "V0 (VBR)",
    trackerTorrent
  );

  embed.description += `\n[**FLAC -> MP3 V0 (VBR)** uploaded to RED!](https://redacted.ch/torrents.php?torrentid=${vbrUpload.response.torrentid})`;
  await msg.edit({ embeds: [embed] });

  return;
};
