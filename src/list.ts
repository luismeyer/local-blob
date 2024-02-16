import { Context, Env } from "hono";
import { BlankInput } from "hono/types";

import { listFilesInDirectory } from "./fs";
import { createBlobUrl } from "./public";

interface ListBlobResultBlob {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface ListBlobResult {
  blobs: ListBlobResultBlob[];
  folders?: string[];
  cursor?: string;
  hasMore: boolean;
}

export async function handleList(c: Context<Env, "*", BlankInput>) {
  const limitParam = c.req.query("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : Infinity;

  const cursorParam = c.req.query("cursor");
  const cursor = cursorParam ? parseInt(cursorParam, 10) : 0;

  const prefixParam = c.req.query("prefix");
  const modeParam = c.req.query("mode") ?? "expanded";

  const files = await listFilesInDirectory(modeParam, prefixParam);

  const paginatedFiles = files?.slice(cursor, cursor + limit);

  let blobs: ListBlobResult["blobs"] = [];
  let folders: ListBlobResult["folders"] = [];

  for (const file of paginatedFiles) {
    if (file.stats.isFile()) {
      blobs = [
        ...blobs,
        {
          url: createBlobUrl({ path: file.path }),
          downloadUrl: createBlobUrl({ path: file.path, download: true }),
          pathname: file.path,
          size: file.stats.size,
          uploadedAt: file.stats.mtime.toISOString(),
        },
      ];
    }

    if (file.stats.isDirectory()) {
      folders = [...folders, file.path];
    }
  }

  const hasMore = files.length > cursor + limit;

  return c.json<ListBlobResult>({
    blobs,
    hasMore,
    cursor: hasMore ? String(cursor + limit) : undefined,
    folders,
  });
}
