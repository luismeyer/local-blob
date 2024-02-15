export function parseHeaders(headers: Record<string, string | undefined>) {
  return {
    cacheControlMaxAge: headers["x-cache-control-max-age"],
    addRandomSuffix: headers["x-add-random-suffix"] === "0" ? false : true,
    contentType: headers["x-content-type"],
  };
}
