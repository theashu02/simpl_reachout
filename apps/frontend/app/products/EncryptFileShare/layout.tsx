import type { ReactNode } from "react";
import { EncryptFileSidebar } from "./components/Sidebar";
import { getServerAuthSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function EncryptFileShareLayout({ children }: { children: ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    redirect("/");
  }
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="sticky top-0 h-screen">
        <EncryptFileSidebar user={session?.user} />
      </div>
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  );
}
