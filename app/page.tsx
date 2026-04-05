import Link from "next/link";

import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-100 via-background to-zinc-50 dark:from-zinc-950 dark:via-background dark:to-zinc-950">
      <header className="border-b border-black/[0.06] bg-white/70 px-4 py-4 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/70 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight">{BRAND_NAME}</span>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/login">Seller sign in</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 pb-16 pt-12 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          WhatsApp commerce
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          {BRAND_NAME}
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          {BRAND_TAGLINE}
        </p>
        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="h-12 rounded-xl text-base" asChild>
            <Link href="/login">Open dashboard</Link>
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl text-base"
            asChild
          >
            <Link href="/login">Create account</Link>
          </Button>
        </div>
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {BRAND_NAME}
      </footer>
    </div>
  );
}
