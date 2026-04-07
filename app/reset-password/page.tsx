import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}