import { RunCommand } from "argos";
import {
  ComponentInteraction,
  Constants,
  Embed,
  Message,
  TextableChannel,
} from "eris";
import { CONSTANTS } from "../../lib/constants";
import { runAllJobs } from "../../lib/qb/jobs/runAllJobs";
import { getTorrentName } from "../../lib/qb/torrents/getTorrentName";
import { getGazelleTorrent } from "../../lib/tracker/gazelle/getGazelleTorrent";
import { getGazelleTorrentFormats } from "../../lib/tracker/gazelle/getGazelleTorrentFormats";
import { getGazelleTorrentGroup } from "../../lib/tracker/gazelle/getGazelleTorrentGroup";
import { isGazelleTracker } from "../../lib/tracker/util/isTracker";
import { DownloadJob, TranscodeJob, UploadJob } from "../../struct/job";

export const snatchCommand: RunCommand = async ({ message, client }) => {
  const tracker = message.content.split(" ")[1]?.toLowerCase();
  if (!isGazelleTracker(tracker)) throw new Error("invalid tracker");

  const torrentId = parseInt(message.content.split(" ")[2], 10);
  const trackerTorrent = await getGazelleTorrent({ id: torrentId, tracker });

  if (!trackerTorrent) {
    throw new Error("No torrent found");
  }

  /**
   * Detect missing formats on the primary tracker to transcode
   */
  const primaryTorrentGroup = (await getGazelleTorrentGroup({
    id: trackerTorrent.group.id,
    tracker,
  }))!.response;

  const primaryMissingFormats = getGazelleTorrentFormats(
    primaryTorrentGroup,
    trackerTorrent.torrent,
    trackerTorrent.torrent.remastered
  );
  const primaryFormats = Object.entries(primaryMissingFormats)
    .filter(([_, status]) => status === true)
    .map(([format]) => format.toUpperCase());

  let status: Message<TextableChannel>;
  let shouldTranscode: boolean | undefined;
  let confirmed: boolean | undefined;
  if (primaryFormats.length > 0) {
    const embed: Embed = {
      type: "",
      author: {
        icon_url: client.user.dynamicAvatarURL(),
        name: "Snatch Torrent",
      },
      description:
        "You're about to snatch the following torrent from RED:" +
        `\n**${await getTorrentName(tracker, torrentId)}**` +
        `\n\nThis torrent is missing the following formats: **${primaryFormats.join(
          "**, **"
        )}**.\nWould you like to automatically transcode and upload these formats?`,
    };

    const timestamp = Date.now();
    status = await client.createMessage(message.channel.id, {
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: `confirm-transcode?${timestamp}`,
              label: "Sure",
              style: Constants.ButtonStyles.PRIMARY,
            },
            {
              type: 2,
              custom_id: `decline-transcode?${timestamp}`,
              label: "No thanks",
              style: Constants.ButtonStyles.SECONDARY,
            },
          ],
        },
      ],
    });

    async function handleInteraction(interaction: any) {
      if (!(interaction instanceof ComponentInteraction)) return;
      if (!interaction.data.custom_id.includes(timestamp.toString())) return;
      await interaction.acknowledge();

      if (interaction.data.custom_id.includes("confirm-transcode")) {
        shouldTranscode = true;
      } else shouldTranscode = false;

      confirmed = true;

      client.removeListener("interactionCreate", handleInteraction);
      return;
    }

    client.addListener("interactionCreate", handleInteraction);

    await new Promise<void>((res) =>
      setInterval(
        () => (shouldTranscode !== undefined ? res() : undefined),
        100
      )
    );
  } else {
    const embed: Embed = {
      type: "",
      author: {
        icon_url: client.user.dynamicAvatarURL(),
        name: "Snatch Torrent",
      },
      description:
        "You're about to snatch the following torrent from RED:" +
        `\n**${await getTorrentName(tracker, torrentId)}**` +
        `\n\nThis torrent does not need to be transcoded.`,
    };

    const timestamp = Date.now();
    status = await client.createMessage(message.channel.id, {
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: `confirm-snatch?${timestamp}`,
              label: "Confirm",
              style: Constants.ButtonStyles.PRIMARY,
            },
            {
              type: 2,
              custom_id: `decline-snatch?${timestamp}`,
              label: "Nevermind",
              style: Constants.ButtonStyles.SECONDARY,
            },
          ],
        },
      ],
    });

    async function handleInteraction(interaction: any) {
      if (!(interaction instanceof ComponentInteraction)) return;
      if (!interaction.data.custom_id.includes(timestamp.toString())) return;
      await interaction.acknowledge();

      if (interaction.data.custom_id.includes("confirm-snatch")) {
        confirmed = true;
      } else confirmed = false;

      client.removeListener("interactionCreate", handleInteraction);
      return;
    }

    client.addListener("interactionCreate", handleInteraction);

    await new Promise<void>((res) =>
      setInterval(() => (confirmed !== undefined ? res() : undefined), 100)
    );
  }

  if (!confirmed) return;

  const download = new DownloadJob({ tracker, setId: 0, torrentId: torrentId });
  const downloadingEmbed = (progress: number): Embed => {
    return {
      type: "",
      author: {
        icon_url: client.user.dynamicAvatarURL(),
        name: "Snatch Torrent",
      },
      description:
        "Torrent snatched! It's now downloading..." +
        `\n${"▓".repeat(Math.floor((progress * 100) / 5)).padEnd(20, "░")} **${(
          progress * 100
        ).toFixed(2)}%**`,
    };
  };

  download.addListener("progress", async (progress) => {
    await client.editMessage(status.channel.id, status.id, {
      embeds: [downloadingEmbed(progress)],
      components: [],
    });
  });

  const torrent = await download.run();

  if (shouldTranscode) {
    console.log(primaryFormats);
    const jobs: TranscodeJob[] = primaryFormats.map(
      (f) =>
        new TranscodeJob({
          tracker,
          setId: 0,
          torrent,
          encoding: f as "CBR" | "VBR",
        })
    );

    const transcodingEmbed = (jobs: TranscodeJob[]) => {
      const cbrProgress = jobs.find((j) => j.encoding === "CBR")?.progress;
      const vbrProgress = jobs.find((j) => j.encoding === "VBR")?.progress;

      return {
        type: "",
        author: {
          icon_url: client.user.dynamicAvatarURL(),
          name: "Snatch Torrent",
        },
        description:
          "Download complete! Time to transcode...\n\nJobs" +
          (cbrProgress !== undefined
            ? `\nTranscode **FLAC -> MP3 320** (${(cbrProgress * 100).toFixed(
                2
              )}%)`
            : "") +
          (vbrProgress !== undefined
            ? `\nTranscode **FLAC -> MP3 V0 (VBR)** (${(
                vbrProgress * 100
              ).toFixed(2)}%)`
            : ""),
      };
    };

    jobs.forEach((job) =>
      job.addListener("progress", async () => {
        await client.editMessage(status.channel.id, status.id, {
          embeds: [transcodingEmbed(jobs)],
        });
      })
    );

    await runAllJobs(jobs);

    const uploadJobs: UploadJob[] = jobs.map(
      (j) =>
        new UploadJob({
          tracker,
          setId: 0,
          path: j.result!,
          format: "MP3",
          encoding: j.encoding === "CBR" ? "320" : "V0 (VBR)",
          filename: `${
            j.result!.split("/")[j.result!.split("/").length - 1]
          }.torrent`,
          original: { tracker, torrent: trackerTorrent },
          targetGroup: primaryTorrentGroup.group,
          subtext: `[code]flac --decode --stdout | lame ${
            j.encoding === "CBR" ? "-b 320" : "-V0 --vbr-new"
          } --add-id3v2[/code]`,
        })
    );

    await runAllJobs(uploadJobs);

    const embed: Embed = {
      type: "",
      author: {
        icon_url: client.user.dynamicAvatarURL(),
        name: "Snatch Torrent",
      },
      description: `Transcodes + uploads complete!\n${uploadJobs
        .map(
          (j) =>
            `[**FLAC -> MP3 ${j.encoding}**](${CONSTANTS.GAZELLE_BASE_URLS[tracker]}//torrents.php?torrentid=${j.result})`
        )
        .join("\n")}\n\nEnjoy your music :)`,
    };

    await client.editMessage(status.channel.id, status.id, { embeds: [embed] });
    return;
  } else {
    const embed: Embed = {
      type: "",
      author: {
        icon_url: client.user.dynamicAvatarURL(),
        name: "Snatch Torrent",
      },
      description: "Download complete! Enjoy your music :)",
    };

    await client.editMessage(status.channel.id, status.id, { embeds: [embed] });
    return;
  }
};
