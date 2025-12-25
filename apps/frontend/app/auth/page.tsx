import Image from "next/image";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getServerAuthSession } from "@/lib/auth/session";
import { MetaMaskButton } from "@/components/auth/MetaMaskButton";
import { LogoURL } from "@/lib/utils";

const emailPersonalizationImage = "https://res.cloudinary.com/dntxrtlsj/image/upload/v1763820557/email-personalization_z0vbzw.jpg";

export default async function AuthPage() {
  const session = await getServerAuthSession();
  if (session?.user) {
    redirect("/products");
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row font-gist">
      <div className="absolute left-8 top-8 z-50 flex items-center gap-2 select-none">
        <div className="relative">
          <Image src={LogoURL} width={42} height={42} alt="Simplx Logo" className="object-contain" />
        </div>
        <div className="flex items-baseline font-gist text-2xl font-bold tracking-widest text-foreground">
          Simp
          <span className="bg-linear-to-r from-[#FFA680] to-orange-600 bg-clip-text text-transparent">Lx</span>
          <span className="ml-1 text-sm font-medium tracking-normal text-muted-foreground">Inc.</span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-8 lg:p-12">
        <Card className="w-full max-w-md border-border/50 shadow-elegant animate-fade-in">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-3xl font-bold tracking-wider">Welcome to Simplx</CardTitle>
            <CardDescription className="text-base">Sign in to access hyperpersonalized email campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <SignInButton provider="google" className="h-12 justify-center gap-3 rounded-xl border border-border/70 bg-background/80 text-base font-medium shadow-sm hover:border-primary/40" />
              <SignInButton provider="github" className="h-12 justify-center gap-3 rounded-xl border border-border/70 bg-background/80 text-base font-medium shadow-sm hover:border-primary/40" />
              <MetaMaskButton className="h-12 justify-center gap-3 rounded-xl border border-border/70 bg-background/80 text-base font-medium shadow-sm hover:border-primary/40" />
            </div>
            <CardFooter className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 p-6">
              <p className="text-center text-xs text-slate-500 font-sans">
                By clicking continue, you agree to our{" "}
                <a href="#" className="underline hover:text-slate-800">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-slate-800">
                  Privacy Policy
                </a>
                .
              </p>
            </CardFooter>
          </CardContent>
        </Card>
      </div>

      <div className="relative hidden flex-1 overflow-hidden bg-linear-to-b from-primary/10 via-background to-accent/10 lg:flex">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative flex w-full items-center justify-center p-12">
          <div className="max-w-2xl space-y-10 text-center">
            <div className="space-y-4 tracking-wider">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">Hyperpersonalized Email Marketing</p>
              <h2 className="text-4xl font-bold tracking-normal">
                Turn AI insights into <span className="text-primary">human-grade outreach at scale.</span>
              </h2>
              <p className="text-lg text-muted-foreground">Send perfectly tailored messages to each customer using live data, automated copy, and adaptive sequencing.</p>
            </div>
            <div className="overflow-hidden rounded-2xl shadow-elegant animate-fade-in">
              <Image src={emailPersonalizationImage} alt="Hyperpersonalized email marketing visualization" width={1200} height={900} className="h-auto w-full object-cover" priority />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
