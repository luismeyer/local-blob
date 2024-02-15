import { Hono } from "hono";

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import { createFile, tmpFolder } from "./fs";
import { parseHeaders } from "./headers";
import { createRandomSuffixPath } from "./put";
import { relative } from "path";

const app = new Hono();

app.use(
  "/public/*",
  serveStatic({
    root: relative(__dirname, tmpFolder),
    rewriteRequestPath: (path) => path.replace(/^\/public/, ""),
  })
);

app.put("*", async (c) => {
  const pathname = c.req.path.slice(1);
  const headers = parseHeaders(c.req.header());

  let filePath = pathname;
  if (headers.addRandomSuffix) {
    filePath = createRandomSuffixPath(pathname);
  }

  await createFile(filePath, await c.req.arrayBuffer());

  return c.json({ pathname: filePath, url: createUrl(filePath) });
});

function createUrl(path: string) {
  return `http://localhost:${port}/public/${path}`;
}

const port = 8787;
console.log(`Server is running on port ${port}`);

serve({ fetch: app.fetch, port });
