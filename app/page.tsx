import Link from "next/link";
import { ArrowRight, MessageCircle, ShoppingBag } from "lucide-react";

import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-slate-900 dark:to-purple-950/20">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
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

        <p className="text-sm font-medium uppercase tracking-widest text-slate-600 dark:text-slate-400">
          WhatsApp commerce platform
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
          {BRAND_NAME}
        </h1>
        <p className="mt-4 text-pretty text-lg text-slate-600 dark:text-slate-400 max-w-sm">
          {BRAND_TAGLINE}
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <Button className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" asChild>
            <Link href="/seller-register" className="flex items-center gap-2">
              Start Selling Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            asChild
          >
            <Link href="/login">Open dashboard</Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          ✨ No setup fees • Free trial • Cancel anytime
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
