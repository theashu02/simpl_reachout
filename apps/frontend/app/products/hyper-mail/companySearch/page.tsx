"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface CompanyData {
  name: string;
  description: string;
  industry: string;
  location: string;
  company_url: string;
  logo_url: string;
  follower_count: string;
  search_input: string;
}

interface CompanyCardProps {
  company: CompanyData;
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

const sampleCompanies: CompanyData[] = [
  {
    name: "Segwise (Creative Analytics Agents)",
    description:
      "Segwise builds AI agents to improve creative ROAS. Our AI agents help you automate creative tagging and simplify creative analytics, helping you save hours and improve ROAS. Get started with a 14 day FREE trial at segwise.ai",
    industry: "Technology, Information and Internet",
    location: "Lewes, Delaware",
    company_url: "https://www.linkedin.com/company/segwise-ai/",
    logo_url:
      "",
    follower_count: "16K followers",
    search_input: "Segwise",
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generates initials from a company name for fallback display
 */
function getInitials(name: string): string {
  if (!name) return "??";
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Truncates text to a specified length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || "";
  return text.substring(0, maxLength).trim() + "...";
}

// =============================================================================
// SKELETON LOADER COMPONENT
// =============================================================================

function CompanyCardSkeleton() {
  return (
    <article
      className="relative h-full overflow-hidden rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse"
      aria-hidden="true"
    >
      {/* Header skeleton */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex-1 space-y-2.5">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
        </div>
      </div>

      {/* Meta info skeleton */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        </div>
      </div>

      {/* Description skeleton */}
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between mt-auto">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32" />
      </div>
    </article>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 dark:text-blue-400">
          <svg
            className="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-teal-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        No Companies Found
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm">
        We couldn't find any companies matching your search. Try different
        keywords or filters.
      </p>
    </div>
  );
}

// =============================================================================
// COMPANY CARD COMPONENT
// =============================================================================

function CompanyCard({ company }: CompanyCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayDescription = isExpanded
    ? company.description
    : truncateText(company.description, 120);

  const hasMoreContent =
    company.description && company.description.length > 120;

  return (
    <article className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Top Gradient Bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6 flex flex-col flex-1">
        {/* Header: Logo + Name */}
        <div className="flex items-start gap-4 mb-5">
          {/* Logo with Fallback */}
          <div className="relative shrink-0">
            {!imageError && company.logo_url ? (
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                <Image
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {getInitials(company.name)}
              </div>
            )}

            {/* Online Status Dot */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-1 truncate">
              {company.name}
            </h2>
          </div>
        </div>

        {/* Info Rows */}
        <div className="space-y-2 mb-5">
          {company.industry && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <svg
                className="w-4 h-4 text-indigo-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="truncate">{company.industry}</span>
            </div>
          )}
          {company.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <svg
                className="w-4 h-4 text-teal-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{company.location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6 flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {displayDescription}
            {hasMoreContent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/50 mt-auto">
          {/* Follower Badge */}
          {company.follower_count && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
              <svg
                className="w-3.5 h-3.5 text-indigo-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              {company.follower_count}
            </div>
          )}

          {/* CTA Button */}
          <a
            href={company.company_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-blue-600 dark:hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span>View</span>
            <svg
              className="w-4 h-4 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

// =============================================================================
// MAIN PAGE VIEW
// =============================================================================

interface CompanySearchProps {
  companies?: CompanyData[];
  isLoading?: boolean;
}

export default function CompanySearchPage({
  companies = sampleCompanies,
  isLoading = false,
}: CompanySearchProps) {
  // Loading State
  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Company Results
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Searching directory...
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Empty State
  if (!companies?.length) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Company Results
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              0 results found
            </p>
          </header>
          <EmptyState />
        </div>
      </main>
    );
  }

  // Results State
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Company Results
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Found{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {companies.length}
              </span>{" "}
              companies
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {companies.map((company, idx) => (
            <CompanyCard key={idx} company={company} />
          ))}
        </div>
      </div>
    </main>
  );
}
