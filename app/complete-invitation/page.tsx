import type { Metadata } from "next";
import { Suspense } from "react";

import { CompleteInvitationForm } from "./complete-invitation-form";

export const metadata: Metadata = {
  title: "Complete Your Account",
};

export default function CompleteInvitationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <CompleteInvitationForm />
      </Suspense>
    </div>
  );
}