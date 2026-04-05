"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
      "10 products",
      "Basic categories & services",
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
      "20 products",
      "Categories & services",
      "3 promo codes",
      "2 payment methods",
      "Custom logo",
      "Email support",
    ],
    limitations: [],
    cta: "Upgrade Now",
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
      "Advanced features",
      "10 promo codes",
      "5 payment methods",
      "Priority support",
      "Bulk operations",
    ],
    limitations: [],
    cta: "Upgrade Now",
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
      "All features",
      "Unlimited promos & payments",
      "Dedicated support",
      "Custom integrations",
      "Advanced analytics",
    ],
    limitations: [],
    cta: "Upgrade Now",
    popular: false,
  },
];

type UpgradeManagerProps = {
  subscription: { plan: string; status: string };
};

export function UpgradeManager({ subscription }: UpgradeManagerProps) {
  const currentPlan = subscription.plan.toLowerCase();

  const handleUpgrade = (planName: string) => {
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

    navigator.clipboard.writeText(message);
    alert(`Payment instructions copied! Transfer ${plan.price}${plan.period} to:\n\nBank: ${BANK_DETAILS.bank}\nAccount: ${BANK_DETAILS.accountNumber}\n\nThen send receipt to WhatsApp: +6738824395`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Upgrade Your Plan
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              Current: {subscription.plan}
            </Badge>
          </CardTitle>
          <CardDescription>
            Unlock more features and grow your business with premium plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Instructions</h3>
            <p className="text-blue-800 mb-3">
              All upgrades are processed via bank transfer. Click &ldquo;Upgrade Now&rdquo; to get payment details.
            </p>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Bank:</strong> {BANK_DETAILS.bank}</p>
              <p><strong>Account Number:</strong> {BANK_DETAILS.accountNumber}</p>
              <p><strong>Account Holder:</strong> {BANK_DETAILS.accountHolder}</p>
            </div>
            <p className="text-blue-800 mt-3 text-sm">
              Send receipts to WhatsApp: <strong>+6738824395</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.popular
                ? "border-blue-500 shadow-lg scale-105"
                : plan.name.toLowerCase() === currentPlan
                ? "border-green-500 bg-green-50"
                : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            {plan.name.toLowerCase() === currentPlan && (
              <Badge className="absolute -top-3 right-4 bg-green-500">
                Current Plan
              </Badge>
            )}

            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>
              <div className="mt-3">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-600 text-sm">{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {plan.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
                {plan.features.length > 5 && (
                  <li className="text-sm text-gray-500">
                    +{plan.features.length - 5} more features...
                  </li>
                )}
              </ul>
              {plan.limitations.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-1">Limitations:</p>
                  {plan.limitations.map((limitation, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      • {limitation}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700"
                    : plan.name.toLowerCase() === currentPlan
                    ? "bg-green-600 hover:bg-green-700"
                    : plan.name === "Free"
                    ? "bg-gray-600 hover:bg-gray-700"
                    : ""
                }`}
                onClick={() => handleUpgrade(plan.name)}
                disabled={plan.name.toLowerCase() === currentPlan || plan.name === "Free"}
              >
                {plan.name.toLowerCase() === currentPlan ? "Current Plan" : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-600">
            <p>Questions about plans? Contact us via WhatsApp: <strong>+6738824395</strong></p>
            <p className="mt-2">Need a custom enterprise solution? Let&apos;s discuss your specific needs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}