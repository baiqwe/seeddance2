const fs = require("fs");
const path = require("path");
const Replicate = require("replicate");

const MODEL_VERSION = "d71e2df08d6ef4c4fb6d3773e9e557de6312e04444940dbb81fd73366ed83941";
const DEFAULT_SOURCE = "public/images/gallery/hero-before.jpg";

const STYLE_PROMPTS = {
  standard:
    "Transform this reference into a polished modern anime portrait with clean linework, expressive eyes, balanced flat shading, and crisp facial rendering. Keep the subject easy to read and suitable for a profile picture.",
  ghibli:
    "Transform this reference into a warm hand-drawn animation portrait with soft watercolor backgrounds, gentle natural lighting, painterly textures, nostalgic atmosphere, and storybook charm. Keep the subject composition readable.",
  cyberpunk:
    "Transform this reference into a futuristic cyberpunk anime portrait with neon rim lighting, saturated magenta and cyan highlights, dramatic night-city atmosphere, sleek stylization, and high-contrast shadows.",
  retro_90s:
    "Transform this reference into a retro 1990s anime cel illustration with softened linework, faded pastel palette, VHS-era texture, muted contrast, and nostalgic television-anime mood.",
  webtoon:
    "Transform this reference into a clean Korean webtoon illustration with sleek manhwa aesthetics, sharp facial structure, controlled gradients, glossy rendering, and elegant modern character styling.",
  cosplay:
    "Transform this reference into a polished anime poster redraw with cleaner linework, stronger costume presence, expressive rendering, and convention-poster energy.",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readToken() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env file");
  }

  const env = fs.readFileSync(envPath, "utf8");
  const match = env.match(/^REPLICATE_API_TOKEN=(.+)$/m);
  if (!match || !match[1].trim()) {
    throw new Error("Missing REPLICATE_API_TOKEN in .env");
  }

  return match[1].trim();
}

function extractOutputUrl(output) {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && typeof first.url === "function") {
      return first.url().toString();
    }
  }
  if (output && typeof output === "object" && typeof output.url === "function") {
    return output.url().toString();
  }
  return null;
}

async function createRemoteFile(replicate, absoluteInputPath) {
  const mimeType = absoluteInputPath.endsWith(".png") ? "image/png" : "image/jpeg";
  const blob = new Blob([fs.readFileSync(absoluteInputPath)], { type: mimeType });
  const uploaded = await replicate.files.create(blob);
  return uploaded.urls.get;
}

async function generateOne(token, sourceUrl, style, prompt, outDir) {
  const outPath = path.join(outDir, `${style}.jpg`);
  if (fs.existsSync(outPath)) {
    console.log(`skip ${style} (already exists)`);
    return;
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          version: MODEL_VERSION,
          input: {
            image_input: [sourceUrl],
            prompt,
            aspect_ratio: "match_input_image",
            resolution: "2K",
            output_format: "jpg",
            safety_filter_level: "block_only_high",
          },
        }),
      });

      const text = await predictionResponse.text();
      if (!predictionResponse.ok) {
        throw new Error(`Replicate ${style} failed: ${predictionResponse.status} ${text}`);
      }

      const prediction = JSON.parse(text);
      const outputUrl = extractOutputUrl(prediction.output);
      if (!outputUrl) {
        throw new Error(`Replicate ${style} returned no image URL`);
      }

      const imageResponse = await fetch(outputUrl);
      if (!imageResponse.ok) {
        throw new Error(`Download failed for ${style}: ${imageResponse.status}`);
      }

      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      fs.writeFileSync(outPath, buffer);
      console.log(`saved ${outPath}`);
      return;
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }
      console.warn(`retry ${style} (${attempt}/3)`);
      await sleep(1500 * attempt);
    }
  }
}

async function main() {
  const token = readToken();
  const replicate = new Replicate({
    auth: token,
    fileEncodingStrategy: "data-uri",
  });

  const sourceArg = process.argv[2] || DEFAULT_SOURCE;
  const absoluteInputPath = path.isAbsolute(sourceArg) ? sourceArg : path.join(process.cwd(), sourceArg);
  if (!fs.existsSync(absoluteInputPath)) {
    throw new Error(`Source image not found: ${absoluteInputPath}`);
  }

  const outDir = path.join(process.cwd(), "public/images/gallery/generated");
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`uploading source ${absoluteInputPath}`);
  const sourceUrl = await createRemoteFile(replicate, absoluteInputPath);

  for (const [style, prompt] of Object.entries(STYLE_PROMPTS)) {
    console.log(`generating ${style}...`);
    await generateOne(token, sourceUrl, style, prompt, outDir);
  }

  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
