export function convertTorrentPath({
  folderName,
  isEtc,
  encoding,
}: {
  folderName: string;
  isEtc: boolean;
  encoding: "CBR" | "VBR";
}): string {
  return `${
    isEtc
      ? process.env.QBITTORRENT_DOWNLOAD_ETC_PATH!
      : process.env.QBITTORRENT_DOWNLOAD_PATH!
  }/${folderName}`
    .replace(
      /FLAC (24bit )?Lossless/gim,
      `MP3 ${encoding === "CBR" ? "320" : "V0 (VBR)"}`
    )
    .replace(/ \((\d{1,3}%)?( - )?(Cue)?\)(?=$|\/|\\)/gim, "");
}
