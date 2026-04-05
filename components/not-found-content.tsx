import Link from "next/link";

import { BRAND_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Store not found
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This storefront does not exist or is no longer available.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/">Back home</Link>
      </Button>
      <p className="text-xs text-muted-foreground">{BRAND_NAME}</p>
    </div>
  );
}
