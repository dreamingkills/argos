import { GazelleTracker } from "argos";

export function getOppositeTracker(tracker: GazelleTracker): GazelleTracker {
  return tracker === "ops" ? "red" : "ops";
}
