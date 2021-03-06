import { GazelleTorrent } from "gazelle";

export function getTorrentArtists(
  torrent: GazelleTorrent,
  capitalize: boolean
): string {
  const { musicInfo } = torrent.group;
  let artist: string;

  if (musicInfo.dj.length === 1) {
    artist = musicInfo.dj[0].name;
  } else if (musicInfo.artists.length === 1) {
    artist = musicInfo.artists[0].name;
  } else if (musicInfo.artists.length === 2) {
    artist = musicInfo.artists.map((a) => a.name).join(" & ");
  } else artist = "Various Artists";

  if (capitalize) artist = artist.toUpperCase();
  return artist;
}
