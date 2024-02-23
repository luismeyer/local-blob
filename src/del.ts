import { Context, Env } from "hono";
import { validator } from "hono/validator";

import { deleteFile } from "./fs";
import { z } from "zod";
import path from "path";

const BodySchema = z.object({
  urls: z.union([z.string().url().array(), z.string().url()]),
});

export const delValidator = validator("json", (value, c) => {
  const parsed = BodySchema.safeParse(value);

  if (!parsed.success) {
    return c.text("Invalid Body!", 404);
  }

  return parsed.data;
});

export async function handleDel(
  c: Context<Env, "*", { out: { json: { urls: string | string[] } } }>
) {
  const body = c.req.valid("json");

  try {
    if (typeof body.urls === "string") {
      const pathname = path.basename(body.urls);
      await deleteFile(pathname);
    }

    if (typeof body.urls === "object") {
      await Promise.all(
        body.urls.map(async (url) => {
          const pathname = path.basename(url);

          await deleteFile(pathname);
        })
      );
    }
  } finally {
    return c.json("deleted", 200);
  }
}
