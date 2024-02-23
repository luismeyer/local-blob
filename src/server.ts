import { Hono } from "hono";
import { logger } from "hono/logger";
import { relative } from "path";

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import { handleCopy } from "./copy";
import { delValidator, handleDel } from "./del";
import { __dirname, tmpFolder } from "./fs";
import { handleHead } from "./head";
import { handleList } from "./list";
import { downloadPath, port } from "./public";
import { handlePut } from "./put";

type Options = {
  dev?: boolean;
};

export function startBlobServer({ dev }: Options = {}) {
  const app = new Hono();

  if (dev) {
    app.use(logger());
  }

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

  app.put("*", async (c) => {
    const isCopyRequest = Boolean(c.req.query("fromUrl"));

    if (isCopyRequest) {
      return handleCopy(c);
    } else {
      return handlePut(c);
    }
  });

  app.post("/delete", delValidator, handleDel);

  return serve({ fetch: app.fetch, port });
}
