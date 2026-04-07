"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    authError ? "Authentication failed. Try again." : null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("🔘 Sign in button clicked, setting loading state");
    setMessage(null);
    setLoading(true);
    console.log("✅ Loading state set to:", loading);

    const supabase = createBrowserSupabaseClient();

    try {
      if (mode === "sign-in") {
    console.log("🔐 Attempting sign in for:", email);
    console.log("⏳ Making authentication request...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("📡 Authentication response received");

    if (error) {
      console.error("❌ Sign in error:", error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    console.log("✅ Authentication successful, preparing redirect");

        console.log("✅ Sign in successful, redirecting to:", next);
        console.log("User data:", data.user);

        // Try redirect first, then refresh
        try {
          await router.push(next);
          console.log("✅ Router.push completed");
        } catch (redirectError) {
          console.error("❌ Router.push failed:", redirectError);
          // Fallback to window.location
          window.location.href = next;
          return;
        }

        // Small delay before refresh
        setTimeout(() => {
          console.log("🔄 Refreshing page");
          router.refresh();
        }, 100);

        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
        if (error) {
          console.error("❌ Sign up error:", error);
          setMessage(error.message);
          setLoading(false);
          return;
        }
      setMessage(
        "Check your email to confirm your account, or sign in if confirmations are disabled.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-border/80 shadow-md">
        <CardHeader>
          <CardTitle>
            {BRAND_NAME}
            <span className="block text-base font-normal text-muted-foreground">
              Seller account
            </span>
          </CardTitle>
          <CardDescription>
            {mode === "sign-in"
              ? `Sign in to manage your store and products on ${BRAND_NAME}.`
              : `Create an account to open your ${BRAND_NAME} seller dashboard.`}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message ? (
              <p
                className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                role="status"
              >
                {message}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "sign-in" ? "Signing in…" : "Creating account…"}
                </>
              ) : mode === "sign-in" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
            {mode === "sign-in" ? (
              <Button variant="ghost" asChild className="w-full text-muted-foreground">
                <Link href="/seller-register">Need an account? Sign up</Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setMode("sign-in");
                  setMessage(null);
                }}
              >
                Already have an account? Sign in
              </Button>
            )}
            <Button variant="link" asChild className="text-sm">
              <Link href="/forgot-password">Forgot password?</Link>
            </Button>
            <Button variant="link" asChild className="text-sm">
              <Link href="/">Back to home</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
