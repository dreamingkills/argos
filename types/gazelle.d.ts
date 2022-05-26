declare module "gazelle" {
  export interface GazelleArtist {
    id: number;
    name: string;
  }

  export type GazelleEncoding = "Lossless" | "320" | "V0 (VBR)";

  export interface GazelleTorrent {
    group: {
      wikiBody: string;
      wikiBBcode: string;
      wikiImage: string;
      id: number;
      name: string;
      year: number;
      recordLabel: string;
      catalogueNumber: string;
      releaseType: number;
      releaseTypeName: "EP";
      categoryId: number;
      categoryName: "Music";
      time: string;
      vanityHouse: boolean;
      isBookmarked: boolean;
      tags: string[];
      musicInfo: {
        artists: GazelleArtist[];
        with: GazelleArtist[];
        remixedBy: GazelleArtist[];
        composers: GazelleArtist[];
        conductor: GazelleArtist[];
        dj: GazelleArtist[];
        producer: GazelleArtist[];
        arranger: GazelleArtist[];
      };
    };
    torrent: {
      infoHash: string;
      id: number;
      media:
        | "CD"
        | "WEB"
        | "Vinyl"
        | "DVD"
        | "BD"
        | "Soundboard"
        | "SACD"
        | "DAT"
        | "Casette";
      format: "FLAC" | "MP3" | "AAC" | "AC3" | "DTS" | "Ogg Vorbis";
      encoding: GazelleEncoding;
      remastered: boolean;
      remasterYear: unknown | null;
      remasterTitle: string;
      remasterRecordLabel: string;
      remasterCatalogueNumber: string;
      scene: boolean;
      hasLog: boolean;
      hasCue: boolean;
      logScore: number;
      logChecksum: false;
      logCount: number;
      ripLogIds: unknown[];
      fileCount: number;
      size: number;
      seeders: number;
      leechers: number;
      snatched: number;
      freeTorrent: "0";
      reported: boolean;
      time: string;
      description: string;
      fileList: string;
      filePath: string;
      userId: number;
      username: string;
    };
  }

  export interface GazelleTorrentGroup {
    status: "success";
    response: {
      group: {
        wikiBody: string;
        bbBody: string;
        wikiImage: string;
        id: number;
        name: string;
        year: number;
        recordLabel: string;
        catalogueNumber: string;
        releaseType: number;
        categoryId: number;
        categoryName: string;
        time: string;
        collages: unknown[];
        personalCollages: unknown[];
        vanityHouse: boolean;
        musicInfo: {
          artists: GazelleArtist[];
          with: GazelleArtist[];
          remixedBy: GazelleArtist[];
          composers: GazelleArtist[];
          conductor: GazelleArtist[];
          dj: GazelleArtist[];
          producer: GazelleArtist[];
          arranger: GazelleArtist[];
        };
      };
      torrents: {
        id: number;
        media: "CD";
        format: "FLAC" | "MP3" | "AAC" | "AC3" | "DTS" | "Ogg Vorbis";
        encoding: GazelleEncoding;
        remastered: boolean;
        remasterYear: number;
        remasterTitle: string;
        remasterRecordLabel: string;
        remasterCatalogueNumber: string;
        scene: boolean;
        hasLog: boolean;
        hasCue: boolean;
        logScore: number;
        fileCount: number;
        size: number;
        seeders: number;
        leechers: number;
        snatched: number;
        hasSnatched: boolean;
        trumpable: boolean;
        lossyWebApproved: boolean;
        lossyMasterApproved: boolean;
        freeTorrent: boolean;
        isNeutralleech: boolean;
        isFreeload: boolean;
        time: string;
        description: string;
        fileList: string;
        filePath: string;
        userId: number;
        username: string;
      }[];
    };
  }

  export interface GazelleSearch {
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
          encoding: GazelleEncoding;
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

  export interface GazelleUpload {
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
