"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, ShoppingBag } from "lucide-react";

import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if this is a password reset callback (has auth tokens in hash)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('access_token') && hash.includes('type=recovery')) {
        // This is a password reset callback - redirect to reset-password page
        const newUrl = window.location.href.replace(window.location.pathname, '/reset-password');
        window.location.href = newUrl;
      }
    }
  }, []);
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] bg-gradient-to-b from-zinc-100/90 via-[hsl(var(--background))] to-zinc-50/80 dark:from-zinc-950 dark:via-[hsl(var(--background))] dark:to-zinc-950">
      {/* Header */}
      <header className="border-b border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/70">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {BRAND_NAME}
              </span>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 pb-16 pt-12 text-center">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
          <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>

        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          WhatsApp commerce platform
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          {BRAND_NAME}
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground max-w-sm">
          {BRAND_TAGLINE}
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <Button className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" asChild>
            <Link href="/login" className="flex items-center gap-2">
              Start Selling Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-border hover:bg-muted/50"
            asChild
          >
            <Link href="/login">Open dashboard</Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          No setup fees
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] bg-white/40 py-6 text-center text-xs text-muted-foreground backdrop-blur-sm dark:border-white/[0.08] dark:bg-zinc-950/40">
        © {new Date().getFullYear()} {BRAND_NAME}
      </footer>
    </div>
  );
}
