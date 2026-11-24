// "Post the Meme, Win the Feed" entry - make.fun program/v1 (Node 22, stdlib only).
// The entry is a picture meme about make.fun, posted on X with @_myronera and a
// play code in its own text; this program hands the post in by copying POST.json
// ({"url": "https://x.com/<handle>/status/<id>"}) from the repository root to
// /output/POST.json, where the gate reads it. Nothing this program writes about
// the post is scored: the house reads the post itself through FxTwitter.
//
// Outside the grader container MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in
// for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });

// Fail early with a clear message when POST.json is still the starter
// placeholder or does not parse: a post address is required for a valid entry.
const postPath = join(BOT_DIR, 'POST.json');
let raw: string;
try {
  raw = readFileSync(postPath, 'utf8');
} catch (err) {
  console.error(`POST.json is missing from ${BOT_DIR}`);
  process.exit(1);
}

let post: { url?: string };
try {
  post = JSON.parse(raw);
} catch {
  console.error('POST.json is not valid JSON');
  process.exit(1);
}

// The address shape follows the rules: x.com or twitter.com, optional
// www./mobile., digits-only status id, no query or fragment.
const url = post.url ?? '';
if (!/^https:\/\/(www\.|mobile\.)?(x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+$/.test(url)) {
  console.error('POST.json does not hold a valid X post address yet');
  process.exit(1);
}

try {
  copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`could not write POST.json to ${OUTPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

console.log(`handed in post ${url}`);
