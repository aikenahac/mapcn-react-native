import { docs } from "collections/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

export function getPages() {
  return source.getPages();
}

export function getPage(slug?: string[]) {
  return source.getPage(slug);
}

export function getPageTree() {
  return source.getPageTree();
}
