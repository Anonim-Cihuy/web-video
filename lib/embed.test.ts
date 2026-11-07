import assert from "node:assert/strict";
import { normalizeEmbed, escapeIlike } from "./embed.ts";
import { slugify } from "./slug.ts";

const anon = normalizeEmbed("https://www.anonmp4.to/embed/NLEusIzEvLs3s3B");
assert.equal(anon.source, "anonmp4");
assert.equal(anon.embedUrl, "https://www.anonmp4.to/embed/NLEusIzEvLs3s3B");
assert.equal(anon.thumbnailUrl, "https://www.anonmp4.to/thumbs/NLEusIzEvLs3s3B.webp");

const anonArt = normalizeEmbed("https://anonmp4.art/embed/V8zhoaZh86jEVzR");
assert.equal(anonArt.embedUrl, "https://anonmp4.art/embed/V8zhoaZh86jEVzR");
assert.equal(anonArt.thumbnailUrl, "https://anonmp4.art/thumbs/V8zhoaZh86jEVzR.webp");

const anonWatch = normalizeEmbed("https://anonmp4.to/v/NLEusIzEvLs3s3B");
assert.equal(anonWatch.embedUrl, "https://anonmp4.to/embed/NLEusIzEvLs3s3B");

const rawId = normalizeEmbed("NLEusIzEvLs3s3B", "anonmp4");
assert.equal(rawId.embedUrl, "https://anonmp4.art/embed/NLEusIzEvLs3s3B");

const vdo = normalizeEmbed("https://vdohide.com/embed/abc123");
assert.equal(vdo.source, "vdohide");
assert.equal(vdo.thumbnailUrl, null);

const fembed = normalizeEmbed("https://fembed.co/embed/cQxxxxxxx");
assert.equal(fembed.source, "vdohide");
assert.equal(fembed.embedUrl, "https://fembed.co/embed/cQxxxxxxx");
assert.equal(fembed.thumbnailUrl, null);

for (const bad of [
  "https://evil.com/iframe",
  "http://www.anonmp4.to/embed/NLEusIzEvLs3s3B",
  "javascript:alert(1)",
  "",
  "not-a-url!!!",
]) {
  assert.throws(() => normalizeEmbed(bad));
}
assert.throws(() => normalizeEmbed("SHOULD-BE-VDOHIDE-ID!", "anonmp4"));

assert.equal(escapeIlike("100%_\\"), "100\\%\\_\\\\");
assert.equal(slugify("Judul Video Keren! 2024"), "judul-video-keren-2024");
assert.throws(() => slugify("!!!"));

console.log("self-check OK: embed + slug");
