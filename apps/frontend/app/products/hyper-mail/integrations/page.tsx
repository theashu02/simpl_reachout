"use client";

import { Suspense } from "react";
import { Mail, Linkedin, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import SimpLxLoader from "@/components/common/Loader/SimpLxLoader";

// --- Types & Data ---
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: "connected" | "disconnected";
}

const integrations: Integration[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Connect your professional identity to sync contacts, automate networking workflows, and track engagement analytics directly.",
    icon: Linkedin,
    status: "disconnected",
  },
  {
    id: "email",
    name: "Email Standard",
    description: "Integrate your mail server via IMAP/SMTP to unify communication channels and enable intelligent threading for your agents.",
    icon: Mail,
    status: "disconnected",
  },
  {
    id: "tools",
    name: "Tools request",
    description: "Integrate your mail server via IMAP/SMTP to unify communication channels and enable intelligent threading for your agents.",
    icon: Mail,
    status: "disconnected",
  },
];

// --- Main Page Component ---
export default function IntegrationsPage() {
  return (
    <Suspense fallback={<SimpLxLoader />}>
      <main className="min-h-screen bg-slate-50/50 flex flex-col items-center p-5">
        <div className="w-full max-w-full space-y-10">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Integrations</h1>
            <p className="text-base text-slate-500 max-w-3xl">Connect your development tools to enable AI-powered workflows and automation.</p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {integrations.map((item) => (
              <Card key={item.id} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm text-slate-700">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.status === "connected" ? "Connected" : "Not connected"}</p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide",
                      item.status === "connected" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"
                    )}
                  >
                    {item.status === "connected" ? "Connected" : "Not connected"}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </Suspense>
  );
}
