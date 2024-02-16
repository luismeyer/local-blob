import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: "esm",
  treeshake: true,
  cjsInterop: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
