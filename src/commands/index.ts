import { RunCommand } from "argos";
import { snatchCommand } from "./gazelle/snatch";
import { infoCommand } from "./meta/info";
import { transcode } from "./transcode/transcode";

export default {
  nfo: infoCommand,
  transcode: transcode,
  snatch: snatchCommand,
} as {
  [key: string]: RunCommand;
};
