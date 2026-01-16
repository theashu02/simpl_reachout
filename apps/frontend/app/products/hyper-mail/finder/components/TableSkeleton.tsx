"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SKELETON_ROWS = 8;

function Shimmer() {
  return <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />;
}

function SkeletonCell({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative overflow-hidden rounded bg-muted", className)} {...props}>
      <Shimmer />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full h-full flex flex-col font-dmsans gap-2">
      {/* Header info skeleton */}
      <div className="flex items-center gap-3 px-1">
        <SkeletonCell className="h-5 w-20" />
        <SkeletonCell className="h-4 w-28" />
      </div>

      {/* ---------------- MOBILE (Cards) ---------------- */}
      <div className="sm:hidden space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-md p-3 flex items-center gap-3">
            <SkeletonCell className="h-10 w-10 rounded-sm shrink-0" />

            <div className="flex-1 space-y-2">
              <SkeletonCell className="h-4 w-3/4" />
              <SkeletonCell className="h-3 w-1/2" />
            </div>

            <SkeletonCell className="h-6 w-6 rounded-sm shrink-0" />
          </div>
        ))}
      </div>

      {/* ---------------- TABLE (Tablet + Desktop) ---------------- */}
      <div className="hidden sm:flex flex-1 min-h-0 rounded-md border overflow-hidden">
        <div className="relative w-full h-full overflow-x-auto overflow-y-auto">
          <table className="min-w-[720px] w-full text-sm">
            {/* Header */}
            <TableHeader className="sticky top-0 z-20 bg-background">
              <TableRow className="border-b">
                <TableHead className="w-12 text-center">
                  <SkeletonCell className="h-4 w-4 mx-auto" />
                </TableHead>

                <TableHead>
                  <div className="flex items-center gap-2">
                    <SkeletonCell className="h-4 w-20" />
                    <SkeletonCell className="h-3 w-3" />
                  </div>
                </TableHead>

                <TableHead className="hidden sm:table-cell">
                  <SkeletonCell className="h-4 w-16" />
                </TableHead>

                <TableHead>
                  <SkeletonCell className="h-4 w-14" />
                </TableHead>

                <TableHead className="hidden md:table-cell">
                  <SkeletonCell className="h-4 w-12" />
                </TableHead>

                <TableHead className="hidden lg:table-cell">
                  <SkeletonCell className="h-4 w-12" />
                </TableHead>

                <TableHead className="w-10 text-center">
                  <SkeletonCell className="h-4 w-4 mx-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody>
              {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className={cn("border-b h-12", rowIndex % 2 === 0 && "bg-muted/20")}>
                  {/* Logo */}
                  <TableCell className="text-center">
                    <SkeletonCell className="h-9 w-9 mx-auto rounded-sm" />
                  </TableCell>

                  {/* Company */}
                  <TableCell>
                    <SkeletonCell className="h-4 w-40 max-w-full" />
                  </TableCell>

                  {/* Domain */}
                  <TableCell className="hidden sm:table-cell">
                    <SkeletonCell className="h-4 w-24" />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <SkeletonCell className="h-6 w-16 rounded-full" />
                  </TableCell>

                  {/* Confidence */}
                  <TableCell className="hidden md:table-cell">
                    <SkeletonCell className="h-4 w-10" />
                  </TableCell>

                  {/* Source */}
                  <TableCell className="hidden lg:table-cell">
                    <SkeletonCell className="h-4 w-8" />
                  </TableCell>

                  {/* LinkedIn */}
                  <TableCell className="text-center">
                    <SkeletonCell className="h-6 w-6 mx-auto rounded-sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex justify-center">
        <SkeletonCell className="h-3 w-32" />
      </div>
    </div>
  );
}
