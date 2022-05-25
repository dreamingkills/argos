declare module "argos" {
  export type Context = {
    message: import("eris").Message<
      import("eris").PossiblyUncachedTextableChannel
    >;
    client: import("../src/struct/argos").Argos;
  };

  export type RunCommand = (context: Context) => void | Promise<void>;
  export type GazelleTracker = "ops" | "red";
  export type Tracker = "ops" | "red";
}
