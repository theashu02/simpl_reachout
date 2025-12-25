"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EncryptFileSidebarProps } from "@/lib/interfaces/config";
import Image from "next/image";
import { LogoURL } from "@/lib/utils";
import HoverButton from "@/components/common/AnimatedButtons/HoverButton";
import { signOut } from "next-auth/react";
import { NAV_ITEMS } from "../utils/NavItems";

export function HyperMailSidebar({ user }: EncryptFileSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const UserData = {
    name: user?.name ?? "User",
    email: user?.email ?? "",
    initial: (user?.name?.[0] ?? "?").toUpperCase(),
  };

  const [isPending, startTransition] = React.useTransition();

  const handleSignOut = () => {
    startTransition(() => {
      void signOut({ callbackUrl: "/" });
    });
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
                <item.icon className="size-5" strokeWidth={1.5} />
                {isOpen && <span className="ml-2 text-sm tracking-widest font-normal">{item.label}</span>}
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
          <HoverButton onClick={handleSignOut} className="w-full">
            {isOpen ? (
              <>
                <span className="">{isPending ? "Signing out..." : "Securely Logout"}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </>
            ) : (
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300" />
            )}
          </HoverButton>
        </div>
      </div>
    </aside>
  );
}
