const trackers = {
  "https://opsfet.ch": "Orpheus",
  "https://flacsfor.me": "Redacted",
  "https://t.myanonamouse.net": "MyAnonaMouse",
  "http://jpopsuki.eu": "JPopsuki",
};

export function resolveTrackerURL(url: string): string {
  return (
    Object.entries(trackers).filter(([root]) => url.startsWith(root))[0][1] ||
    "Unknown"
  );
}
