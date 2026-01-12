"use client";

import { memo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, ExternalLink, ArrowUpDown } from "lucide-react";
import Image from "next/image";

// Import dummy data
import dummyData from "./table.json";
import { LinkedinLogo } from "@/lib/utils";

export interface CompanyResult {
  company_name: string;
  exists: boolean;
  domain: string | null;
  url?: string;
  confidence: number;
  title: string;
  description: string;
  verified: boolean;
  source: string;
  linkedin_url: string | null;
  logo_url: string | null;
}

interface CompanyTableProps {
  data?: CompanyResult[];
}

// Column definitions
const columns: ColumnDef<CompanyResult>[] = [
  {
    accessorKey: "logo_url",
    header: "",
    cell: ({ row }) => {
      const logoUrl = row.getValue("logo_url") as string | null;
      const companyName = row.getValue("company_name") as string;

      return (
        <div className="flex items-center justify-center w-10 h-10">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${companyName} logo`}
              width={32}
              height={32}
              className="rounded-md object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-medium">{companyName?.charAt(0)?.toUpperCase() || "?"}</div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "company_name",
    header: ({ column }) => (
      <button className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Company
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => <div className="font-medium text-slate-900 dark:text-slate-100">{row.getValue("company_name")}</div>,
  },
  {
    accessorKey: "domain",
    header: ({ column }) => (
      <button className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Domain
        <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => {
      const domain = row.getValue("domain") as string | null;
      const url = row.original.url;

      return domain ? (
        <a href={url || `https://${domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm">
          {domain}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>
      );
    },
  },
  {
    accessorKey: "verified",
    header: "Status",
    cell: ({ row }) => {
      const verified = row.getValue("verified") as boolean;
      const confidence = row.original.confidence;

      return (
        <div className="flex items-center gap-2">
          {verified ? (
            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1">
              <XCircle className="h-3 w-3" />
              Unverified
            </Badge>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">{confidence}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "linkedin_url",
    header: "LinkedIn",
    cell: ({ row }) => {
      const linkedinUrl = row.getValue("linkedin_url") as string | null;

      return linkedinUrl ? (
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors">
          {/* <Linkedin className="h-4 w-4" /> */}
          <Image src={LinkedinLogo} height={8} width={8} className="h-8 w-8 rounded-md" alt="Linkedin Logo" />
        </a>
      ) : (
        <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>
      );
    },
    enableSorting: false,
  },
];

const CompanyTable = ({ data = dummyData.results as CompanyResult[] }: CompanyTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center gap-4">
        <Input placeholder="Search companies..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-sm" />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {table.getFilteredRowModel().rows.length} of {data.length} companies
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-600 dark:text-slate-300 font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500 dark:text-slate-400">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default memo(CompanyTable);
