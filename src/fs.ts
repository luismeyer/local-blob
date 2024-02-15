import fs from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export const tmpFolder = join(tmpdir(), "local-blob-storage");

// Function to create a temporary folder
async function getPath(path: string) {
  try {
    // throws if not exists
    await fs.stat(tmpFolder);
  } catch {
    // Create the temporary folder
    await fs.mkdir(tmpFolder);
  } finally {
    return join(tmpFolder, path);
  }
}

// Function to create a file
export async function createFile(filePath: string, data: ArrayBuffer) {
  await fs.writeFile(await getPath(filePath), Buffer.from(data));
}

// Function to get the contents of a file
export async function getFileContents(filePath: string) {
  return fs.readFile(await getPath(filePath), "utf-8");
}

// Function to list files in a directory
export async function listFilesInDirectory(directoryPath: string) {
  return fs.readdir(await getPath(directoryPath));
}

// Function to copy a file
export async function copyFile(sourcePath: string, destinationPath: string) {
  await fs.copyFile(await getPath(sourcePath), await getPath(destinationPath));
}

// Function to delete a file
export async function deleteFile(filePath: string) {
  await fs.unlink(await getPath(filePath));
}
