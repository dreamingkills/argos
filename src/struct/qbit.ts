import { got, Options as GotOptions, Response } from "got";
import { urlJoin } from "@ctrl/url-join";
import { Cookie } from "tough-cookie";
import { TorrentSettings } from "qbittorrent";

export class qBittorrent {
  config: TorrentSettings;

  private cookie?: string;
  private expiration?: Date;

  constructor(options: Partial<TorrentSettings> = {}) {
    this.config = {
      baseUrl: "http://localhost:9091/",
      path: "/api/v2",
      username: "",
      password: "",
      timeout: 5000,
      ...options,
    };
  }

  private cookieIsValid(): boolean {
    if (!this.cookie) return false;
    if (!this.expiration) return false;
    return this.expiration.getTime() < new Date().getTime();
  }

  async request<T extends object | string>({
    path,
    method,
    params = {},
    body,
    form,
    headers = {},
    json = true,
  }: {
    path: string;
    method: GotOptions["method"];
    params?: any;
    body?: GotOptions["body"];
    form?: GotOptions["form"];
    headers?: any;
    json?: boolean;
  }): Promise<Response<T>> {
    if (!this.cookieIsValid()) await this.login();

    const url = urlJoin(this.config.baseUrl, this.config.path, path);
    const res = await got<T>(url, {
      method,
      headers: {
        Cookie: `SID=${this.cookie ?? ""}`,
        ...headers,
      },
      retry: { limit: 0 },
      body,
      form,
      searchParams: new URLSearchParams(params),
      timeout: { request: this.config.timeout },
      // this is stupid. wtf, got maintainer?
      responseType: json ? "json" : ("text" as "json"),
    });

    return res;
  }

  async login(): Promise<void> {
    const url = urlJoin(this.config.baseUrl, this.config.path, "/auth/login");

    const res = await got({
      url,
      method: "POST",
      form: {
        username: this.config.username ?? "",
        password: this.config.password ?? "",
      },
      followRedirect: false,
      retry: { limit: 0 },
      timeout: { request: this.config.timeout },
    });

    if (!res.headers["set-cookie"] || !res.headers["set-cookie"].length) {
      throw new Error("Cookie not found. Auth Failed.");
    }

    const cookie = Cookie.parse(res.headers["set-cookie"][0]);
    if (!cookie || cookie.key !== "SID") {
      throw new Error("Invalid cookie");
    }

    this.cookie = cookie.value;
    this.expiration = cookie.expiryDate();
    return;
  }
}
