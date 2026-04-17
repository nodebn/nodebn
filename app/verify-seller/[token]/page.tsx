import { Suspense } from 'react';
import { SellerVerificationForm } from '../verification-form';

export default function VerifySellerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading verification…
        </div>
      }
    >
      <SellerVerificationForm />
    </Suspense>
  );
}