import { qb } from "../../..";

export async function getQbVersion(): Promise<string> {
  const res = await qb.request<string>(
    "/app/version",
    "GET",
    undefined,
    undefined,
    undefined,
    undefined,
    false
  );

  return res.body;
}
