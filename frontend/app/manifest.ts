import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Airlock — Private, local PDF assistant",
    short_name: "Airlock",
    description:
      "Ask questions about a PDF and get answers grounded in the document, with page citations. Fully local.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#f5375b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
