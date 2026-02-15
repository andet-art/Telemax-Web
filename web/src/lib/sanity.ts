// src/lib/sanity.ts
import { createClient } from "@sanity/client";

export const sanity = createClient({
  projectId: "sig43rnu",
  dataset: "production",
  apiVersion: "2023-08-04", // or "2023-01-01"
  useCdn: true,
});
