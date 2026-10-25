import type { NextConfig } from "next";

// Set by the GitHub Pages workflow (e.g. "/socle"): the site is then exported as static
// files served under that sub-path. Local dev and Vercel leave it empty.
const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(pagesBasePath && {
    output: "export",
    basePath: pagesBasePath,
    trailingSlash: true,
  }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
