import type { ReactNode } from "react";
import { getServerAuthSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { HyperMailSidebar } from "./components/Sidebar";
import UserStoreInitializer from "./components/UserStoreInitializer";

export default async function EncryptFileShareLayout({ children }: { children: ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    redirect("/");
  }

  const userData = {
    name: session.user.name ?? "User",
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {session?.user?.email && <UserStoreInitializer key={session.user.email} user={userData} />}
      <div className="sticky top-0 h-screen">
        <HyperMailSidebar user={session?.user} />
      </div>
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  );
}
