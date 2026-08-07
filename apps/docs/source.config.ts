import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
  meta: {
    files: ["**/meta.json"],
  },
});

export default defineConfig();
