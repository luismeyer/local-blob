import { startBlobServer } from "../src/server";
import { port } from "../src/public";

console.log(`local-blob: server is running on http://localhost:${port}`);

void startBlobServer();
