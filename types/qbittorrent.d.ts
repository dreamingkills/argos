declare module "qbittorrent" {
  export interface TorrentSettings {
    /** URL to your QBittorrent client, e.g. http://localhost:4444 */
    baseUrl: string;
    /** The path to the QBittorrent API */
    path: string;
    username: string;
    password: string;
    timeout: number;
  }

  export interface AddTorrentOptions {
    filename?: never; // idk what this is for yet
    savepath?: string;
    category?: string;
    skip_checking?: "true" | "false";
    paused?: "true" | "false";
    contentLayout?: "Original" | "Subfolder" | "NoSubfolder";
    rename?: string;
    upLimit?: number;
    dlLimit?: number;
    ratioLimit?: number;
    seedingTimeLimit?: number;
    useAutoTMM?: "true" | "false";
    sequentialDownload?: "true" | "false";
    firstLastPiecePrio?: "true" | "false";
  }

  export type TorrentFilters =
    | "all"
    | "downloading"
    | "completed"
    | "paused"
    | "active"
    | "inactive"
    | "resumed"
    | "stalled"
    | "stalled_uploading"
    | "stalled_downloading";

  export type TorrentState =
    | "allocating"
    | "checkingDL"
    | "checkingResumeData"
    | "checkingUP"
    | "downloading"
    | "error"
    | "forcedDL"
    | "forcedMetaDL"
    | "missingFiles"
    | "moving"
    | "pausedDL"
    | "pausedUP"
    | "queuedDL"
    | "queuedUP"
    | "stalledDL"
    | "stalledUP"
    | "unknown"
    | "uploading";

  export interface Torrent {
    added_on: number;
    amount_left: number;
    auto_tmm: boolean;
    availability: number;
    category: string;
    completed: number;
    completion_on: number;
    content_path: string;
    dl_limit: number;
    dlspeed: number;
    download_Path: string;
    downloaded: number;
    downloaded_session: number;
    eta: number;
    f_l_piece_prio: boolean;
    force_start: boolean;
    hash: string;
    infohash_v1: string;
    infohash_v2: string;
    last_activity: number;
    magnet_uri: string;
    max_ratio: number;
    max_seeding_time: number;
    name: string;
    num_complete: number;
    num_incomplete: number;
    num_leechs: number;
    num_seeds: number;
    priority: number;
    progress: number;
    ratio: number;
    ratio_limit: number;
    save_path: string;
    seeding_time: number;
    seeding_time_limit: number;
    seen_complete: number;
    seq_dl: boolean;
    size: number;
    state: TorrentState;
    super_seeding: boolean;
    tags: string;
    time_active: number;
    total_size: number;
    tracker: string;
    trackers_count: number;
    up_limit: number;
    uploaded: number;
    uploaded_session: number;
    upspeed: number;
  }
}
