declare module "orpheus" {
  export interface OrpheusArtist {
    id: number;
    name: string;
  }

  export interface OrpheusTorrent {
    status: "success" | unknown;
    response: {
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
          artists: OrpheusArtist[];
          with: OrpheusArtist[];
          remixedBy: OrpheusArtist[];
          composers: OrpheusArtist[];
          conductor: OrpheusArtist[];
          dj: OrpheusArtist[];
          producer: OrpheusArtist[];
          arranger: OrpheusArtist[];
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
        encoding: "Lossless";
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
    };
    info: {
      source: "Orpheus";
      version: number;
    };
  }
}
