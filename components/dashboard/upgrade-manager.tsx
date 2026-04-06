"use client";

import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Copy, CreditCard, Zap } from "lucide-react";

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

const UpgradeManager = memo(function UpgradeManager({ subscription }: UpgradeManagerProps) {
  const currentPlan = subscription.plan.toLowerCase();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUpgrade = (planName: string) => {
    const plan = plans.find(p => p.name === planName);
    if (!plan || plan.name === "Free") return;

    setSelectedPlan(planName);
    setPaymentDialogOpen(true);
  };



  const handleCheckStatus = () => {
    // Dispatch event to refresh subscription in dashboard
    window.dispatchEvent(new CustomEvent('subscription-updated'));
    // Show feedback
    alert('Subscription status checked. If your payment was processed, the plan will update shortly.');
  };

  const handleCopyPaymentDetails = async () => {
    await navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedPlanData = plans.find(p => p.name === selectedPlan);

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Upgrade Your Plan
              {subscription && (
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  Current: {subscription.plan}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Unlock more features and grow your business with premium plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative border-2 transition-all duration-200 ${
                    plan.popular
                      ? "border-blue-500 shadow-lg scale-105 bg-blue-50/50 dark:bg-blue-950/50"
                      : plan.name.toLowerCase() === currentPlan
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/50"
                      : "border-gray-200 bg-white dark:bg-gray-800 hover:shadow-md"
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

                  <CardHeader className="pb-4">
                    <div className="text-center">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-3">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.slice(0, 6).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 6 && (
                        <li className="text-sm text-gray-500">
                          +{plan.features.length - 6} more features...
                        </li>
                      )}
                    </ul>
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
                      disabled={plan.name === "Free" || plan.name.toLowerCase() === currentPlan}
                    >
                      {plan.name.toLowerCase() === currentPlan ? "Current Plan" : plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <CreditCard className="w-5 h-5" />
              Payment Instructions
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              All upgrades are processed via bank transfer. Copy the details below after selecting a plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Bank</p>
                  <p className="text-gray-700 dark:text-gray-300">{BANK_DETAILS.bank}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Account Number</p>
                  <p className="font-mono text-gray-700 dark:text-gray-300">{BANK_DETAILS.accountNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Account Holder</p>
                  <p className="text-gray-700 dark:text-gray-300">{BANK_DETAILS.accountHolder}</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>Send receipts to WhatsApp:</strong> <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">+6738824395</span></p>
              <p><strong>Include:</strong> Payment receipt screenshot, your email, and desired plan</p>
              <p><strong>Activation:</strong> Plan activated within 24 hours</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p>Questions about plans? Contact us via WhatsApp: <strong>+6738824395</strong></p>
              <p className="mt-2">Need a custom enterprise solution? Let&apos;s discuss your specific needs.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Upgrade to {selectedPlan || 'Plan'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
              {selectedPlanData?.price}{selectedPlanData?.period}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                Payment Details
              </h4>
              <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <p><span className="font-medium">Bank:</span> {BANK_DETAILS.bank}</p>
                <p><span className="font-medium">Account:</span> {BANK_DETAILS.accountNumber}</p>
                <p><span className="font-medium">Holder:</span> {BANK_DETAILS.accountHolder}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Send receipt to WhatsApp: <span className="font-mono bg-gray-100 dark:bg-gray-600 px-1 rounded">+6738824395</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCopyPaymentDetails}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="sm"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Details
                </>
              )}
            </Button>
            <Button
              onClick={handleCheckStatus}
              variant="outline"
              className="px-3 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950"
              size="sm"
            >
              Check Status
            </Button>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              className="px-4 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              size="sm"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export { UpgradeManager };