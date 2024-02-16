import { Context, Env } from "hono";
import { BlankInput } from "hono/types";
import mime from "mime";
import path from "path";

import { copyFile } from "./fs";
import { parseHeaders } from "./headers";
import { randomSuffix } from "./random-suffix";
import { createBlobUrl, parseBlobUrl } from "./public";
import { z } from "zod";

export interface CopyBlobResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

const QuerySchema = z.object({
  fromUrl: z.string().url(),
});

export async function handleCopy(c: Context<Env, "*", BlankInput>) {
  const query = QuerySchema.safeParse(c.req.query());
  if (!query.success) {
    return c.text("Invalid Query params!", 404);
  }

  const { fromUrl } = query.data;
  const { pathname: fromPathname } = parseBlobUrl(fromUrl);

  const pathname = c.req.path.slice(1);
  const filename = path.basename(pathname);

  const headers = parseHeaders(c.req.header());

  let filePath = pathname;
  if (headers.addRandomSuffix) {
    filePath = randomSuffix(pathname);
  }

  await copyFile(fromPathname, filePath);

  const contentType =
    headers.contentType || mime.getType(filename) || "application/octet-stream";

  return c.json<CopyBlobResult>({
    pathname: filePath,
    url: createBlobUrl({ path: filePath }),
    contentDisposition: `inline; filename="${filename}"`,
    contentType,
    downloadUrl: createBlobUrl({ path: filePath, download: true }),
  });
}
