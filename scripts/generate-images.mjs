/**
 * Build-time image pipeline (AI generation).
 *
 * Generates site photography with Google's nano-banana image model via
 * OpenRouter, writes the files into `public/images/`, records them in
 * `scripts/images.manifest.json`, and renders the typed manifest at
 * `src/lib/images.ts`.
 *
 * Running at build time (rather than in a Server Component) keeps the API key
 * out of the bundle, lets next/image optimise local files, and removes a
 * runtime dependency. Nothing here ships to production: the artwork is already
 * committed under `public/images/` and `.vercelignore` keeps this directory out
 * of deployments.
 *
 * The OpenRouter key is deliberately no longer kept in `.env`, because the set
 * is finished and a stored key is a standing liability. Supply one for the
 * length of a single run if a slot ever has to be redrawn:
 *
 *   OPENROUTER_API=sk-or-... npm run images -- serviceWeb
 *
 * Usage:
 *   npm run images            regenerate every slot
 *   npm run images -- capabilityAi serviceWeb    regenerate only those slots
 *
 * The manifest is merged, not replaced, so regenerating one slot leaves the
 * others untouched.
 *
 * The model returns PNG, but the site ships WebP — the artwork is dark 3D
 * render, which WebP carries at roughly a twentieth of the PNG size with no
 * visible difference. Each slot is therefore encoded through ffmpeg on the way
 * into `public/images/`, and the PNG master is kept in `source-assets/`.
 */

import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const ROOT = path.resolve(import.meta.dirname, "..");
const IMAGE_DIR = path.join(ROOT, "public", "images");
const PREVIEW_DIR = path.join(IMAGE_DIR, "previews");
const SOURCE_DIR = path.join(ROOT, "source-assets");
const MANIFEST_JSON = path.join(ROOT, "scripts", "images.manifest.json");
const MANIFEST_TS = path.join(ROOT, "src", "lib", "images.ts");

const MODEL = "google/gemini-2.5-flash-image"; // "nano-banana"
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Shared art direction. Every prompt inherits it so the set reads as one
 * commission rather than seven unrelated stock shots. Values mirror the frozen
 * brand tokens in design-system/MASTER.md.
 */
const ART_DIRECTION = `
Art direction, applies to the whole image. Match it exactly, because these
images sit next to each other on one page and must read as a single set:

- Polished 3D render, cinematic product-visualisation quality. Glossy glass,
  brushed metal and dark acrylic surfaces with crisp reflections. Not a
  photograph, not flat vector art, not a painting.
- Background: a deep navy-to-black field over a dark circuit-board plane, with
  fine etched traces receding into soft focus and small bokeh light points.
- Colour: exactly two accents and nothing else. Electric blue (#1E7BFF through
  #57D5FF) carries the majority, warm amber gold (#FFB020) is the secondary and
  appears on roughly a quarter of the lit elements. No purple, magenta, pink,
  green, red or teal-green anywhere.
- A single hero object sits centred in the upper two thirds of the frame,
  floating or raised above the circuit plane, lit from within.
- Supporting elements are rounded-square tiles with thin neon line icons on
  them, orbiting the hero object and joined to it by thin glowing connector
  paths with small light nodes along them.
- Low three-quarter or gentle isometric camera angle looking slightly down.
  Strong volumetric glow, light bloom, shallow depth of field at the edges.
- The bottom of the frame falls away into near-black, because a heading and a
  paragraph are overlaid there.
- No text, no letters, no numbers, no words, no labels, no logos, no
  watermarks, no readable UI. Icons must be wordless pictograms only.
- No people, no faces, no hands.
- Premium, confident, high-gloss enterprise technology.
`.trim();

/**
 * One entry per image slot in the UI.
 *
 * `provided` names a file in `source-assets/` that the client supplied; those
 * slots are copied rather than generated, so a full run never overwrites
 * hand-picked artwork. Everything else is generated to match them.
 */
const SLOTS = [
  {
    id: "capabilityAi",
    provided: "capabilityAi.png",
    alt: "A glowing neural network brain rising from a processor on a circuit board",
  },
  {
    id: "capabilityAutomation",
    provided: "capabilityAutomation.png",
    alt: "A central gear linked by glowing paths to icons for data, mail, reporting and cloud services",
  },
  {
    // Pairs with the "Architecture first" caption. The earlier artwork for this
    // slot was a vertical infographic with its copy baked into the pixels,
    // which forced the frame portrait and was unreadable on a phone. The copy
    // belongs in the DOM, so this slot is decorative only.
    id: "approach",
    aspect: "4:3",
    alt: "A layered system architecture rendered as glowing tiers above a circuit board",
    subject: `A precise multi-tier structure of translucent dark blue glass
platforms stacked in receding steps above the circuit plane, read as a system
architecture built in three dimensions. Thin glowing blue lines run vertically
between the tiers and horizontally along each level, with small bright nodes at
every junction. The lowest plane carries a faint etched blueprint grid. One tier
edge and two connector runs glow amber gold. The structure occupies the upper
two thirds and the base dissolves into black.`,
  },
  {
    id: "serviceWeb",
    aspect: "3:2",
    alt: "A glowing browser window floating above a circuit board",
    subject: `A single glossy browser window rendered as a floating pane of dark
glass, raised above the circuit plane and lit with electric blue edge light. Two
thinner page panels hover behind it, slightly offset, suggesting depth and
layout. Small rounded tiles carrying wordless pictograms for speed, search and
responsive layout orbit the main pane, joined to it by thin glowing connector
lines. Amber gold picks out one connector and one tile.`,
  },
  {
    id: "serviceApps",
    aspect: "3:2",
    alt: "Interlocking application panels connected above a circuit board",
    subject: `Several modular dark-glass application panels of different sizes
locked together into one floating structure above the circuit plane, like a
dashboard exploded into layers. Blue light runs along the seams between panels.
Small rounded tiles with wordless pictograms for database, users and sync orbit
the structure on thin glowing connectors. One panel edge and one connector glow
amber gold.`,
  },
  {
    id: "serviceDesign",
    aspect: "3:2",
    alt: "Design layers rising from wireframe to finished interface",
    subject: `A stack of four translucent interface layers floating one above
the other above the circuit plane, the lowest a bare blue wireframe grid and
each layer above it more finished and solid, the top one a polished dark glass
screen. Thin light beams connect the layers vertically. A glowing stylus tip
hovers near the top layer. Amber gold marks the top layer's edge and the
stylus.`,
  },
  {
    id: "contact",
    aspect: "3:2",
    alt: "A glowing globe of connected nodes above a circuit board",
    subject: `A wireframe globe built from thin glowing blue lines and small
light nodes, floating above the circuit plane and rendered in dark glass. Curved
connector arcs spring from its surface and reach outward. Small rounded tiles
carrying wordless pictograms for message, signal and location orbit the globe on
thin glowing connectors. Amber gold lights two of the arcs.`,
  },
];

function buildPrompt(slot, subject = slot.subject) {
  return `Generate a single ${slot.aspect} landscape-format 3D rendered illustration for a premium dark-themed B2B technology website.

Subject:
${subject.replace(/\s+/g, " ").trim()}

${ART_DIRECTION}`;
}

function readApiKey() {
  const key = process.env.OPENROUTER_API?.trim();
  if (!key) {
    throw new Error(
      "OPENROUTER_API is not set. Pass it for this run only, e.g.\n" +
        "  OPENROUTER_API=sk-or-... npm run images -- serviceWeb\n" +
        "Do not add it back to .env.",
    );
  }
  return key;
}

/**
 * Ask the model for one image. `image_config` is only honoured by some image
 * models, so a 400 that names it falls back to a plain request.
 */
async function generate(key, slot, { withImageConfig = true, subject } = {}) {
  const body = {
    model: MODEL,
    modalities: ["image", "text"],
    messages: [{ role: "user", content: buildPrompt(slot, subject) }],
  };
  if (withImageConfig) {
    body.image_config = { aspect_ratio: slot.aspect };
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://dragmolabs.com",
      "X-Title": "Dragmo Labs site",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    if (withImageConfig && response.status === 400 && /image_config|aspect/i.test(text)) {
      return generate(key, slot, { withImageConfig: false, subject });
    }
    throw new Error(`OpenRouter ${response.status}: ${text.slice(0, 400)}`);
  }

  const data = JSON.parse(text);
  if (data.error) throw new Error(data.error.message ?? JSON.stringify(data.error));

  const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) {
    throw new Error(`No image in response: ${text.slice(0, 400)}`);
  }
  return parseDataUrl(url);
}

function parseDataUrl(url) {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(url);
  if (!match) throw new Error(`Unexpected image payload: ${url.slice(0, 80)}`);
  return { mime: match[1].toLowerCase(), buffer: Buffer.from(match[2], "base64") };
}

/** Minimal PNG/JPEG header reader; avoids pulling in an image dependency. */
function readDimensions(buffer) {
  if (buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 9) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      // SOF0..SOF15, excluding the DHT/JPG/DAC markers interleaved in that range.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }

  throw new Error("Could not read image dimensions");
}

const EXTENSIONS = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/**
 * Encodes the master into the WebP the site actually serves. Quality 88 is the
 * point where these renders stop shedding anything visible; below it the smooth
 * dark gradients start to band.
 *
 * Returns false when ffmpeg is not installed, so a run on a machine without it
 * still produces working artwork rather than failing outright.
 */
async function encodeWebp(from, to) {
  try {
    await run("ffmpeg", [
      "-y", "-v", "error",
      "-i", from,
      "-c:v", "libwebp",
      "-quality", "88",
      "-compression_level", "6",
      "-preset", "picture",
      to,
    ]);
    return true;
  } catch (error) {
    console.warn(`  warn  webp encode unavailable (${error.code ?? error.message})`);
    return false;
  }
}

function renderManifest(manifest) {
  const body = Object.entries(manifest)
    .map(
      ([id, entry]) => `  ${id}: {
    src: "/images/${entry.file}",
    width: ${entry.width},
    height: ${entry.height},
    alt: ${JSON.stringify(entry.alt)},
    generated: ${entry.source === "openrouter"},
  },`,
    )
    .join("\n");

  return `// Generated by scripts/generate-images.mjs. Do not edit by hand.
// Imagery generated with google/gemini-2.5-flash-image via OpenRouter, then
// encoded to WebP for delivery. The PNG masters live in \`source-assets/\`.

export type SiteImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  generated: boolean;
};

export const images = {
${body}
} satisfies Record<string, SiteImage>;

export type ImageId = keyof typeof images;
`;
}

/**
 * Render every alternate concept for a slot into `public/images/previews/`
 * without touching either manifest, so directions can be compared before one
 * is promoted to the live image.
 */
async function runPreview(key, slots) {
  await mkdir(PREVIEW_DIR, { recursive: true });

  for (const slot of slots) {
    const concepts = slot.concepts ?? [{ name: "primary", subject: slot.subject }];
    for (const concept of concepts) {
      try {
        console.log(`  gen   ${slot.id}-${concept.name} ...`);
        const { mime, buffer } = await generate(key, slot, { subject: concept.subject });
        const extension = EXTENSIONS[mime];
        if (!extension) throw new Error(`Unsupported image type ${mime}`);

        const file = `${slot.id}-${concept.name}.${extension}`;
        await writeFile(path.join(PREVIEW_DIR, file), buffer);
        const { width, height } = readDimensions(buffer);
        console.log(`  ok    previews/${file}  ${width}x${height}`);
      } catch (error) {
        console.warn(`  FAIL  ${slot.id}-${concept.name}: ${error.message}`);
        process.exitCode = 1;
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const preview = args.includes("--preview");
  const requested = args.filter((arg) => !arg.startsWith("-"));
  const slots = requested.length
    ? SLOTS.filter((slot) => requested.includes(slot.id))
    : SLOTS;

  if (slots.length === 0) {
    throw new Error(
      `No matching slots. Known ids: ${SLOTS.map((s) => s.id).join(", ")}`,
    );
  }

  const key = readApiKey();

  if (preview) {
    return runPreview(key, slots);
  }

  await mkdir(IMAGE_DIR, { recursive: true });

  const manifest = JSON.parse(await readFile(MANIFEST_JSON, "utf8").catch(() => "{}"));
  const failed = [];

  for (const slot of slots) {
    try {
      let buffer;
      let extension;
      let master;

      if (slot.provided) {
        console.log(`  copy  ${slot.id} <- source-assets/${slot.provided}`);
        master = path.join(SOURCE_DIR, slot.provided);
        buffer = await readFile(master);
        extension = path.extname(slot.provided).slice(1).toLowerCase();
      } else {
        console.log(`  gen   ${slot.id} ...`);
        const result = await generate(key, slot);
        extension = EXTENSIONS[result.mime];
        if (!extension) throw new Error(`Unsupported image type ${result.mime}`);
        buffer = result.buffer;

        // The master is kept out of public/, so the deployed bundle carries
        // only the WebP and the original stays available for a re-encode.
        master = path.join(SOURCE_DIR, `${slot.id}.${extension}`);
        await writeFile(master, buffer);
      }

      let file = `${slot.id}.webp`;
      if (!(await encodeWebp(master, path.join(IMAGE_DIR, file)))) {
        file = `${slot.id}.${extension}`;
        await writeFile(path.join(IMAGE_DIR, file), buffer);
      }

      const { width, height } = readDimensions(buffer);
      manifest[slot.id] = {
        file,
        width,
        height,
        alt: slot.alt,
        ...(slot.provided
          ? { source: "provided" }
          : { source: "openrouter", model: MODEL }),
      };
      console.log(`  ok    ${slot.id}  ${width}x${height}  ${(buffer.length / 1024) | 0} KB`);
    } catch (error) {
      failed.push({ id: slot.id, reason: error.message });
      console.warn(`  FAIL  ${slot.id}: ${error.message}`);
    }
  }

  await writeFile(MANIFEST_JSON, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(MANIFEST_TS, renderManifest(manifest), "utf8");
  console.log(`\nWrote ${Object.keys(manifest).length} entries to src/lib/images.ts`);

  if (failed.length > 0) {
    console.warn(`\n${failed.length} slot(s) failed and kept their previous image:`);
    for (const f of failed) console.warn(`  - ${f.id}: ${f.reason}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`\ngenerate-images failed: ${error.message}`);
  process.exit(1);
});
