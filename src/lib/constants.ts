import { GazelleTracker, Tracker } from "argos";

export const CONSTANTS = {
  GAZELLE_BASE_URLS: {
    red: process.env.REDACTED_API_BASE_URL,
    ops: "https://orpheus.network",
  } as { [key in GazelleTracker]: string },
  TRACKER_FULL_NAME: {
    red: "Redacted",
    ops: "Orpheus",
  } as { [key in Tracker]: string },
} as const;
