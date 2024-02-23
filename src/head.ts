import { Context, Env } from "hono";
import { BlankInput } from "hono/types";
import mime from "mime";
import path from "path";
import { z } from "zod";

import { fileStats } from "./fs";

interface HeadBlobResult {
  url: string;
  downloadUrl: string;
  size: number;
  uploadedAt: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  cacheControl: string;
}

const QuerySchema = z.object({
  url: z.string().url(),
});

export async function handleHead(c: Context<Env, "*", BlankInput>) {
  const query = QuerySchema.safeParse(c.req.query());
  if (!query.success) {
    return c.text("Invalid Query params!", 404);
  }

  const { url } = query.data;

  const pathname = new URL(url).pathname.replace(/^\/public/, "");

  const filename = path.basename(pathname);

  const stats = await fileStats(pathname);

  if (!stats) {
    return c.json(
      { error: { code: "not_found", message: "Blob not found" } },
      400
    );
  }

  return c.json<HeadBlobResult>({
    cacheControl: "public, max-age=31536000",
    contentDisposition: `inline; filename="${filename}"`,
    contentType: mime.getType(filename) ?? "application/octet-stream",
    downloadUrl: url,
    pathname,
    size: stats.size,
    uploadedAt: stats.birthtime.toISOString(),
    url,
  });
}
