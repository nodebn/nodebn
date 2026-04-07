import Link from "next/link";
import { ArrowRight, Check, MessageCircle, ShoppingBag, Zap, Users, Star, Phone } from "lucide-react";

import { BRAND_NAME, BRAND_TAGLINE, BRAND_DESCRIPTION } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {BRAND_NAME}
              </span>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-slate-900 dark:to-purple-950/20">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300">
                🚀 WhatsApp Commerce Platform
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl lg:text-7xl">
                Sell on{" "}
                <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  WhatsApp
                </span>
                <br />
                with Beautiful Stores
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                Create stunning storefronts, manage inventory, and process orders seamlessly through WhatsApp.
                No coding required - just your products and customers.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" asChild>
                  <Link href="/seller-register" className="flex items-center gap-2">
                    Start Selling Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 rounded-xl border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" asChild>
                  <Link href="#features" className="flex items-center gap-2">
                    View Demo Store
                    <ShoppingBag className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                ✨ No setup fees • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Trusted by sellers worldwide
              </p>
              <div className="mt-8 flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">4.9/5 rating</span>
                </div>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  1,000+ stores created
                </div>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  50,000+ orders processed
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-slate-50 dark:bg-slate-900/50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                Everything you need to sell online
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Powerful features designed for modern sellers who want to focus on their business.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">Beautiful Storefronts</CardTitle>
                  <CardDescription>
                    Create stunning product pages with high-quality images, detailed descriptions, and professional layouts.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">WhatsApp Orders</CardTitle>
                  <CardDescription>
                    Receive and manage orders directly through WhatsApp. No more email threads or complex order forms.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl">Inventory Management</CardTitle>
                  <CardDescription>
                    Track stock levels, manage variants, and get notified when products run low. Never sell out unexpectedly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-xl">Customer Management</CardTitle>
                  <CardDescription>
                    Keep track of customer information, order history, and preferences to provide personalized service.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-xl">Mobile Optimized</CardTitle>
                  <CardDescription>
                    Your store looks perfect on all devices. Customers can browse and order from their phones seamlessly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <Check className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="text-xl">No Setup Required</CardTitle>
                  <CardDescription>
                    Get started in minutes with our intuitive dashboard. No technical skills or coding knowledge needed.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to start selling on WhatsApp?
              </h2>
              <p className="mt-4 text-xl text-blue-100">
                Join thousands of sellers who trust NodeBN for their online business.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-12 rounded-xl bg-white text-blue-600 hover:bg-gray-50 shadow-lg" asChild>
                  <Link href="/seller-register" className="flex items-center gap-2">
                    Start Your Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 rounded-xl border-white text-white hover:bg-white/10" asChild>
                  <Link href="/login">
                    Sign In to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">{BRAND_NAME}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {BRAND_DESCRIPTION}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Making WhatsApp commerce simple and beautiful for everyone.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100">Features</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100">Pricing</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100">Templates</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100">Help Center</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100">Community</Link></li>
                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-slate-100">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <Link href="#" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
