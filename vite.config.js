import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

function copyIfExists(source, destination) {
  if (!existsSync(source)) return;
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

function copyPublicRuntimeAssets() {
  return {
    name: "copy-public-runtime-assets",
    closeBundle() {
      const outDir = resolve(__dirname, "dist");

      copyIfExists(resolve(__dirname, "content"), resolve(outDir, "content"));
      copyIfExists(resolve(__dirname, "assets/cv"), resolve(outDir, "assets/cv"));
      copyIfExists(resolve(__dirname, "assets/og"), resolve(outDir, "assets/og"));
      copyIfExists(resolve(__dirname, "assets/project-media"), resolve(outDir, "assets/project-media"));

      for (const file of ["robots.txt", "sitemap.xml"]) {
        const source = resolve(__dirname, file);
        if (existsSync(source)) copyFileSync(source, resolve(outDir, file));
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [copyPublicRuntimeAssets()],
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        project: resolve(__dirname, "project.html"),
      },
    },
  },
});
