import { RunCommand } from "argos";
import { Embed } from "eris";
import { getQbVersion } from "../../lib/qb/meta/getQbVersion";
import { listTorrents } from "../../lib/qb/torrents/listTorrents";

export const infoCommand: RunCommand = async ({ message, client }) => {
  const qbVersion = await getQbVersion();
  const torrents = await listTorrents();

  const numSeeding = torrents.filter(
    (t) => t.state === "uploading" || t.state === "stalledUP"
  ).length;
  const numUploading = torrents.filter((t) => t.state === "uploading").length;

  const trackers: string[] = [];
  const categories: { [key: string]: number } = {};

  for (let torrent of torrents) {
    const category = torrent.category || "*none*";
    if (categories[category]) {
      categories[category] += 1;
    } else categories[category] = 1;

    if (torrent.tracker && !trackers.includes(torrent.tracker))
      trackers.push(torrent.tracker);
  }

  const embed: Embed = {
    type: "",
    author: {
      icon_url: client.user.dynamicAvatarURL(),
      name: `qBittorrent ${qbVersion}`,
    },
    fields: [
      {
        inline: true,
        name: "Torrent Stats",
        value: `:cd: **${torrents.length.toLocaleString()}** torrents registered\n:satellite: **${numSeeding.toLocaleString()}** currently seeding ${
          numUploading > 0
            ? `(**${numUploading.toLocaleString()}** uploading now!)`
            : ``
        }\n:bookmark_tabs: Announcing to **${
          trackers.length
        }** trackers\n\nBreakdown by category:\n${Object.entries(categories)
          .map(([name, count]) => `${name}: **${count.toLocaleString()}**`)
          .join("\n")}`,
      },
    ],
  };

  await client.createMessage(message.channel.id, { embeds: [embed] });
};
