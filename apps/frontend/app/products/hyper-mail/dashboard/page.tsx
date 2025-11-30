import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Mail, ShieldCheck } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BackendAuthProbe } from "@/components/common/LandingPage/backend-auth-probe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel, type AppUser } from "@/lib/models/user";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    redirect("/");
  }

  await connectToDatabase();

  const dbUser = await UserModel.findOne({ email: session.user.email }).lean<AppUser | null>();

  const lastLoginLabel = dbUser?.lastLoginAt
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dbUser.lastLoginAt))
    : "N/A";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-16">
      <div>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Dashboard</p>
        <h1 className="text-4xl font-semibold tracking-tight">Welcome back!</h1>
        <p className="mt-2 text-muted-foreground">This route is protected with NextAuth middleware. You can sign out at any time or jump back to the landing page.</p>
      </div>
      <Card className="border-border/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {session.user.image ? (
              <Image src={session.user.image} alt={session.user.name ?? "Profile avatar"} width={72} height={72} className="rounded-full border" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <ShieldCheck className="size-8" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">{session.user.name ?? "Unknown user"}</CardTitle>
              <CardDescription>{session.user.email}</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/">
                Back home
                <span className="sr-only">Go to landing page</span>
              </Link>
            </Button>
            <SignOutButton variant="destructive" className="text-white">
              Sign out
            </SignOutButton>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <span>{session.user.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span>Last login: {lastLoginLabel}</span>
            </p>
          </div>
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            The dashboard fetches your profile from MongoDB on every request. Because sessions are JWT-based, the server does not need to query a NextAuth session table. This keeps response times low while still persisting your profile data.
          </p>
        </CardContent>
      </Card>
      <BackendAuthProbe />
    </main>
  );
}
