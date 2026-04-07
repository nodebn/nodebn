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

export function CompleteInvitationForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasValidTokens, setHasValidTokens] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Extract tokens from URL hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1); // Remove the '#'
      const params = new URLSearchParams(hash);

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      const userEmail = params.get('email');

      if (accessToken && refreshToken && type === 'invite') {
        // Set the session with the tokens from the URL hash
        const supabase = createBrowserSupabaseClient();
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        setHasValidTokens(true);
        if (userEmail) setEmail(userEmail);
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

      setMessage("Account setup complete! Welcome to NodeBN.");

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete account setup");
    } finally {
      setLoading(false);
    }
  }

  if (!hasValidTokens) {
    return (
      <Card className="w-full max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="text-destructive">
            Invalid Invitation Link
          </CardTitle>
          <CardDescription>
            This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Back to Home</Link>
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
            Complete Your Account
          </span>
        </CardTitle>
        <CardDescription>
          Welcome! Set up your password to access your NodeBN seller dashboard.
          {email && <span className="block mt-2 text-sm">Email: {email}</span>}
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting up account…" : "Complete Account Setup"}
          </Button>
          <Button variant="link" asChild className="text-sm">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}