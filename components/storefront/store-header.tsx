"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { BRAND_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";



export type StoreBranding = {
  name: string;
  description: string | null;
  logo_url: string | null;
};

type StoreHeaderProps = StoreBranding;

export function StoreHeader({ name, description, logo_url }: StoreHeaderProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = name;
    const text =
      description?.trim() ||
      `Shop ${name} on ${BRAND_NAME} — order on WhatsApp.`;

    const nav = typeof globalThis !== "undefined" ? globalThis.navigator : null;

    async function copyLink() {
      if (!nav?.clipboard?.writeText) return;
      await nav.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }

    try {
      if (nav && "share" in nav && typeof nav.share === "function") {
        await nav.share({ title, text, url });
        return;
      }
      await copyLink();
    } catch (err) {
      const e = err as { name?: string };
      if (e?.name === "AbortError") return;
      try {
        await copyLink();
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/80 shadow-sm shadow-black/[0.03] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-zinc-950/80 dark:shadow-black/20">
      <div className="mx-auto max-w-6xl px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-start gap-4 sm:items-center">
              <div
                className={cn(
                  "relative mx-auto flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-inner ring-1 ring-black/5 dark:from-zinc-800 dark:to-zinc-900 dark:ring-white/10 sm:mx-0 sm:size-16 sm:rounded-2xl",
                )}
              >
              {logo_url ? (
                <Image
                  src={logo_url}
                  alt={name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-2xl font-semibold tracking-tight text-zinc-500 dark:text-zinc-400">
                  {name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5 text-center sm:pt-0 sm:text-left">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-balance font-semibold tracking-tight text-[1.65rem] leading-tight text-foreground sm:text-3xl">
                    {name}
                  </h1>
                  {description ? (
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                      {description}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-2 rounded-full border-black/10 bg-white/80 px-4 dark:border-white/15 dark:bg-zinc-900/80"
                  onClick={() => void handleShare()}
                >
                  {copied ? (
                    <>
                      <Check className="size-4 text-emerald-600" aria-hidden />
                      Link copied
                    </>
                  ) : (
                    <>
                      <Share2 className="size-4" aria-hidden />
                      Share store
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
