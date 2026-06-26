import type { MetadataRoute } from "next";

/**
 * PWA manifest foundation. The service worker and offline strategy are
 * hardened in Stage 15; this establishes installability metadata.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "3F Enterprises — Inventory, Sales & Accounting",
    short_name: "3F Enterprises",
    description:
      "Multi-branch inventory, sales and accounting for 3F Enterprises",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
