"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { BRAND_NAME } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasValidTokens, setHasValidTokens] = useState(false);

  useEffect(() => {
    // Extract tokens from URL hash (not search params)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1); // Remove the '#'
      const params = new URLSearchParams(hash);

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (accessToken && refreshToken && type === 'recovery') {
        // Set the session with the tokens from the URL hash
        const supabase = createBrowserSupabaseClient();
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        setHasValidTokens(true);
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Password updated successfully! You can now login with your new password.");

      // Redirect to login after success
      setTimeout(() => {
        router.push('/login?message=Password reset successful! Please sign in with your new password.');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  if (!hasValidTokens) {
    return (
      <Card className="w-full max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="text-destructive">
            Invalid Reset Link
          </CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request New Reset Link</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-md">
      <CardHeader>
        <CardTitle>
          {BRAND_NAME}
          <span className="block text-base font-normal text-muted-foreground">
            Set New Password
          </span>
        </CardTitle>
        <CardDescription>
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {message && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating…" : "Update Password"}
          </Button>
          <Button variant="link" asChild className="text-sm">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}