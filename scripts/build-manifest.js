#!/usr/bin/env node
// Scans the repo root for chapter folders and writes manifest.json describing them.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const CHAPTER_RE = /^chapter\s*(\d+)/i;

function extractTitle(html) {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1].trim() : null;
}

function humanize(folderName) {
  return folderName.replace(/\s+/g, " ").trim();
}

const entries = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => {
    const match = d.name.match(CHAPTER_RE);
    if (!match) return null;

    const dirPath = path.join(root, d.name);
    const htmlFile = fs
      .readdirSync(dirPath)
      .find((f) => f.toLowerCase().endsWith(".html"));
    if (!htmlFile) return null;

    const html = fs.readFileSync(path.join(dirPath, htmlFile), "utf8");
    const title = extractTitle(html) || humanize(d.name);

    return {
      folder: d.name,
      file: htmlFile,
      title,
      number: parseInt(match[1], 10),
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.number - b.number);

fs.writeFileSync(
  path.join(root, "manifest.json"),
  JSON.stringify(entries, null, 2) + "\n"
);

console.log(`Wrote manifest.json with ${entries.length} chapter(s).`);
