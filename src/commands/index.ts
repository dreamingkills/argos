import { RunCommand } from "argos";
import { infoCommand } from "./meta/info";
import { transcode } from "./transcode/transcode";

export default {
  nfo: infoCommand,
  transcode: transcode,
} as {
  [key: string]: RunCommand;
};
