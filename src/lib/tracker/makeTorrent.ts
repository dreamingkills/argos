import createTorrent from "create-torrent";

export async function makeTorrent({
  path,
  announce,
  source,
  name,
}: {
  path: string;
  announce: string;
  source: string;
  name: string;
}): Promise<Buffer> {
  const torrent: Buffer = await new Promise((resolve, reject) => {
    createTorrent(
      path,
      {
        announceList: [[announce]],
        name: name,
        private: true,
        info: { source: source },
        createdBy: "Argos",
      },
      (err, buffer) => {
        if (err) reject(err);
        resolve(buffer);
      }
    );
  });

  return torrent;
}
