"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

// Lazy-load the heavy HomePage component and show a loader meanwhile
const HomePage = dynamic(() => import("@/components/common/LandingPage/HomePage"), {
  // Disable SSR to avoid shipping large payload in first paint; remove if SEO is critical
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="relative flex items-center justify-center">
        <Spinner className="size-32 text-purple-500" />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-light font-geist tracking-widest">SIMPLX</span>
      </div>
    </div>
  ),
});

export default function Home() {
  return <HomePage />;
}
