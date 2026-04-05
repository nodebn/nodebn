import Link from "next/link";

import { BRAND_NAME } from "@/lib/brand";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <DashboardHeader />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          ← {BRAND_NAME} home
        </Link>
      </footer>
    </div>
  );
}
