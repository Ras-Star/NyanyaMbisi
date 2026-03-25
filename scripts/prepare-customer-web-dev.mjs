import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const appNuxtDir = resolve(rootDir, "apps/customer-web/.nuxt");
const devDir = resolve(appNuxtDir, "dev");
const cacheDir = resolve(appNuxtDir, "cache");

await rm(devDir, { recursive: true, force: true });
await rm(cacheDir, { recursive: true, force: true });
