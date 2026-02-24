"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const FALLBACK_CONVEX_URL = "https://gallant-cormorant-222.convex.cloud";
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || FALLBACK_CONVEX_URL;
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
