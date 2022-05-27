import { GazelleTracker, JobInput, Listener } from "argos";
import { Torrent } from "qbittorrent";
import { getTorrent } from "../lib/qb/torrents/getTorrent";
import { snatch } from "../lib/tracker/gazelle/snatch";
import { sanitizePath } from "../lib/util/sanitizePath";
import glob from "fast-glob";
import { unlink } from "fs/promises";
import mm from "music-metadata";
import { lame } from "../lib/transcode/lame";
import { copy } from "../lib/fs/copy";
import { convertTorrentPath } from "../lib/qb/torrents/convertTorrentPath";
import { uploadGazelleTorrent } from "../lib/tracker/gazelle/uploadGazelleTorrent";
import { GazelleEncoding, GazelleTorrent, GazelleTorrentGroup } from "gazelle";
import { sleep } from "../lib/util/sleep";
import { makeTorrent } from "../lib/tracker/makeTorrent";
import { CONSTANTS } from "../lib/constants";
import { addTorrent } from "../lib/qb/torrents/addTorrent";
import { addTorrentTags } from "../lib/qb/torrents/addTorrentTags";

export class Job {
  _events: { [key: string]: Listener<any>[] } = {};
  tracker: GazelleTracker;
  progress: number = 0;
  finished: boolean = false;
  setId: number;
  result: any = undefined;

  constructor({ tracker, setId }: JobInput) {
    this.tracker = tracker;
    this.setId = setId;
  }

  emit(name: "finished", data: void): void;
  emit(name: "progress", data: number): void;
  emit(name: string, data: any): void {
    if (!this._events[name]) return;

    for (let event of this._events[name]) {
      event(data);
    }
  }

  addListener(name: "finished", listener: Listener<void>): Job;
  addListener(name: "progress", listener: Listener<number>): Job;
  addListener(name: string, listener: Listener<any>): Job {
    if (!this._events[name]) this._events[name] = [];

    this._events[name].push(listener);
    return this;
  }

  removeListener(name: string, listener: Listener<any>) {
    if (!this._events[name]) return;

    const filtered = this._events[name].filter((l) => l !== listener);
    this._events[name] = filtered;
  }

  public finish() {
    this.finished = true;
    this.emit("finished");
  }

  public setProgress(progress: number) {
    this.progress = progress;
    this.emit("progress", progress);
  }

  public async run(): Promise<any> {
    throw new Error("Not implemented");
  }
}

export class DownloadJob extends Job {
  torrent: GazelleTorrent;
  freeleech: boolean;
  result: Torrent | undefined;
  isEtc: boolean;

  constructor({
    tracker,
    setId,
    torrent,
    freeleech = false,
    isEtc = false,
  }: JobInput & {
    torrent: GazelleTorrent;
    freeleech?: boolean;
    isEtc?: boolean;
  }) {
    super({ tracker, setId });
    this.torrent = torrent;
    this.freeleech = freeleech;
    this.isEtc = isEtc;
  }

  public async run(): Promise<Torrent> {
    let torrent = await snatch({
      tracker: this.tracker,
      torrent: this.torrent,
      freeleech: this.freeleech,
      isEtc: this.isEtc,
    });

    while (torrent.progress < 1) {
      const _torrent = (await getTorrent(torrent.hash))!;
      torrent = _torrent;
      this.setProgress(_torrent.progress);

      await sleep(1000);
    }

    this.result = torrent;
    this.finish();
    return torrent;
  }
}

export class TranscodeJob extends Job {
  torrent: Torrent;
  encoding: "CBR" | "VBR";
  result: string | undefined;

  constructor({
    tracker,
    setId,
    torrent,
    encoding,
  }: JobInput & { torrent: Torrent; encoding: "CBR" | "VBR" }) {
    super({ tracker, setId });
    this.torrent = torrent;
    this.encoding = encoding;
  }

  public async run(): Promise<string> {
    const torrent = this.torrent;
    const encoding = this.encoding;

    const flacs = await glob(`${sanitizePath(torrent.content_path)}/**/*.flac`);
    if (flacs.length === 0) throw new Error("no files");

    const outPath = convertTorrentPath({
      encoding,
      folderName: torrent.content_path.split("/").pop()!,
      isEtc: true,
    });

    await copy(torrent.content_path, outPath);
    const discard = await glob(`${sanitizePath(outPath)}/**/*.flac`);
    for (let file of discard) await unlink(file);

    for (let [i, file] of flacs.entries()) {
      const metadata = await mm.parseFile(file);
      const output = `${outPath}/${file
        .split("/")
        .pop()!
        .replace(/\.flac/gi, ".mp3")}`;

      await lame({
        input: file,
        output,
        tags: metadata.common,
        type: encoding,
      });

      this.setProgress((i + 1) / flacs.length);
    }

    this.result = outPath;
    this.finish();
    return outPath;
  }
}

export class UploadJob extends Job {
  path: string;
  format: string;
  filename: string;
  encoding: GazelleEncoding;
  original: { tracker: GazelleTracker; torrent: GazelleTorrent };
  targetGroup: GazelleTorrentGroup["response"]["group"];
  subtext: string | undefined;
  result: number | undefined;
  isEtc: boolean;

  constructor({
    tracker,
    setId,
    path,
    format,
    filename,
    encoding,
    original,
    targetGroup,
    subtext,
    isEtc = false,
  }: JobInput & {
    path: string;
    format: string;
    filename: string;
    encoding: GazelleEncoding;
    original: { tracker: GazelleTracker; torrent: GazelleTorrent };
    targetGroup: GazelleTorrentGroup["response"]["group"];
    subtext?: string;
    isEtc?: boolean;
  }) {
    super({ tracker, setId });
    this.path = path;
    this.format = format;
    this.filename = filename;
    this.encoding = encoding;
    this.original = original;
    this.targetGroup = targetGroup;
    this.subtext = subtext;
    this.isEtc = isEtc;
  }

  public async run() {
    const name = this.path.split("/")[this.path.split("/").length - 1];

    const file = await makeTorrent({
      path: this.path,
      announce:
        process.env[
          `${CONSTANTS.TRACKER_FULL_NAME[
            this.tracker
          ].toUpperCase()}_ANNOUNCE_URL`
        ]!,
      source: this.tracker.toUpperCase(),
      name,
    });

    const response = await uploadGazelleTorrent({
      tracker: this.tracker,
      torrent: file,
      format: this.format,
      filename: this.filename,
      encoding: this.encoding,
      original: this.original,
      targetGroup: this.targetGroup,
      subtext: this.subtext,
    });

    this.result = response.response.torrentid || response.response.torrentId;
    this.finish();

    const torrent = await addTorrent(file, {
      category: "music",
      contentLayout: "NoSubfolder",
      savepath: this.path,
      rename: name,
    });

    if (this.isEtc) await addTorrentTags("etc", torrent.hash);

    return this.result;
  }
}
