import { qb } from "../../..";

export async function getQbVersion(): Promise<string> {
  const res = await qb.request<string>({
    path: "/app/version",
    method: "GET",
    json: false,
  });

  return res;
}
