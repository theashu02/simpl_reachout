import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, UploadCloud, Users } from "lucide-react";

export default function EncryptFileSharePage() {
  const actions = [
    {
      title: "Send File",
      description: "Create a secure WebRTC room, upload a file up to 5 GB, and share the generated room ID with your recipient.",
      href: "/products/EncryptFileShare/send",
      icon: UploadCloud,
    },
    {
      title: "Join Room",
      description: "Use the room ID shared with you to join the encrypted session and receive the file directly from the sender.",
      href: "/products/EncryptFileShare/join",
      icon: Users,
    },
  ];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col gap-10 px-4 py-16">
      <header className="text-center">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Encrypted File Share</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Transfer any file directly after authentication</h1>
        <p className="mt-3 text-base text-muted-foreground md:text-lg">Choose whether you want to send a file or join someone else&apos;s room. Each transfer uses a short-lived, peer-to-peer WebRTC room coordinated by our Bun/Elysia signaling service.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {actions.map(({ title, description, href, icon: Icon }) => (
          <Card key={title} className="flex flex-col justify-between border-border/80">
            <CardHeader>
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={href}>Continue</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-2xl border bg-muted/30 p-6 text-sm leading-relaxed text-muted-foreground md:text-base">
        <div className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground md:text-lg">
          <ShieldCheck className="size-5" />
          End-to-end flow
        </div>
        <p>
          1. Authenticate, land on this page, and choose an action. 2. The sender generates a unique room ID and shares it securely with the recipient. 3. Both peers establish a WebRTC room and exchange encrypted chunks via a data channel to move files up to 5 GB without touching centralized
          storage.
        </p>
      </section>
    </div>
  );
}
