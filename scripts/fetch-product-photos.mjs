import { execFile } from "node:child_process";
import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { promisify } from "node:util";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const execFileAsync = promisify(execFile);

const productAssets = [
  {
    key: "tomatoes",
    filename: "tomatoes.webp",
    title: "Ripe tomatoes",
    creator: "Amtsga",
    license: "CC0 1.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Ripe_tomatoes.JPG",
    downloadUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Ripe%20tomatoes.JPG"
  },
  {
    key: "onions",
    filename: "onions.webp",
    title: "Onions Vegetables",
    creator: "Travel Coffee Book",
    license: "CC0",
    sourcePage: "https://stocksnap.io/photo/onions-vegetables-EF15873BBA",
    downloadUrl: "https://cdn.stocksnap.io/img-thumbs/960w/EF15873BBA.jpg"
  },
  {
    key: "spinach",
    filename: "spinach.webp",
    title: "Fresh spinach leaves",
    creator: "Manjil Aryal",
    license: "CC0",
    sourcePage: "https://wordpress.org/photos/photo/12269689cd/",
    downloadUrl: "https://pd.w.org/2026/01/12269689cdfd5dd16.00020454-1536x2048.jpg"
  },
  {
    key: "bananas",
    filename: "bananas.webp",
    title: "Banana Bunch",
    creator: "Anish Sheela",
    license: "CC BY 4.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Banana_Bunch.jpg",
    downloadUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Banana%20Bunch.jpg"
  },
  {
    key: "rice",
    filename: "rice.webp",
    title: "Mushqbudji rice grains close-up",
    creator: "Zahoor Ahmad Reshi",
    license: "CC0 1.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Mushqbudji_rice_grains_close-up.jpg",
    downloadUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Mushqbudji%20rice%20grains%20close-up.jpg"
  },
  {
    key: "beef",
    filename: "beef.webp",
    title: "Close-up of fresh raw beef steak on white background",
    creator: "wuesti",
    license: "CC0",
    sourcePage: "https://www.flickr.com/photos/202782168@N05/54607558273",
    downloadUrl: "https://live.staticflickr.com/65535/54607558273_70e6fd2b94_b.jpg"
  },
  {
    key: "chicken",
    filename: "chicken.webp",
    title: "Whole Chicken with cuts",
    creator: "Miansari66",
    license: "CC0 1.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Whole_Chicken_with_cuts.JPG",
    downloadUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Whole%20Chicken%20with%20cuts.JPG"
  },
  {
    key: "posho",
    filename: "posho.webp",
    title: "Maize flour",
    creator: "Sman099",
    license: "CC0 1.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Maize_flour_or_Maize_flour.jpg",
    downloadUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Maize%20flour%20or%20Maize%20flour.jpg"
  },
  {
    key: "groundnut",
    filename: "groundnut.webp",
    title: "Groundnut paste sold on the streets of Lagos State",
    creator: "Eze kelechi",
    license: "CC0 1.0",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Garden_eggs_Fruits_and_groundnut_paste_Sold_on_the_Streets_of_Lagos_State,_Nigeria_2.jpg",
    downloadUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/File:Garden%20eggs%20Fruits%20and%20groundnut%20paste%20Sold%20on%20the%20Streets%20of%20Lagos%20State%2C%20Nigeria%202.jpg"
  },
  {
    key: "beans",
    filename: "beans.webp",
    title: "Kidney beans marketed Baubau",
    creator: "David E Mead",
    license: "CC0 1.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Kidney_beans_(Phaseolus_vulgaris)_marketed_Baubau.jpg",
    downloadUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/File:Kidney%20beans%20%28Phaseolus%20vulgaris%29%20marketed%20Baubau.jpg"
  },
  {
    key: "cabbage",
    filename: "cabbage.webp",
    title: "Head cabbage",
    creator: "Rawpixel",
    license: "CC0",
    sourcePage: "https://www.rawpixel.com/image/5909450/photo-image-public-domain-food-free",
    downloadUrl:
      "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHgxNjAyMDkzLWltYWdlLWt3dnZsa2JmLmpwZw.jpg"
  },
  {
    key: "carrots",
    filename: "carrots.webp",
    title: "Carrots Vegetables",
    creator: "Irina Blok",
    license: "CC0",
    sourcePage: "https://stocksnap.io/photo/carrots-vegetables-RKHZEX3629",
    downloadUrl: "https://cdn.stocksnap.io/img-thumbs/960w/RKHZEX3629.jpg"
  },
  {
    key: "pineapple",
    filename: "pineapple.webp",
    title: "Pineapple Fruit",
    creator: "Patrycja Tomaszczyk",
    license: "CC0",
    sourcePage: "https://stocksnap.io/photo/pineapple-fruit-X0EC2UF71G",
    downloadUrl: "https://cdn.stocksnap.io/img-thumbs/960w/X0EC2UF71G.jpg"
  },
  {
    key: "cooking-oil",
    filename: "cooking-oil.webp",
    title: "Olive oil vegetables image",
    creator: "Rawpixel",
    license: "CC0",
    sourcePage: "https://www.rawpixel.com/image/5907623/photo-image-public-domain-plant-green",
    downloadUrl:
      "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL3B4NjA0NjEwLWltYWdlLWt3dnZjZ3VoLmpwZw.jpg"
  },
  {
    key: "salt",
    filename: "salt.webp",
    title: "Salt on table",
    creator: "Rawpixel",
    license: "CC0",
    sourcePage: "https://www.rawpixel.com/image/5916313/image-public-domain-table-food",
    downloadUrl:
      "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvbnMxMTUxOS1pbWFnZS1rd3Z3cHRhcy5qcGc.jpg"
  }
];

const marketplaceAssets = [
  {
    key: "home-hero",
    filename: "home-hero.webp",
    title: "Fruit and vegetable stall",
    creator: "Rathfelder",
    license: "CC BY-SA 4.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Fruit_and_vegetable_stall.jpg",
    downloadUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Fruit%20and%20vegetable%20stall.jpg"
  },
  {
    key: "neema-fresh",
    filename: "neema-fresh.webp",
    title: "Fresh vegetable stall",
    creator: "Vardhanjp",
    license: "CC BY-SA 4.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Fresh_vegetable_stall.jpg",
    downloadUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Fresh%20vegetable%20stall.jpg"
  },
  {
    key: "kibuuka-butchery",
    filename: "kibuuka-butchery.webp",
    title: "Harpurhey Market meat stall 2025",
    creator: "Rathfelder",
    license: "CC0 1.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Harpurhey_Market_meat_stall.jpg",
    downloadUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Harpurhey%20Market%20meat%20stall.jpg"
  },
  {
    key: "sunrise-greens",
    filename: "sunrise-greens.webp",
    title: "Bangkok fruit stall",
    creator: "Michael",
    license: "CC0 1.0",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Bangkok_fruit_stall.jpg",
    downloadUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Bangkok%20fruit%20stall.jpg"
  }
];
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadWithRetry(asset, attempt = 0) {
  const response = await fetch(asset.downloadUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 NyanyaMbisi/1.0"
    }
  });

  if (response.ok) {
    return Buffer.from(await response.arrayBuffer());
  }

  if ((response.status === 429 || response.status >= 500) && attempt < 4) {
    const delayMs = 1500 * (attempt + 1);
    console.log(`Retrying ${asset.key} in ${delayMs}ms after ${response.status}...`);
    await wait(delayMs);
    return downloadWithRetry(asset, attempt + 1);
  }

  throw new Error(`Failed to download ${asset.key}: ${response.status} ${response.statusText}`);
}

async function convertToWebp(inputPath, outputPath, options = {}) {
  const args = ["-quiet", "-mt", "-q", String(options.quality ?? 74)];

  if (options.resizeWidth || options.resizeHeight) {
    args.push("-resize", String(options.resizeWidth ?? 0), String(options.resizeHeight ?? 0));
  }

  args.push(inputPath, "-o", outputPath);
  await execFileAsync("cwebp", args);
}

function inferLegacyCandidates(asset, outputDir) {
  const stem = asset.key;
  return [`${stem}.jpg`, `${stem}.jpeg`, `${stem}.png`].map((filename) => path.join(outputDir, filename));
}

async function processAssetGroup({ outputDir, attributionFile, assets, encodingOptions }) {
  await mkdir(outputDir, { recursive: true });

  for (const asset of assets) {
    const targetPath = path.join(outputDir, asset.filename);

    if (await fileExists(targetPath)) {
      console.log(`Skipping ${asset.filename}; already downloaded.`);
      continue;
    }

    const legacySource = (
      await Promise.all(
        inferLegacyCandidates(asset, outputDir).map(async (candidate) => ((await fileExists(candidate)) ? candidate : null))
      )
    ).find(Boolean);

    if (legacySource) {
      await convertToWebp(legacySource, targetPath, encodingOptions);
      console.log(`Converted ${path.basename(legacySource)} -> ${asset.filename}`);
      continue;
    }

    const sourceExt = new URL(asset.downloadUrl).pathname.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] ?? ".jpg";
    const tempPath = path.join(outputDir, `${asset.key}-source${sourceExt.toLowerCase()}`);
    const buffer = await downloadWithRetry(asset);
    await writeFile(tempPath, buffer);
    await convertToWebp(tempPath, targetPath, encodingOptions);
    await rm(tempPath);
    console.log(`Saved ${asset.filename} (${buffer.length} raw bytes)`);
    await wait(450);
  }

  await writeFile(
    attributionFile,
    `${JSON.stringify(
      assets.map(({ key, filename, title, creator, license, sourcePage, downloadUrl }) => ({
        key,
        filename,
        title,
        creator,
        license,
        sourcePage,
        downloadUrl
      })),
      null,
      2
    )}\n`
  );

  console.log(`Wrote attribution manifest to ${attributionFile}`);
}

await processAssetGroup({
  outputDir: path.join(rootDir, "apps/customer-web/public/products"),
  attributionFile: path.join(rootDir, "apps/customer-web/data/product-image-attribution.json"),
  assets: productAssets,
  encodingOptions: {
    quality: 72,
    resizeWidth: 960
  }
});

await processAssetGroup({
  outputDir: path.join(rootDir, "apps/customer-web/public/marketplace"),
  attributionFile: path.join(rootDir, "apps/customer-web/data/marketplace-image-attribution.json"),
  assets: marketplaceAssets,
  encodingOptions: {
    quality: 72,
    resizeWidth: 1440
  }
});
