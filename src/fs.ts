import { Stats, existsSync, stat } from "fs";
import fs from "fs/promises";
import { tmpdir } from "os";
import path, { join } from "path";
import { fileURLToPath } from "url";

export const tmpFolder = join(tmpdir(), "local-blob-storage");

// Function to create a temporary folder
async function getPath(path?: string) {
  try {
    // throws if not exists
    await fs.stat(tmpFolder);
  } catch {
    // Create the temporary folder
    await fs.mkdir(tmpFolder);
  } finally {
    if (!path) {
      return tmpFolder;
    }

    return join(tmpFolder, path);
  }
}

// Function to create a file
export async function createFile(filePath: string, data: ArrayBuffer) {
  const absolutePath = await getPath(filePath);

  const dirname = path.dirname(absolutePath);

  console.log(dirname);
  if (!existsSync(dirname)) {
    await fs.mkdir(dirname, { recursive: true });
  }

  await fs.writeFile(absolutePath, Buffer.from(data));
}

// Function to get the contents of a file
export async function getFileContents(filePath: string) {
  return fs.readFile(await getPath(filePath));
}

// Function to list files in a directory
export async function listFilesInDirectory(
  mode: string,
  directoryPath?: string
) {
  const absolutePath = await getPath(directoryPath);

  try {
    const relativePaths = await fs.readdir(absolutePath, {
      recursive: mode === "expanded",
    });

    let result: { path: string; stats: Stats }[] = [];

    for (const relativePath of relativePaths) {
      const stats = await fileStats(absolutePath);

      if (stats.isFile()) {
        result = [...result, { path: relativePath, stats }];
      }

      const isDirectory = stats.isDirectory();
      if (isDirectory && mode === "folded") {
        result = [...result, { path: relativePath, stats }];
      }
    }

    return result;
  } catch {
    return [];
  }
}

// Function to copy a file
export async function copyFile(sourcePath: string, destinationPath: string) {
  await fs.copyFile(await getPath(sourcePath), await getPath(destinationPath));
}

// Function to delete a file
export async function deleteFile(filePath: string) {
  const absolutePath = await getPath(filePath);
  console.log({ absolutePath });
  await fs.unlink(absolutePath);
}

export async function fileStats(path: string) {
  const absolutePath = await getPath(path);
  return await fs.stat(absolutePath);
}

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
