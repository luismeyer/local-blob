import path from "path";

export const downloadPath = "/public/";

export function createBlobUrl({
  download,
  path,
}: {
  path: string;
  download?: boolean;
}) {
  const query = download ? "?download=1" : "";

  return `http://0.0.0.0:${port}${downloadPath}${path}${query}`;
}

export const port = 8787;

export function parseBlobUrl(url: string) {
  const pathname = new URL(url).pathname.replace(/^\/public/, "");
  const filename = path.basename(pathname);

  return { pathname, filename };
}
