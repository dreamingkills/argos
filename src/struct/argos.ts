import { RunCommand } from "argos";
import { Client } from "eris";
import commands from "../commands";

export class Argos extends Client {
  constructor(token: string) {
    super(token);
  }

  public async init(): Promise<void> {
    this.on("ready", () => console.log("Argos is now running."));

    this.on("messageCreate", async (m) => {
      const isCommand = m.content.startsWith(".");
      if (!isCommand) return;

      const commandName = m.content.split(" ")[0].slice(1).toLowerCase();
      const command: RunCommand | undefined = commands[commandName];
      if (!command) return;

      await command({ message: m, client: this });
    });

    await this.connect();
  }
}
