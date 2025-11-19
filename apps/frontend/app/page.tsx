"use client";

import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setSidebarOpen, toggleTheme } from "@/lib/store/slices/ui-slice";

export default function Home() {
  const dispatch = useAppDispatch();
  const { theme, sidebarOpen } = useAppSelector((state) => state.ui);

  const surfaceClass =
    theme === "dark" ? "bg-slate-900 text-white" : "bg-amber-200 text-slate-900";

  return (
    <div
      className={clsx(
        "flex min-h-screen flex-col items-center justify-center gap-6 transition-colors",
        surfaceClass,
      )}
    >
      <p className="text-xl font-semibold">Hello Next JS application</p>
      <Button variant="outline" onClick={() => dispatch(toggleTheme())}>
        Switch to {theme === "dark" ? "light" : "dark"} theme
      </Button>
      <Button onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}>
        {sidebarOpen ? "Close navigation" : "Open navigation"}
      </Button>
      <p className="text-sm opacity-80">
        Sidebar is{" "}
        <span className="font-medium">{sidebarOpen ? "open" : "closed"}</span>
      </p>
    </div>
  );
}
