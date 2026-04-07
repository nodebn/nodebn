import type { Metadata } from "next";
import { Suspense } from "react";

import { SellerRegistrationForm } from "./registration-form";

export const metadata: Metadata = {
  title: "Become a Seller",
  description: "Join NodeBN and start selling on WhatsApp today.",
};

export default function SellerRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <SellerRegistrationForm />
    </Suspense>
  );
}