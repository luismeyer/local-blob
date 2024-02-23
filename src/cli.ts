#! /usr/bin/env node

import { program } from "commander";
import { startBlobServer } from "./server";
import { existsSync } from "fs";
import { appendFile, readFile } from "fs/promises";
import { join } from "path";
import { port } from "./public";

program.option("--debug");

program.parse();

const options = program.opts();

const possibleEnvFiles = [".env.development.local", ".env.local"];

const envFile = possibleEnvFiles.find((file) =>
  existsSync(join(process.cwd(), file))
);

const envVars = `
NEXT_PUBLIC_VERCEL_BLOB_API_URL=http://0.0.0.0:8787
VERCEL_BLOB_API_URL=http://0.0.0.0:8787
`;

if (!envFile) {
  console.info(
    `No env file found. Make sure to load the following environment variables:\n${envVars}`
  );
}

if (envFile) {
  const fullEnvPath = join(process.cwd(), envFile);
  const envContent = await readFile(fullEnvPath, "utf-8");

  if (
    !envContent.includes("VERCEL_BLOB_API_URL") &&
    !envContent.includes("NEXT_PUBLIC_VERCEL_BLOB_API_URL")
  ) {
    console.info(`Adding Local @vercel/blob API URL's to ${envFile} file.`);
    await appendFile(fullEnvPath, envVars);
  }
}

startBlobServer({ dev: options.debug });

console.info(`Local @vercel/blob Server started on http://localhost:${port}`);
