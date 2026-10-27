// Uploads every source image in apps/portfolio/public/images to Silos and
// records the CDN URL in an asset manifest. The manifest is what the seed uses;
// the app itself never reads a local file.
//
// Usage (from the repo root):
//   npm run assets:upload

import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";

const ROOT = process.cwd();
const SOURCE_DIR = process.env.ASSET_SOURCE_DIR
  ? path.resolve(ROOT, process.env.ASSET_SOURCE_DIR)
  : path.join(ROOT, "apps/portfolio/public/images");
const MANIFEST_PATH = path.join(
  ROOT,
  "packages/db/prisma/seed/assets.manifest.json",
);

const SILOS_URL = process.env.SILOS_API_URL?.replace(/\/$/, "");
const SILOS_KEY = process.env.SILOS_API_KEY;

if (!SILOS_URL || !SILOS_KEY) {
  console.error("Missing SILOS_API_URL or SILOS_API_KEY.");
  process.exit(1);
}

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

async function walk(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...(await walk(path.join(dir, entry.name), relative)));
      continue;
    }

    if (MIME[path.extname(entry.name).toLowerCase()]) {
      files.push(relative);
    }
  }

  return files.sort();
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch {
    return { generatedAt: null, files: {} };
  }
}

async function saveManifest(manifest) {
  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function uploadOne(relative) {
  const absolute = path.join(SOURCE_DIR, relative);
  const buffer = await readFile(absolute);
  const filename = path.basename(relative);
  const mimeType = MIME[path.extname(filename).toLowerCase()];
  const folder = path.dirname(relative) === "." ? "" : path.dirname(relative);

  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType }), filename);

  const response = await fetch(`${SILOS_URL}/api/v1/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SILOS_KEY}` },
    body: form,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(
      `Upload failed for ${relative}: ${payload?.message ?? response.statusText
      }`,
    );
  }

  let dimensions = {};
  try {
    const size = imageSize(buffer);
    dimensions = { width: size.width ?? null, height: size.height ?? null };
  } catch {
    dimensions = { width: null, height: null };
  }

  return {
    silosFileId: payload.data.id,
    filename: payload.data.filename,
    originalName: relative,
    mimeType,
    size: payload.data.size ?? (await stat(absolute)).size,
    url: payload.data.url,
    folder,
    kind: filename.endsWith(".svg") ? "icon" : "image",
    ...dimensions,
  };
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(
      `Source folder not found: ${path.relative(ROOT, SOURCE_DIR)}\n` +
      "Set ASSET_SOURCE_DIR to a folder of images, or point it at the original assets.",
    );
    process.exit(1);
  }

  const manifest = await loadManifest();
  const files = await walk(SOURCE_DIR);
  let uploaded = 0;

  for (const relative of files) {
    if (manifest.files[relative]?.url) {
      continue;
    }

    process.stdout.write(`→ ${relative} ... `);
    const record = await uploadOne(relative);
    manifest.files[relative] = record;
    manifest.generatedAt = new Date().toISOString();
    await saveManifest(manifest);
    uploaded += 1;
    console.log(record.url);
  }

  console.log(
    uploaded === 0
      ? `Nothing to upload. ${Object.keys(manifest.files).length} assets already in Silos.`
      : `Uploaded ${uploaded} asset(s). Manifest: ${path.relative(
        ROOT,
        MANIFEST_PATH,
      )}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
