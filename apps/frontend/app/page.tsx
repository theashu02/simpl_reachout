import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerAuthSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-xl border-border/80 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-10 text-primary" />
            <div>
              <CardTitle className="text-3xl">Sign in to continue</CardTitle>
              <CardDescription>
                Securely access the Neural Hash dashboard with Google or GitHub.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {session?.user ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Signed in as
                </p>
                <p className="text-lg font-semibold">{session.user.name}</p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/dashboard" className="inline-flex items-center gap-2">
                    Go to dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <SignOutButton variant="outline" className="flex-1 sm:flex-none">
                  Sign out
                </SignOutButton>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Authenticate with your preferred provider. We only request your public
                profile information (name, email, and avatar) to personalize the
                experience.
              </p>
              <div className="space-y-3">
                <SignInButton provider="google" />
                <SignInButton provider="github" />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Protected with NextAuth.js and MongoDB.</span>
          <span className="font-medium text-primary">JWT sessions + middleware guard</span>
        </CardFooter>
      </Card>
    </main>
  );
}
