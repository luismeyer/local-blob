import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import path, { relative } from "path";

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import { delValidator, handleDel } from "./del";
import { tmpFolder } from "./fs";
import { handleHead } from "./head";
import { handleList } from "./list";
import { downloadPath, port } from "./public";
import { handlePut } from "./put";

export const app = new Hono();

app.use(logger());
app.use(cors());

app.get(
  `${downloadPath}*`,
  serveStatic({
    root: relative(__dirname, tmpFolder),
    rewriteRequestPath: (path) => path.replace(/^\/public/, ""),
  })
);

app.get("*", async (c) => {
  const isHeadRequest = Boolean(c.req.query("url"));

  if (isHeadRequest) {
    return handleHead(c);
  } else {
    return handleList(c);
  }
});

app.put("*", handlePut);
app.post("/delete", delValidator, handleDel);

console.log(`local-blob: server is running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
