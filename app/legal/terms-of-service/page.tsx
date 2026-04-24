import Link from "next/link";
import { ArrowLeft, FileText, Shield, CreditCard, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
            NodeBN E-Commerce Platform
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Effective Date: April 24, 2026 • Last Updated: April 24, 2026
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Button variant="outline" size="sm" className="mb-4" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">1. Introduction</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                Welcome to NodeBN ("we," "us," or "our"), a comprehensive WhatsApp-based e-commerce platform that enables businesses to create online stores with seamless ordering capabilities. By accessing or using NodeBN's services ("Services"), you ("Merchant," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please discontinue use of our Services immediately.
              </p>
              <p>
                NodeBN provides a technology platform that connects merchants with customers through WhatsApp messaging, enabling streamlined order processing and payment collection. Our platform serves as an intermediary between merchants, customers, and authorized payment processors, facilitating secure transactions while maintaining compliance with applicable laws and regulations.
              </p>
            </div>
          </section>

          {/* Definitions */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">2. Definitions</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Platform Terms</h3>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-slate-700 dark:text-slate-300">Merchant</dt>
                      <dd className="text-slate-600 dark:text-slate-400">Individual or business entity operating a store on NodeBN</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700 dark:text-slate-300">Store</dt>
                      <dd className="text-slate-600 dark:text-slate-400">Online shop created by a Merchant on the NodeBN platform</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700 dark:text-slate-300">Customer</dt>
                      <dd className="text-slate-600 dark:text-slate-400">Individual purchasing products through a Merchant's Store</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Payment Terms</h3>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-slate-700 dark:text-slate-300">Order</dt>
                      <dd className="text-slate-600 dark:text-slate-400">Purchase request placed by a Customer</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700 dark:text-slate-300">Payment Gateway</dt>
                      <dd className="text-slate-600 dark:text-slate-400">Licensed third-party payment processors (Pocket, Visa/Mastercard)</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700 dark:text-slate-300">Platform Fee</dt>
                      <dd className="text-slate-600 dark:text-slate-400">Service fee charged by NodeBN (2.0% of transactions)</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Additional Terms</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-slate-700 dark:text-slate-300">Processing Fee</dt>
                  <dd className="text-slate-600 dark:text-slate-400">Fees charged by payment gateways for transaction processing (e.g., Pocket's 3.5%)</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700 dark:text-slate-300">Payout</dt>
                  <dd className="text-slate-600 dark:text-slate-400">Net amount transferred to Merchant after all fees and deductions</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700 dark:text-slate-300">Business Day</dt>
                  <dd className="text-slate-600 dark:text-slate-400">Monday through Friday, excluding Brunei public holidays</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Services */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">N</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">3. Services Provided</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">1</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Store Management</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Complete tools for creating and customizing online stores with product catalogs, categories, and inventory management</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="w-8 h-8 bg-green-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">2</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Order Processing</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Automated order management with WhatsApp integration for seamless customer communication</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="w-8 h-8 bg-purple-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">3</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Payment Integration</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Secure payment processing through licensed gateways with multiple payment methods</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">4</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Analytics & Support</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Comprehensive dashboard analytics and dedicated platform support</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Merchant Requirements */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">4. Merchant Eligibility and Registration</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Eligibility Requirements</h3>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-700 dark:text-slate-300 mb-3">To register and operate a store on NodeBN, Merchants must:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                      Be at least 18 years of age or a legally recognized business entity
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                      Provide accurate and verifiable business information
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                      Complete email verification during the registration process
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                      Maintain active business operations and valid contact information
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Compliance Obligations</h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>Legal Responsibility:</strong> Merchants are solely responsible for ensuring their products, services, and business practices comply with all applicable Brunei laws, regulations, and industry standards. This includes but is not limited to consumer protection laws, product safety standards, and fair trading practices.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">5. Payment Terms</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">5.1 Payment Processing</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  NodeBN integrates with licensed payment gateways and supports manual payment methods to facilitate secure transactions between Customers and Merchants. We currently support the following payment methods:
                </p>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Integrated Payment Gateways</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Automated processing with NodeBN fees (2.0% platform fee):
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <strong>Pocket:</strong> Brunei-based digital wallet and payment system supporting e-wallets
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <strong>Visa/Mastercard:</strong> International credit and debit card payments
                      </div>
                    </li>
                  </ul>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 mt-6">Manual Bank Transfer Options</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Direct bank transfers to merchant accounts (no NodeBN processing fees apply):
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <strong>BIBD:</strong> Bank Islam Brunei Darussalam
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <strong>BAIDURI:</strong> Baiduri Bank
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <strong>TAIB:</strong> Tabung Amanah Islam Brunei
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <strong>STANDARD CHARTERED:</strong> Standard Chartered Brunei
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">5.2 Transaction Flow</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <ol className="space-y-3 text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
                      Customer places an order through the Merchant's Store and selects payment method
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
                      Customer is securely redirected to the selected payment gateway
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
                      Payment gateway processes the transaction and collects applicable fees
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">4</span>
                      Upon successful payment, funds are held by the payment processor
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">5</span>
                      NodeBN coordinates payout to the Merchant after deducting platform fees
                    </li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">5.3 Fees and Charges</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      Pocket Payments
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Gateway Processing Fee:</span>
                        <span className="font-medium">3.5% of transaction</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NodeBN Platform Fee:</span>
                        <span className="font-medium">2.0% of transaction</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total Deduction:</span>
                        <span>5.5% of transaction</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      Visa/Mastercard Payments
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Gateway Processing Fee:</span>
                        <span className="font-medium">1.5-3.5% (varies)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NodeBN Platform Fee:</span>
                        <span className="font-medium">2.0% of transaction</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total Deduction:</span>
                        <span>Gateway fee + 2.0%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Example: Pocket Payment Calculation</h4>
                  <div className="bg-white dark:bg-slate-600 rounded p-4">
                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-3">For a BND 100.00 transaction:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Original Amount:</span>
                        <span className="font-mono">BND 100.00</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Pocket Fee (3.5%):</span>
                        <span className="font-mono">-BND 3.50</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>NodeBN Fee (2.0%):</span>
                        <span className="font-mono">-BND 2.00</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-green-600">
                        <span>Merchant Receives:</span>
                        <span className="font-mono">BND 94.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">5.4 Payout Process</h3>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800 mb-6">
                  <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    NodeBN Payout Guarantee
                  </h4>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p><strong>NodeBN Guarantee:</strong> NodeBN unconditionally guarantees that Merchants will receive payouts for all successful transactions processed through our platform. If a payout fails due to any reason within our control, NodeBN will assume full financial responsibility and ensure payment is made to the Merchant.</p>
                    <p><strong>Payment Gateway Role:</strong> Payment gateways such as Pocket are not liable for merchant payouts. Pocket provides payment processing services, transaction authorization, and fee deduction only. All payout responsibilities, including fund transfers and settlement, are managed exclusively by NodeBN.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Payout Schedule</h4>
                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                      <li>• Processed within 2-3 business days after payment confirmation</li>
                      <li>Business days: Monday-Friday (excluding Brunei public holidays)</li>
                      <li>Payments made via BIBD bank transfer to merchant's designated account</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Payout Details</h4>
                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                      <li>• All payouts in Brunei Dollars (BND)</li>
                      <li>• No minimum payout threshold</li>
                      <li>• Currency conversion handled by payment gateway if applicable</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">5.5 Chargebacks and Disputes</h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <p className="mb-2"><strong>Merchant Responsibility:</strong> Merchants are financially responsible for chargebacks initiated by customers through payment gateways.</p>
                      <p><strong>Process:</strong> NodeBN will deduct chargeback amounts plus associated fees from future payouts. Merchants must provide supporting evidence within 7 business days of notification.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">5.6 Payment Security</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>• Industry-standard AES-256 encryption for all transactions</li>
                  <li>• PCI DSS compliance maintained through licensed payment gateways</li>
                  <li>• Merchants must never store or transmit sensitive payment card information</li>
                  <li>• All payment data processing handled securely by authorized gateways</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Merchant Responsibilities */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">6. Merchant Responsibilities</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Product & Service Obligations</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Provide accurate product descriptions, pricing, and availability</li>
                    <li>• Maintain truthful advertising and marketing materials</li>
                    <li>• Ensure products meet quality and safety standards</li>
                    <li>• Honor all published pricing and promotional offers</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Order Fulfillment</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Process orders within reasonable timeframes</li>
                    <li>• Provide accurate delivery estimates</li>
                    <li>• Maintain adequate inventory levels</li>
                    <li>• Handle returns and refunds professionally</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Customer Service</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Respond to customer inquiries within 24 hours</li>
                    <li>• Resolve disputes and complaints promptly</li>
                    <li>• Maintain professional communication standards</li>
                    <li>• Provide order tracking and status updates</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Security & Compliance</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Maintain secure account access and credentials</li>
                    <li>• Report unauthorized account activity immediately</li>
                    <li>• Comply with Brunei laws and regulations</li>
                    <li>• Protect customer data and privacy</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">7. Prohibited Activities</h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-300 mb-4 font-medium">
                The following activities are strictly prohibited on the NodeBN platform:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Selling illegal, counterfeit, or prohibited items
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Misleading customers about product quality or availability
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Violating intellectual property rights of others
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Using the platform for fraudulent or deceptive activities
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Circumventing payment processes or attempting to avoid fees
                  </li>
                </ul>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700 p-4 rounded">
                  <strong>Consequences:</strong> Violation of these prohibitions may result in immediate account suspension, removal of listings, forfeiture of fees, and potential legal action.
                </div>
              </div>
            </div>
          </section>

          {/* Legal Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Intellectual Property */}
            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">8. Intellectual Property</h2>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p><strong>NodeBN Rights:</strong> NodeBN retains all intellectual property rights to the platform, including software, logos, trademarks, and proprietary technology.</p>
                <p><strong>Merchant Rights:</strong> Merchants retain ownership of their product images, descriptions, and branding materials.</p>
                <p><strong>License Grant:</strong> By using NodeBN, Merchants grant NodeBN a limited license to display and distribute their content for platform operations.</p>
              </div>
            </section>

            {/* Termination */}
            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">9. Termination</h2>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p><strong>Merchant Termination:</strong> Merchants may terminate their account with 30 days written notice to NodeBN.</p>
                <p><strong>NodeBN Termination:</strong> NodeBN reserves the right to terminate accounts immediately for Terms violations.</p>
                <p><strong>Settlement:</strong> Upon termination, Merchants must settle all outstanding fees, payouts, and obligations.</p>
              </div>
            </section>

            {/* Liability */}
            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">10. Limitation of Liability</h2>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p><strong>Scope:</strong> NodeBN's liability is limited to direct damages only, excluding indirect, incidental, or consequential losses.</p>
                <p><strong>Maximum Liability:</strong> Limited to the total platform fees paid by the Merchant in the preceding 3 months.</p>
                <p><strong>Third-Party Actions:</strong> NodeBN is not liable for payment gateway failures, third-party service interruptions, or external factors.</p>
                <p><strong>Payment Gateway Liability:</strong> Pocket and other payment gateways are not liable for transaction failures, processing delays, chargebacks, fraud, or any issues arising from their systems or third-party banking networks. Payment gateways provide processing services and fee collection only - they have no responsibility for merchant payouts. Merchants acknowledge that payment processing is subject to the terms and conditions of each payment gateway.</p>
                <p><strong>NodeBN Payout Responsibility:</strong> Notwithstanding the above, NodeBN assumes complete liability for ensuring merchant payouts are delivered successfully. The payout guarantee in Section 5.4 supersedes any payment gateway limitations.</p>
              </div>
            </section>

            {/* Indemnification */}
            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">11. Indemnification</h2>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p>Merchants agree to indemnify, defend, and hold NodeBN harmless from any claims, damages, or liabilities arising from:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Product defects or safety issues</li>
                  <li>Customer disputes or legal claims</li>
                  <li>Violation of applicable laws or regulations</li>
                  <li>Misuse of the platform or services</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Privacy & Legal */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Data Privacy */}
            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">12. Data Privacy</h2>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p>• NodeBN complies with Brunei Personal Data Protection Act</p>
                <p>• Customer data used solely for order processing</p>
                <p>• Merchants responsible for their own data practices</p>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">13. Dispute Resolution</h2>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p>• Disputes resolved through negotiation first</p>
                <p>• Governing law: Brunei Darussalam</p>
                <p>• Legal actions must be filed within 1 year</p>
              </div>
            </section>

            {/* Amendments */}
            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">14. Amendments</h2>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p>• NodeBN may update Terms with 30 days notice</p>
                <p>• Updates posted on platform and emailed</p>
                <p>• Continued use implies acceptance</p>
              </div>
            </section>
          </div>

          {/* Contact & Agreement */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 text-center">15. Contact Information</h2>
            <div className="text-center space-y-4">
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg max-w-md mx-auto">
                <div className="text-center">
                  <strong className="text-slate-900 dark:text-white text-lg">Email Support</strong>
                  <p className="text-slate-600 dark:text-slate-300 text-xl font-medium mt-2">nodebrunei@gmail.com</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Agreement to Terms</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  By accessing or using the NodeBN platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and NodeBN.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Last Updated:</strong> April 24, 2026 • <strong>Effective Date:</strong> April 24, 2026
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center space-y-4">
          <div className="flex justify-center">
            <Button variant="outline" size="lg" className="px-8" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to NodeBN
              </Link>
            </Button>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
            <p>© 2026 NodeBN. All rights reserved.</p>
            <p>Questions about these terms? <Link href="mailto:support@nodebn.com" className="text-blue-600 hover:underline">Contact our support team</Link></p>
          </div>
        </footer>
      </div>
    </div>
  );
}