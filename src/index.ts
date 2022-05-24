import "dotenv/config";
import { Argos } from "./struct/argos";
import { qBittorrent } from "./struct/qbit";

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error("No Discord bot token specified");
  process.exit(0);
}

const baseUrl = process.env.QBITTORRENT_BASE_URL;
const username = process.env.QBITTORRENT_USERNAME;
const password = process.env.QBITTORRENT_PASSWORD;

if (!baseUrl) {
  console.error("Missing qBittorrent URL");
  process.exit(0);
}

export const argos = new Argos(token).init().catch((e) => {
  throw e;
});

export const qb = new qBittorrent({ baseUrl, username, password });
