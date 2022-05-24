declare module "redacted" {
  export interface RedactedSearch {
    status: "success";
    response: {
      currentPage: number;
      pages: number;
      results: {
        groupId: number;
        groupName: string;
        artist: string;
        cover: string;
        tags: string[];
        bookmarked: boolean;
        vanityHouse: boolean;
        groupYear: number;
        releaseType: string;
        groupTime: string;
        maxSize: number;
        totalSnatched: number;
        totalSeeders: number;
        totalLeechers: number;
        torrents: {
          torrentId: number;
          editionId: number;
          artists: { id: number; name: string; aliasid: number }[];
          remastered: boolean;
          remasterYear: number;
          remasterCatalogueNumber: string;
          remasterTitle: string;
          media:
            | "CD"
            | "WEB"
            | "Vinyl"
            | "DVD"
            | "Blu-Ray"
            | "Soundboard"
            | "SACD"
            | "DAT"
            | "Casette";
          encoding: "Lossless";
          format: "FLAC" | "MP3" | "AAC" | "AC3" | "DTS";
          hasLog: boolean;
          logScore: number;
          hasCue: boolean;
          scene: boolean;
          vanityHouse: boolean;
          fileCount: number;
          time: string;
          size: number;
          snatches: number;
          seeders: number;
          leechers: number;
          leechStatus: number;
          isFreeleech: boolean;
          isNeutralLeech: boolean;
          isFreeload: boolean;
          isPersonalFreeleech: boolean;
          canUseToken: boolean;
          hasSnatched: boolean;
        }[];
      }[];
    };
  }

  export interface RedactedUpload {
    status: "success";
    response: {
      private: boolean;
      source: boolean;
      requestid: number | null;
      torrentid: number;
      groupid: number;
    };
  }
}
