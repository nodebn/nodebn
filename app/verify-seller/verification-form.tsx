"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { BRAND_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SellerVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyToken = useCallback(async (token: string) => {
    try {

      // First verify the token
      const verifyResponse = await fetch('/api/verify-seller-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Token verification failed');
      }

      // Token is valid, now get the stored registration details and create account
      const completeResponse = await fetch('/api/complete-seller-setup-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const completeData = await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(completeData.error || 'Account creation failed');
      }

      setVerified(true);
      setMessage('Your email has been verified! You may now login to your seller account.');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?message=Account created successfully! Please sign in.');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }, [router]);

  useEffect(() => {
    console.log('🔍 VERIFICATION DEBUG: Page loaded');
    console.log('🔍 VERIFICATION DEBUG: Token from URL:', token);

    if (!token) {
      setError('Verification token is missing. Please check your email link.');
      setVerifying(false);
      return;
    }

    // Verify the token
    verifyToken(token);
  }, [token, verifyToken]);

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-border/80 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive">Verification Failed</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-green-600">
              {BRAND_NAME}
              <span className="block text-base font-normal text-muted-foreground">
                Email Verified!
              </span>
            </CardTitle>
            <CardDescription>
              Your seller account has been created successfully. You may now login to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                {message}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Continue to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // This should never be reached since we either show verified success or error
  return null;
}