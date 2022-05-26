import { got, Options as GotOptions } from "got";
import { urlJoin } from "@ctrl/url-join";
import { Cookie } from "tough-cookie";
import { TorrentSettings } from "qbittorrent";
import axios from "axios";
import FormData from "form-data";

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
    params?: object;
    body?: object;
    form?: FormData;
    headers?: any;
    json?: boolean;
  }): Promise<T> {
    if (!this.cookieIsValid()) await this.login();

    const url = urlJoin(this.config.baseUrl, this.config.path, path);
    const response = await axios({
      url,
      method,
      headers: {
        Cookie: `SID=${this.cookie ?? ""}`,
        ...headers,
        ...form?.getHeaders(),
      },
      timeout: this.config.timeout,
      responseType: json ? "json" : "text",
      data: body || form?.getBuffer(),
      params,
    });

    return response.data;
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
