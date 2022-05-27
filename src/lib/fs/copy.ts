import cpr from "cpr";

export async function copy(from: string, to: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    cpr(
      from,
      to,
      {
        deleteFirst: true,
        overwrite: true,
        confirm: true,
      },
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}
