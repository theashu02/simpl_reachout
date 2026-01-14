// "use client";

// import * as React from "react";
// import { useReactTable, getCoreRowModel, ColumnDef, flexRender, Row } from "@tanstack/react-table";
// import { useVirtualizer } from "@tanstack/react-virtual";
// import { Loader2, Linkedin, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import type { SortOrder } from "../actions";

// // --- Types ---
// export type CompanyResult = {
//   company_name: string;
//   exists?: boolean;
//   domain: string | null;
//   url?: string | null;
//   confidence?: number;
//   title?: string;
//   description?: string;
//   verified: boolean;
//   source?: string;
//   linkedin_url: string | null;
//   logo_url: string | null;
// };

// interface VirtualizedCompanyTableProps {
//   data: CompanyResult[];
//   hasMore: boolean;
//   isFetchingNextPage: boolean;
//   fetchNextPage: () => void;
//   total?: number;
//   sortOrder?: SortOrder;
//   onSortToggle?: () => void;
// }

// const ROW_HEIGHT = 40;
// const FETCH_THRESHOLD = 3;

// // --- Columns Definition ---
// const columns: ColumnDef<CompanyResult>[] = [
//   {
//     accessorKey: "logo_url",
//     header: "",
//     cell: ({ row }) => (
//       <Avatar className="h-7 w-7">
//         <AvatarImage src={row.original.logo_url || undefined} alt={row.original.company_name} />
//         <AvatarFallback className="text-xs">{(row.original.company_name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
//       </Avatar>
//     ),
//     size: 48,
//   },
//   {
//     accessorKey: "company_name",
//     header: "Company",
//     cell: ({ row }) => <span className="font-medium text-foreground truncate">{row.original.company_name || "Unknown"}</span>,
//     size: 180,
//   },
//   {
//     accessorKey: "domain",
//     header: "Domain",
//     cell: ({ row }) => {
//       const domain = row.original.domain;
//       return domain ? (
//         <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
//           {domain}
//         </a>
//       ) : (
//         <span className="text-muted-foreground">—</span>
//       );
//     },
//     size: 160,
//   },
//   {
//     accessorKey: "verified",
//     header: "Status",
//     cell: ({ row }) => (
//       <Badge variant={row.original.verified ? "default" : "secondary"} className="text-xs px-2 py-0.5">
//         {row.original.verified ? "Verified" : "Pending"}
//       </Badge>
//     ),
//     size: 90,
//   },
//   {
//     accessorKey: "confidence",
//     header: "Conf.",
//     cell: ({ row }) => <span className="text-xs text-muted-foreground tabular-nums">{typeof row.original.confidence === "number" ? `${row.original.confidence}%` : "—"}</span>,
//     size: 60,
//   },
//   {
//     accessorKey: "source",
//     header: "Source",
//     cell: ({ row }) => <span className="text-xs text-muted-foreground uppercase">{row.original.source || "—"}</span>,
//     size: 70,
//   },
//   {
//     accessorKey: "linkedin_url",
//     header: "",
//     cell: ({ row }) =>
//       row.original.linkedin_url ? (
//         <a href={row.original.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900">
//           <Linkedin className="h-4 w-4" />
//         </a>
//       ) : (
//         <span className="text-muted-foreground">—</span>
//       ),
//     size: 40,
//   },
// ];

// // --- Main Component ---
// function VirtualizedCompanyTable({ data, hasMore, isFetchingNextPage, fetchNextPage, total, sortOrder = "asc", onSortToggle }: VirtualizedCompanyTableProps) {
//   const tableContainerRef = React.useRef<HTMLDivElement>(null);

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getRowId: (row, index) => row.domain ?? `${row.company_name}-${index}`,
//   });

//   const { rows } = table.getRowModel();

//   const rowVirtualizer = useVirtualizer({
//     count: rows.length,
//     getScrollElement: () => tableContainerRef.current,
//     estimateSize: () => ROW_HEIGHT,
//     overscan: 5,
//   });

//   const virtualItems = rowVirtualizer.getVirtualItems();
//   const totalSize = rowVirtualizer.getTotalSize();

//   // Infinite scroll trigger
//   React.useEffect(() => {
//     if (!virtualItems.length || !hasMore || isFetchingNextPage) return;

//     const lastVisibleIndex = virtualItems[virtualItems.length - 1].index;
//     const distanceFromEnd = rows.length - 1 - lastVisibleIndex;

//     if (distanceFromEnd <= FETCH_THRESHOLD) {
//       fetchNextPage();
//     }
//   }, [virtualItems, rows.length, hasMore, isFetchingNextPage, fetchNextPage]);

//   if (data.length === 0) {
//     return (
//       <div className="flex h-60 w-full items-center justify-center border rounded-md bg-muted/30">
//         <span className="text-muted-foreground text-sm">No companies found. Search to get started.</span>
//       </div>
//     );
//   }

//   const paddingTop = virtualItems[0]?.start ?? 0;
//   const paddingBottom = totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0);

//   // Sort icon based on current order
//   const SortIcon = sortOrder === "asc" ? ArrowUp : sortOrder === "desc" ? ArrowDown : ArrowUpDown;

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="flex items-center mb-2 px-1 text-sm gap-2">
//         <span className="font-medium text-foreground">Companies</span>
//         <span className="text-muted-foreground text-xs">
//           {data.length} of {total ?? data.length}
//           {hasMore && "+"}
//         </span>
//       </div>

//       {/* Table Container */}
//       <div className="rounded-md border bg-background overflow-hidden">
//         <div ref={tableContainerRef} className="h-[360px] overflow-auto relative">
//           <Table className="w-full min-w-[360px] text-sm">
//             <TableHeader className="sticky top-0 z-10 bg-background border-b">
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <TableRow key={headerGroup.id} className="hover:bg-transparent">
//                   {headerGroup.headers.map((header) => {
//                     const isCompanyColumn = header.column.id === "company_name";

//                     return (
//                       <TableHead
//                         key={header.id}
//                         style={{ width: header.getSize() }}
//                         className={`h-9 text-xs font-medium text-muted-foreground ${isCompanyColumn && onSortToggle ? "cursor-pointer select-none hover:text-foreground" : ""}`}
//                         onClick={isCompanyColumn && onSortToggle ? onSortToggle : undefined}
//                       >
//                         {header.isPlaceholder ? null : (
//                           <span className="flex items-center gap-1">
//                             {flexRender(header.column.columnDef.header, header.getContext())}
//                             {isCompanyColumn && onSortToggle && <SortIcon className="h-3 w-3" />}
//                           </span>
//                         )}
//                       </TableHead>
//                     );
//                   })}
//                 </TableRow>
//               ))}
//             </TableHeader>

//             <TableBody>
//               {paddingTop > 0 && (
//                 <tr>
//                   <td colSpan={columns.length} style={{ height: paddingTop }} />
//                 </tr>
//               )}

//               {virtualItems.map((virtualRow) => {
//                 const row = rows[virtualRow.index] as Row<CompanyResult>;
//                 const isEven = virtualRow.index % 2 === 0;

//                 return (
//                   <TableRow key={row.id} data-index={virtualRow.index} style={{ height: ROW_HEIGHT }} className={isEven ? "bg-muted/20" : ""}>
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id} className="py-1.5">
//                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 );
//               })}

//               {paddingBottom > 0 && (
//                 <tr>
//                   <td colSpan={columns.length} style={{ height: paddingBottom }} />
//                 </tr>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       {/* Footer status */}
//       <div className="text-center text-xs text-muted-foreground mt-2 h-5 bg-amber-300">
//         {isFetchingNextPage ? (
//           <span className="flex items-center justify-center gap-1">
//             <Loader2 className="h-3 w-3 animate-spin" />
//             Loading more...
//           </span>
//         ) : hasMore ? (
//           <span>Scroll for more</span>
//         ) : data.length > 0 ? (
//           <span>End of results</span>
//         ) : null}
//       </div>
//     </div>
//   );
// }

// export default React.memo(VirtualizedCompanyTable);

"use client";

import * as React from "react";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender, Row } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2, Linkedin, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

// Keep these internal components, but we will replace the main <Table> wrapper
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// --- Types (Kept same) ---
export type SortOrder = "asc" | "desc";

export type CompanyResult = {
  company_name: string;
  exists?: boolean;
  domain: string | null;
  url?: string | null;
  confidence?: number;
  title?: string;
  description?: string;
  verified: boolean;
  source?: string;
  linkedin_url: string | null;
  logo_url: string | null;
};

interface VirtualizedCompanyTableProps {
  data: CompanyResult[];
  hasMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  total?: number;
  sortOrder?: SortOrder;
  onSortToggle?: () => void;
}

const ROW_HEIGHT = 48; // Increased slightly for better click targets
const FETCH_THRESHOLD = 3;

// --- Columns Definition (Kept same) ---
const columns: ColumnDef<CompanyResult>[] = [
  {
    accessorKey: "logo_url",
    header: "",
    cell: ({ row }) => (
      <Avatar className="h-9 w-9 rounded-sm">
        <AvatarImage src={row.original.logo_url || undefined} alt={row.original.company_name} />
        <AvatarFallback className="text-xs">{(row.original.company_name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
    ),
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
        {row.original.verified ? "Verified" : "Pending"}
      </Badge>
    ),
    size: 90,
  },
  {
    accessorKey: "confidence",
    header: "Conf.",
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
        <a href={row.original.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900">
          <Linkedin className="h-4 w-4" />
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    size: 40,
  },
];

// --- Main Component ---
function VirtualizedCompanyTable({ data, hasMore, isFetchingNextPage, fetchNextPage, total, sortOrder = "asc", onSortToggle }: VirtualizedCompanyTableProps) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

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
    overscan: 10, // Increased overscan for smoother scrolling
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
      <div className="flex h-60 w-full items-center justify-center border rounded-md bg-muted/30">
        <span className="text-muted-foreground text-sm">No companies found. Search to get started.</span>
      </div>
    );
  }

  const paddingTop = virtualItems[0]?.start ?? 0;
  const paddingBottom = totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0);

  const SortIcon = sortOrder === "asc" ? ArrowUp : sortOrder === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <div className="w-full h-full flex flex-col">
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
                  <TableRow
                    key={row.id}
                    data-index={virtualRow.index}
                    // Force height on the row to match the virtualizer estimate
                    style={{ height: ROW_HEIGHT }}
                    className={`${isEven ? "bg-muted/20" : ""} border-b transition-colors hover:bg-muted/50`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-1.5 truncate" // Truncate helps prevent row height blowouts
                        style={{ width: cell.column.getSize() }}
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
    </div>
  );
}

export default React.memo(VirtualizedCompanyTable);
