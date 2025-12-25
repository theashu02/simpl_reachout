import Link from "next/link";
import { ArrowRight, MessageSquare, ShieldCheck, Sparkles, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "./Header";

const products = [
  {
    title: "Email Reach-Out (Outbound)",
    description: "Dynamic inbox intelligence that drafts perfectly-tuned emails for every prospect, auto-personalized with live data.",
    bullets: ["Sequenced outreach reacting to opens & clicks", "Context injection from CRM & product feeds", "Human-in-the-loop editor for control"],
    icon: MessageSquare,
  },
  {
    title: "One-to-One Video Call Chat",
    description: "Omegle-style video matching built for product discovery, with AI copilots surfacing insights in real-time.",
    bullets: ["Latency-optimized WebRTC mesh", "Smart pairing based on intent", "Real-time transcript + auto-summary"],
    icon: Video,
  },
];

export default function HomePage() {
  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-background text-foreground scroll-smooth font-gist">
      <Header />

      <main>
        <section className="relative min-h-screen w-full snap-start flex items-center justify-center pt-16">
          {/* Ambient Background */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px] opacity-40" />

          <div className="container mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" />
                <span>Hyper-personalized messaging OS</span>
              </div>

              <h1 className="text-4xl font-bold tracking-normal sm:text-5xl xl:text-7xl text-balance leading-[1.1]">
                Turn every outbound touch into a <span className="text-primary">one-to-one conversation.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl text-balance leading-relaxed">
                Neural Hash orchestrates data, AI, and channels so your team can launch high-signal outreach that feels handcrafted.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-transform hover:scale-105">
                  <Link href="/auth">
                    Get started
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm">
                  <Link href="#products">See products</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>SOC2-ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span>AI Copilots</span>
                </div>
              </div>
            </div>

            {/* Right Content (Floating Card) */}
            <div className="hidden lg:block relative w-full">
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 dark:bg-black/20 dark:ring-white/10">
                <div className="rounded-2xl bg-card/90 p-8 shadow-inner">
                  <p className="mb-6 text-xs font-bold uppercase tracking-widest text-primary/80">Why teams switch</p>
                  <ul className="space-y-4">
                    {[
                      { title: "Personalization graph", desc: "Tap CRMs and telemetry to craft the next best message." },
                      { title: "Adaptive automations", desc: "Branch flows instantly when a prospect opens or clicks." },
                      { title: "Clear handoffs", desc: "AI copilots surface decisions, reps approve every send." },
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:border-primary/20">
                        <div className="mt-1 size-2 shrink-0 rounded-full bg-primary shadow shadow-primary/50" />
                        <div>
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="relative min-h-screen w-full snap-start flex items-center justify-center bg-muted/20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Platform Capabilities</h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">Two powerful engines tailored for modern sales teams, fully integrated into your existing workflow.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {products.map((product) => {
                const Icon = product.icon;
                return (
                  <Card
                    key={product.title}
                    className="group relative overflow-hidden border-border/60 bg-background/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30"
                  >
                    <CardHeader className="pb-2">
                      <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 shadow-sm">
                        <Icon className="size-7" />
                      </div>
                      <CardTitle className="text-2xl font-bold">{product.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed mt-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4">
                      <ul className="space-y-3">
                        {product.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
