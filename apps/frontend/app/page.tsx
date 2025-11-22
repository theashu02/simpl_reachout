import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const products = [
  {
    title: "Email Reach-Out (Outbound)",
    description:
      "Dynamic inbox intelligence that drafts perfectly-tuned emails for every prospect, auto-personalized with live data and tone controls.",
    bullets: [
      "Sequenced outreach that reacts to opens, clicks, and replies",
      "Context injection from CRM, product feeds, and call notes",
      "Human-in-the-loop editor so reps stay in control",
    ],
    icon: MessageSquare,
  },
  {
    title: "One-to-One Video Call Chat",
    description:
      "Omegle-style video matching built for product discovery calls, with AI copilots surfacing insights while conversations happen.",
    bullets: [
      "Latency-optimized WebRTC mesh for instant connections",
      "Smart pairing based on persona, availability, and intent",
      "Real-time transcript + auto-summary pipelines",
    ],
    icon: Video,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-24 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-4" />
            Hyper-personalized messaging OS
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Turn every outbound touch into a{" "}
            <span className="text-primary">one-to-one conversation.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Neural Hash orchestrates data, AI, and channels so your team can launch
            high-signal outreach and live call experiences that feel handcrafted for
            every lead. Less spray-and-pray, more intimacy at scale.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#products">See the products</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              SOC2-ready infrastructure
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              AI copilots tuned for GTM teams
            </div>
          </div>
        </div>
        <div className="w-full max-w-xl rounded-3xl border border-border/60 bg-background/80 p-6 shadow-lg backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            Why teams switch
          </p>
          <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
            <li className="rounded-2xl border border-border/60 bg-background/60 p-4">
              <p className="font-medium text-foreground">Personalization graph</p>
              <p>
                Tap CRMs, product telemetry, and call summaries to craft the next best
                message without manual research.
              </p>
            </li>
            <li className="rounded-2xl border border-border/60 bg-background/60 p-4">
              <p className="font-medium text-foreground">Adaptive automations</p>
              <p>
                Branch flows instantly when a prospect opens an email, joins a call, or
                requests a demo—no Zapier spaghetti.
              </p>
            </li>
            <li className="rounded-2xl border border-border/60 bg-background/60 p-4">
              <p className="font-medium text-foreground">Clear handoffs</p>
              <p>
                AI copilots surface decisions, but reps approve every send so compliance
                and tone stay consistent.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section id="products" className="border-t border-border/60 bg-background/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <Card key={product.title} className="border-border/70 shadow-md">
                <CardHeader className="flex flex-row items-center gap-3">
                  <span className="rounded-full border border-primary/20 bg-primary/5 p-2 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <CardTitle>{product.title}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {product.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-1 size-1.5 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
