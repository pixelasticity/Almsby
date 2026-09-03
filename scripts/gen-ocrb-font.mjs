/**
 * One-time generator: embeds lib/gs1/fonts/OCR-B.ttf as a base64 TypeScript
 * module so the font is bundler-traced (works identically on Vercel serverless,
 * locally, and in the browser — no fs, no public/ runtime-read trap).
 *
 * Usage:  node scripts/gen-ocrb-font.mjs
 * Re-run whenever lib/gs1/fonts/OCR-B.ttf changes. Do not hand-edit the output.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ttfPath = join(root, "lib/gs1/fonts/OCR-B.ttf");
const outPath = join(root, "lib/gs1/ocrb-font.ts");

const ttf = readFileSync(ttfPath);
const b64 = ttf.toString("base64");

const banner = `/**
 * OCR-B font, embedded as base64 for bwip-js HRI rendering (#9).
 *
 * GENERATED from lib/gs1/fonts/OCR-B.ttf by scripts/gen-ocrb-font.mjs —
 * do not hand-edit. Source: Raisty's OCR-B revival, SIL Open Font License 1.1
 * (see lib/gs1/fonts/LICENSE.md). Registered via loadFont("OCR-B", 100, bytes).
 */
`;

const body = `${banner}export const OCRB_TTF_BASE64 = "${b64}";
`;

writeFileSync(outPath, body);
console.log(`[gen-ocrb-font] wrote ${outPath} (${(body.length / 1024).toFixed(1)} KB from a ${(ttf.length / 1024).toFixed(1)} KB TTF)`);
