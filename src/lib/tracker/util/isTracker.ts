import { GazelleTracker, Tracker } from "argos";

export function isTracker(tracker: string): tracker is Tracker {
  return tracker === "ops" || tracker === "red";
}

export function isGazelleTracker(tracker: string): tracker is GazelleTracker {
  return tracker === "ops" || tracker === "red";
}
