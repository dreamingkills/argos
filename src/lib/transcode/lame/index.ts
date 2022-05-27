import { spawn, execSync } from "child_process";
import { ICommonTagsResult } from "music-metadata";
import { Writable } from "stream";

export async function lame({
  input,
  output,
  tags,
  type,
}: {
  input: string;
  output: string;
  tags: ICommonTagsResult;
  type: "CBR" | "VBR";
}): Promise<unknown> {
  const chunks: Buffer[] = [];
  const writable = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  const convert = spawn(
    process.env.FLAC_PATH || "flac",
    ["--decode", "--stdout", input],
    {
      stdio: ["pipe"],
    }
  );

  convert.stdout.pipe(writable);

  const buffer: Buffer = await new Promise((res) => {
    writable.on("close", () => res(Buffer.concat(chunks)));
  });

  let opt = "";

  if (type === "VBR") {
    opt = "-V0 --vbr-new";
  } else {
    opt = "-b 320";
  }

  execSync(
    `${process.env.LAME_PATH || "lame"} -S ${opt} --add-id3v2 --tt "${
      tags.title
    }" --ta "${tags.artist}" --tl "${tags.album}" --ty "${tags.year}" --tn "${
      tags.track.no
    }" --tg "${tags.genre || ""}" - "${output}"`,
    { input: buffer }
  );

  return;
}
