// Starts the local Next.js binary with the repo-root .env loaded before the
// process starts. Next itself only reads .env from the app directory, and in a
// monorepo the single .env lives at the root. Loading it in next.config is too
// late for the server workers, so it happens here instead.
//
// On Vercel the variables come from the project settings; the file lookup is
// simply skipped when there is no .env.

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
// @next/env is CommonJS, so it is required rather than imported by name.
const { loadEnvConfig } = require("@next/env");

function findEnvRoot(start) {
  let directory = start;

  for (let depth = 0; depth < 6; depth += 1) {
    if (existsSync(resolve(directory, ".env"))) return directory;
    const parent = dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }

  return null;
}

const envRoot = findEnvRoot(process.cwd());
if (envRoot) {
  loadEnvConfig(envRoot);
}

const nextBin = require.resolve("next/dist/bin/next");

const result = spawnSync(process.execPath, [nextBin, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
