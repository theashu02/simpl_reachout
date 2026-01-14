"use client";

import * as React from "react";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender, Row } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2, ArrowUpDown, ArrowUp, ArrowDown, Link2Off } from "lucide-react";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import EmptyCompanyState from "./EmptyCompanyState";
import { LinkedinLogo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { CompanyResult, VirtualizedCompanyTableProps } from "./types";
import CompanyDetailModal from "./CompanyDetailModal";

const ROW_HEIGHT = 48; // Increased slightly for better click targets
const FETCH_THRESHOLD = 3;

const columns: ColumnDef<CompanyResult>[] = [
  {
    accessorKey: "logo_url",
    header: "",
    cell: ({ row }) => <Image src={row.original.logo_url || "/images/company-fallback.png"} alt={row.original.company_name} width={36} height={36} unoptimized className="h-9 w-9 object-contain rounded-sm" />,
    size: 48,
  },
  {
    accessorKey: "company_name",
    header: "Company",
    cell: ({ row }) => <span className="font-medium text-foreground truncate block">{row.original.company_name || "Unknown"}</span>,
    size: 180,
  },
  {
    accessorKey: "domain",
    header: "Domain",
    cell: ({ row }) => {
      const domain = row.original.domain;
      return domain ? (
        <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate block">
          {domain}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
    size: 160,
  },
  {
    accessorKey: "verified",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.verified ? "default" : "secondary"} className="text-xs px-2 py-0.5">
        {row.original.verified ? "Verified" : "Unverified"}
      </Badge>
    ),
    size: 90,
  },
  {
    accessorKey: "confidence",
    header: "confidence",
    cell: ({ row }) => <span className="text-xs text-muted-foreground tabular-nums">{typeof row.original.confidence === "number" ? `${row.original.confidence}%` : "—"}</span>,
    size: 60,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => <span className="text-xs text-muted-foreground uppercase">{row.original.source || "—"}</span>,
    size: 70,
  },
  {
    accessorKey: "linkedin_url",
    header: "Linkedin",
    cell: ({ row }) =>
      row.original.linkedin_url ? (
        <Link href={row.original.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-10 w-10">
          <Image src={LinkedinLogo} alt="LinkedIn" width={24} height={24} className="h-6 w-6 hover:opacity-80 rounded-sm" />
        </Link>
      ) : (
        <Link href="#" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-10 w-10">
          <Link2Off className="text-accent-foreground h-4 w-4" />
        </Link>
      ),
    size: 40,
  },
];

function VirtualizedCompanyTable({ data, hasMore, isFetchingNextPage, fetchNextPage, total, sortOrder = "asc", onSortToggle }: VirtualizedCompanyTableProps) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedCompany, setSelectedCompany] = React.useState<CompanyResult | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Always include index to guarantee unique keys, even during optimistic updates
    getRowId: (row, index) => `${row.domain ?? row.company_name}-${index}`,
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20, // Increased overscan for smoother scrolling
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // Infinite scroll trigger
  React.useEffect(() => {
    if (!virtualItems.length || !hasMore || isFetchingNextPage) return;

    const lastVisibleIndex = virtualItems[virtualItems.length - 1].index;
    const distanceFromEnd = rows.length - 1 - lastVisibleIndex;

    if (distanceFromEnd <= FETCH_THRESHOLD) {
      fetchNextPage();
    }
  }, [virtualItems, rows.length, hasMore, isFetchingNextPage, fetchNextPage]);

  if (data.length === 0) {
    return (
      <div className="flex-1 flex border-none min-h-0 h-full">
        <EmptyCompanyState />
      </div>
    );
  }

  const paddingTop = virtualItems[0]?.start ?? 0;
  const paddingBottom = totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0);

  const SortIcon = sortOrder === "asc" ? ArrowUp : sortOrder === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <div className="w-full h-full flex flex-col font-dmsans">
      {/* Header Info */}
      <div className="flex items-center mb-2 px-1 text-sm gap-2">
        <span className="font-medium text-foreground">Companies</span>
        <span className="text-muted-foreground text-xs">
          {data.length} of {total ?? data.length}
          {hasMore && "+"}
        </span>
      </div>

      {/* Table Container */}
      <div className="rounded-md border overflow-hidden flex-1 flex flex-col min-h-0">
        <div ref={tableContainerRef} className="h-full overflow-auto relative scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <table className="w-full caption-bottom text-sm table-fixed">
            <TableHeader className="sticky top-0 z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                  {headerGroup.headers.map((header) => {
                    const isCompanyColumn = header.column.id === "company_name";
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() }} // Explicit width is required for table-fixed
                        className={`h-10 text-xs font-medium text-muted-foreground bg-white ${isCompanyColumn && onSortToggle ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                        onClick={isCompanyColumn && onSortToggle ? onSortToggle : undefined}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1 truncate">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {isCompanyColumn && onSortToggle && <SortIcon className="h-3 w-3" />}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {/* Virtual Top Padding Spacer */}
              {paddingTop > 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ height: paddingTop }} />
                </tr>
              )}

              {/* Render Virtual Rows */}
              {virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<CompanyResult>;
                const isEven = virtualRow.index % 2 === 0;

                return (
                  <TableRow key={row.id} data-index={virtualRow.index} style={{ height: ROW_HEIGHT }} className={`${isEven ? "bg-muted/20" : ""} border-b transition-colors hover:bg-muted/50 cursor-pointer`} onClick={() => setSelectedCompany(row.original)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-1.5 truncate"
                        style={{ width: cell.column.getSize() }}
                        onClick={(e) => {
                          // Prevent modal from opening when clicking links
                          if ((e.target as HTMLElement).closest("a")) {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}

              {/* Virtual Bottom Padding Spacer */}
              {paddingBottom > 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ height: paddingBottom }} />
                </tr>
              )}
            </TableBody>
          </table>
        </div>
      </div>

      {/* Footer Status */}
      <div className="text-center text-xs text-muted-foreground h-5 rounded-sm flex items-center justify-center">
        {isFetchingNextPage ? (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading more...
          </span>
        ) : hasMore ? (
          <span>Scroll for more</span>
        ) : data.length > 0 ? (
          <span className="flex flex-wrap items-center justify-center gap-x-1.5 opacity-90">
            <span className="font-medium">End of results.</span>
            <span className="opacity-75 font-normal">Simplx can make mistakes. Check important info.</span>
          </span>
        ) : null}
      </div>

      {/* Company Detail Modal */}
      <CompanyDetailModal company={selectedCompany} open={selectedCompany !== null} onClose={() => setSelectedCompany(null)} />
    </div>
  );
}

export default React.memo(VirtualizedCompanyTable);
