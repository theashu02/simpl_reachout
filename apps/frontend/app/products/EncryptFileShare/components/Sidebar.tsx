"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, FileText, Mail, Settings, Share2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EncryptFileSidebarProps } from "@/lib/interfaces/config";
import Image from "next/image";
import { LogoURL } from "@/lib/utils";
import HoverFillButton from "./Button";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/products/EncryptFileShare",
    icon: FileText,
  },
  {
    label: "Send File",
    href: "/products/EncryptFileShare/send",
    icon: UploadCloud,
  },
  {
    label: "Join Room",
    href: "/products/EncryptFileShare/join",
    icon: Share2,
  },
  {
    label: "Messages",
    href: "/products/EncryptFileShare/messages",
    icon: Mail,
    disabled: true,
  },
  {
    label: "Settings",
    href: "/products/EncryptFileShare/settings",
    icon: Settings,
    disabled: true,
  },
];

export function EncryptFileSidebar({ user }: EncryptFileSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const UserData = {
    name: user?.name ?? "User",
    email: user?.email ?? "",
    initial: (user?.name?.[0] ?? "?").toUpperCase(),
  };

  return (
    <aside className={`flex h-screen flex-col border-r border-border bg-sidebar p-2 transition-[width] duration-500 ${isOpen ? "w-64" : "w-24"}`}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-[#e0f2fe]">
        <div className={`${isOpen ? "px-5 pt-5" : "flex flex-col items-center pt-5"} pb-2`}>
          <div className={`flex items-center gap-3 transition-all ${isOpen ? "justify-center" : "justify-center"}`}>
            {isOpen ? <span className="text-lg font-semibold tracking-[1em] text-foreground">SimpLx</span> : <Image height={30} width={30} src={LogoURL} alt="SimpLx Logo" />}
          </div>
          <button onClick={() => setIsOpen((prev) => !prev)} className={`mt-4 flex items-center text-sm text-muted-foreground transition ${isOpen ? "gap-2" : "w-full justify-center"}`}>
            <ChevronLeft className={`size-4 transition ${isOpen ? "" : "rotate-180"}`} />
            {isOpen && <span className="tracking-wider">Collapse</span>}
          </button>
        </div>

        <div className="h-px w-full bg-border/80" />

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const content = (
              <>
                <item.icon className="size-5" />
                {isOpen && <span className="ml-2 text-sm">{item.label}</span>}
              </>
            );

            if (item.disabled) {
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  disabled
                  title={!isOpen ? item.label : undefined}
                  className={`w-full ${isOpen ? "justify-start gap-3 px-4 py-3" : "justify-center gap-0 px-0 py-3"} text-muted-foreground hover:bg-[#e5ffc3]`}
                >
                  {content}
                </Button>
              );
            }

            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                title={!isOpen ? item.label : undefined}
                className={`w-full hover:bg-[#e5ffc3] ${isOpen ? "justify-start gap-3 px-4 py-3" : "justify-center gap-0 px-0 py-3"} ${isActive ? "bg-[#e5ffc3] text-accent-foreground" : "text-foreground"}`}
              >
                <Link href={item.href}>{content}</Link>
              </Button>
            );
          })}
        </nav>

        <div className="h-px w-full bg-border/80" />

        <div className="px-4 py-4 text-sm text-muted-foreground">
          <div className={`flex ${isOpen ? "items-center gap-3" : "flex-col items-center gap-2"} text-foreground`}>
            <div className="grid p-3 place-items-center rounded-full bg-primary/15 text-xs font-semibold">{UserData.initial}</div>
            {isOpen && (
              <div className="min-w-0">
                <p className="truncate font-medium">{UserData.name}</p>
                <p className="truncate text-xs text-muted-foreground">{UserData.email}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border/80 px-4 py-3">
          {/* <Button type="button" variant="outline" size={isOpen ? "sm" : "icon"} className={`w-full ${isOpen ? "justify-start gap-2" : "justify-center"}`} onClick={handleLogout}>
            <LogOut className="size-4" />
            {isOpen && <span>Sign Out</span>}
          </Button> */}
          <HoverFillButton text="Securely Out" colorClass="bg-gradient-to-br from-blue-400 to-indigo-600" />
        </div>
      </div>
    </aside>
  );
}
