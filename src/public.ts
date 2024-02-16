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
