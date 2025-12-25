'use client'

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 768px)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(MOBILE_QUERY).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(MOBILE_QUERY);


    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Modern browsers
    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
}
