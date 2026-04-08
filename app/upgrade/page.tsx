"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

// Bank details for manual transfers
const BANK_DETAILS = {
  bank: "BIBD",
  accountNumber: "00015010066867",
  accountHolder: "Cherry Digital Enterprise",
};

const plans = [
  {
    name: "Free",
    price: "BND 0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "1 store",
      "25 products",
      "5 categories",
      "Basic services",
      "1 promo code",
      "1 payment method",
      "Platform branding",
      "Email support",
    ],
    limitations: ["Limited products", "Platform branding"],
    cta: "Current Plan",
    popular: false,
  },
  {
    name: "Starter",
    price: "BND 19",
    period: "/month",
    description: "For small businesses",
    features: [
      "1 store",
      "50 products",
      "15 categories",
      "Services",
      "3 promo codes",
      "2 payment methods",
      "Custom logo",
      "Email support",
    ],
    limitations: [],
    cta: "Upgrade via Bank Transfer",
    popular: false,
  },
  {
    name: "Professional",
    price: "BND 49",
    period: "/month",
    description: "Most popular choice",
    features: [
      "3 stores",
      "100 products",
      "30 categories",
      "Advanced features",
      "10 promo codes",
      "5 payment methods",
      "Priority support",
      "Bulk operations",
    ],
    limitations: [],
    cta: "Upgrade via Bank Transfer",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "BND 139",
    period: "/month",
    description: "For growing enterprises",
    features: [
      "10 stores",
      "Unlimited products",
      "Unlimited categories",
      "All features",
      "Unlimited promos & payments",
      "Dedicated support",
      "Custom integrations",
      "Advanced analytics",
    ],
    limitations: [],
    cta: "Upgrade via Bank Transfer",
    popular: false,
  },
];

export default function UpgradePage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const handleUpgrade = async (planName: string) => {
    const plan = plans.find(p => p.name === planName);
    if (!plan || plan.name === "Free") return;

    const message = `
Upgrade to ${planName} Plan

Amount: ${plan.price}${plan.period}
Bank Transfer Details:
Bank: ${BANK_DETAILS.bank}
Account Number: ${BANK_DETAILS.accountNumber}
Account Holder: ${BANK_DETAILS.accountHolder}

Instructions:
1. Transfer the amount to the above account
2. Send payment receipt to WhatsApp: +6738824395
3. Include your email and desired plan
4. We'll activate your plan within 24 hours

Thank you for choosing NodeBN!
    `.trim();

    // Copy to clipboard and show WhatsApp option
    navigator.clipboard.writeText(message);
    alert(`Payment instructions copied! Transfer ${plan.price}${plan.period} to:\n\nBank: ${BANK_DETAILS.bank}\nAccount: ${BANK_DETAILS.accountNumber}\n\nThen send receipt to WhatsApp: +6738824395\n\nWe'll manually activate your plan within 24 hours after payment confirmation.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock more features and grow your business with our flexible pricing plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-blue-500 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.limitations.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Limitations:</p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : plan.name === "Free"
                      ? "bg-gray-600 hover:bg-gray-700"
                      : ""
                  }`}
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.name === "Free"}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Instructions</h3>
            <p className="text-blue-800 mb-4">
              All upgrades are processed via bank transfer. Click &ldquo;Upgrade&rdquo; to get payment details.
            </p>
            <div className="text-left text-sm text-blue-700 space-y-1">
              <p><strong>Bank:</strong> {BANK_DETAILS.bank}</p>
              <p><strong>Account Number:</strong> {BANK_DETAILS.accountNumber}</p>
              <p><strong>Account Holder:</strong> {BANK_DETAILS.accountHolder}</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Send payment receipts to WhatsApp: <a href="https://wa.me/6738824395" target="_blank" className="text-blue-600 hover:underline">+6738824395</a>
          </p>
          <p className="text-sm text-gray-500">
            Questions? Contact us via WhatsApp above
          </p>
        </div>
      </div>
    </div>
  );
}