export function sanitizePath(path: string): string {
  return path
    .replace(/\[/gim, "\\[")
    .replace(/\]/gim, "\\]")
    .replace(/\(/gim, "\\(")
    .replace(/\)/gim, "\\)");
}
