"use client";

import { Suspense, useState } from "react";
import { Linkedin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import SimpLxLoader from "@/components/common/Loader/SimpLxLoader";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import ToolsSuggestions from "../components/ToolsSuggestions";
import EmailConnect from "../components/EmailConnect";

interface Integration {
  id: string;
  name: string;
  description: string;
  image: string;
  status: "connected" | "disconnected";
}

const integrations: Integration[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Connect your professional identity to sync contacts, automate networking workflows, and track engagement analytics directly.",
    image: "https://res.cloudinary.com/dntxrtlsj/image/upload/v1766690412/linkedin_kii6l6.webp",
    status: "disconnected",
  },
  {
    id: "email",
    name: "Email Standard",
    description: "Integrate your mail server via IMAP/SMTP to unify communication channels and enable intelligent threading for your agents.",
    image: "https://res.cloudinary.com/dntxrtlsj/image/upload/v1766692665/gmail_gjz8kt.png",
    status: "disconnected",
  },
  {
    id: "tools",
    name: "Tools request",
    description: "Suggest new tools or integrations that would help streamline your workflow. We are constantly adding support for new services.",
    image: "https://res.cloudinary.com/dntxrtlsj/image/upload/v1766692459/proton_bppxeg.png",
    status: "disconnected",
  },
];

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleCardClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedIntegration(null), 300);
  };

  // Render different content based on the selected integration ID
  const renderDialogContent = () => {
    if (!selectedIntegration) return null;

    switch (selectedIntegration.id) {
      case "linkedin":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-[#0077B5]" /> Connect LinkedIn
              </DialogTitle>
              <DialogDescription>Authenticate your LinkedIn account to enable networking automation features.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="linkedin-email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="linkedin-email" placeholder="name@example.com" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="linkedin-password" className="text-sm font-medium">
                  Password
                </label>
                <Input id="linkedin-password" type="password" placeholder="••••••••" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0077B5] hover:bg-[#006097]">
                Connect LinkedIn
              </Button>
            </DialogFooter>
          </>
        );

      case "email":
        return (
          <>
            <EmailConnect closeDialog={closeDialog} />
          </>
        );

      case "tools":
        return (
          <>
            <ToolsSuggestions closeDialog={closeDialog} />
          </>
        );

      default:
        return null;
    }
  };

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
              <Card
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-slate-300 active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md">
                      {/* <item.image className="h-5 w-5" /> */}
                      <Image src={item.image} height={10} width={10} className="h-10 w-10 rounded-md" alt="Social Media Logo" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.status === "connected" ? "Connected" : "Not connected"}</p>
                    </div>
                  </div>
                  {item.id !== "tools" && (
                    <div
                      className={cn(
                        "rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide",
                        item.status === "connected" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"
                      )}
                    >
                      {item.status === "connected" ? "Connected" : "Connect"}
                    </div>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
              </Card>
            ))}
          </div>

          {/* Dialog Component */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white text-slate-900">{renderDialogContent()}</DialogContent>
          </Dialog>
        </div>
      </main>
    </Suspense>
  );
}
