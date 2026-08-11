import type { MetadataRoute } from "next";

const siteUrl = "https://chord2midi.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1.0 },
    { url: `${siteUrl}/guide`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
