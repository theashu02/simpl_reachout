"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, Copy, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CompanyResult } from "./types";
import { LinkedinLogo } from "@/lib/utils";
import Link from "next/link";

interface CompanyDetailModalProps {
  company: CompanyResult | null;
  open: boolean;
  onClose: () => void;
}

export default function CompanyDetailModal({ company, open, onClose }: CompanyDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!company) return null;

  const handleCopyDomain = async () => {
    if (company.domain) {
      await navigator.clipboard.writeText(company.domain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const confidenceColor = (company.confidence ?? 0) >= 80 ? "text-green-600" : (company.confidence ?? 0) >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden font-dmsans">
        {/* Header with Logo */}
        <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b">
          <DialogHeader className="flex-row items-start gap-4 space-y-0">
            <div className="shrink-0">
              <Image src={company.logo_url || "/images/company-fallback.png"} alt={company.company_name} width={56} height={56} unoptimized className="h-14 w-14 rounded-lg object-contain bg-white border" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold text-foreground">{company.company_name}</DialogTitle>
              {company.title && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{company.title}</p>}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={company.verified ? "default" : "secondary"} className="text-xs">
                  {company.verified ? "Verified" : "Unverified"}
                </Badge>
                {typeof company.confidence === "number" && <span className={`text-xs font-medium ${confidenceColor}`}>{company.confidence}% confidence</span>}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Domain */}
          {company.domain && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Domain</p>
                  <p className="text-sm font-medium text-foreground">{company.domain}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer hover:cursor-pointer" onClick={handleCopyDomain}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer hover:cursor-pointer" asChild>
                  <Link href={`https://${company.domain}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* LinkedIn */}
          {company.linkedin_url && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Image src={LinkedinLogo} alt="LinkedIn" width={16} height={16} className="h-8 w-8 rounded-md" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">LinkedIn</p>
                  <p className="text-sm font-medium text-foreground max-w-full">{company.linkedin_url.replace("https://", "").replace("www.", "")}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer hover:cursor-pointer" asChild>
                <Link href={company.linkedin_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {/* Description */}
          {company.description && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Description</p>
              <p className="text-sm text-foreground tracking-wide">{company.description}</p>
            </div>
          )}

          {/* Source */}
          {company.source && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Source: <span className="uppercase">{company.source}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer hover:cursor-pointer">
            Close
          </Button>
          {company.domain && (
            <Button size="sm" asChild className="cursor-pointer hover:cursor-pointer">
              <Link href={`https://${company.domain}`} target="_blank" rel="noreferrer">
                Visit Website
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
