import { Context, Env } from "hono";
import { BlankInput } from "hono/types";
import mime from "mime";
import path from "path";

import { createFile } from "./fs";
import { parseHeaders } from "./headers";
import { randomSuffix } from "./random-suffix";
import { createBlobUrl } from "./public";

export interface PutBlobResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

export async function handlePut(c: Context<Env, "*", BlankInput>) {
  const pathname = c.req.path.slice(1);
  const filename = path.basename(pathname);

  const headers = parseHeaders(c.req.header());

  let filePath = pathname;
  if (headers.addRandomSuffix) {
    filePath = randomSuffix(pathname);
  }

  await createFile(filePath, await c.req.arrayBuffer());

  const contentType =
    headers.contentType || mime.getType(filename) || "application/octet-stream";

  return c.json<PutBlobResult>({
    pathname: filePath,
    url: createBlobUrl({ path: filePath }),
    contentDisposition: `inline; filename="${filename}"`,
    contentType,
    downloadUrl: createBlobUrl({ path: filePath, download: true }),
  });
}
