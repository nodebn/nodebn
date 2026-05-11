import Link from "next/link";
import { ArrowLeft, RotateCcw, Clock, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <RotateCcw className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Refund Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
            NodeBN E-Commerce Platform
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Effective Date: April 28, 2026 • Last Updated: April 28, 2026
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
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">1. Refund Commitment</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                At NodeBN, we strive to ensure customer satisfaction with every purchase. Our refund policy is designed to be fair, transparent, and customer-friendly while protecting the interests of our merchant partners.
              </p>
              <p>
                Refunds are processed through our platform in coordination with payment gateways and merchants. We aim to resolve refund requests within 5-7 business days of approval.
              </p>
            </div>
          </section>

          {/* Refund Eligibility */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">2. Refund Eligibility</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">Standard Refund Window</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-green-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">7</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">7 Days for Physical Products</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">From the date of delivery or pickup</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-green-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">24</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">24 Hours for Digital Products</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">From the time of delivery/access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-green-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">1</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">1 Hour for Services</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">Before service commencement</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">Eligible Refund Reasons</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Product received damaged or defective
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Wrong item delivered
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Product significantly different from description
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Non-delivery of ordered item
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Service not performed as agreed
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Digital product access issues
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Buyer's remorse (subject to merchant approval)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Merchant-initiated cancellations
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Non-Refundable Items */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">3. Non-Refundable Items</h2>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-300 mb-4 font-medium">
                The following items and situations are generally not eligible for refunds:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Items past the refund eligibility period
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Used, worn, or damaged items (beyond normal inspection)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Perishable goods or food items
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Custom-made or personalized items
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Digital downloads after access
                  </li>
                </ul>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Gift cards and vouchers
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Services already performed or commenced
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Items with removed security tags or labels
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Change of mind without valid reason
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    Items affected by misuse or abuse
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Refund Process */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <RotateCcw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">4. Refund Process</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Step-by-Step Refund Process</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Initiate Refund Request</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">Contact the merchant directly via WhatsApp with photos/evidence within the eligibility period</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Merchant Review</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">Merchant evaluates the request and may request additional information or inspection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">NodeBN Mediation</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">If merchant denies refund, customer can escalate to NodeBN for review within 48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Refund Processing</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">Approved refunds processed through original payment method within 5-7 business days</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Merchant Responsibilities</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Respond to refund requests within 24 hours</li>
                    <li>• Provide clear refund decision with reasoning</li>
                    <li>• Arrange return shipping if applicable</li>
                    <li>• Process approved refunds promptly</li>
                  </ul>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Customer Responsibilities</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Provide clear photos/evidence of issues</li>
                    <li>• Return items in original condition</li>
                    <li>• Use original packaging when possible</li>
                    <li>• Allow reasonable inspection time</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Processing Times */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">5. Processing Times & Methods</h2>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">24h</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Merchant Response</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Initial review period</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">48h</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">NodeBN Escalation</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">If merchant denies</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">5-7d</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Refund Processing</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">After approval</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Refund Methods</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Original Payment Method</h4>
                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                      <li>• Pocket: 2-3 business days</li>
                      <li>• Visa/Mastercard: 5-10 business days</li>
                      <li>• Bank Transfer: 3-5 business days</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Alternative Methods</h4>
                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                      <li>• Store Credit: Instant processing</li>
                      <li>• Bank Transfer: 1-2 business days</li>
                      <li>• Gift Cards: Subject to availability</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Return Shipping */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">6. Return Shipping & Fees</h2>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3">Merchant Pays Return Shipping</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                    <li><strong>Defective Items:</strong> Full refund including return shipping</li>
                    <li><strong>Wrong Items:</strong> Merchant covers all shipping costs</li>
                    <li><strong>Merchant Error:</strong> Free return and full refund</li>
                    <li><strong>Missing Items:</strong> Merchant bears all costs</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">Customer Pays Return Shipping</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                    <li><strong>Buyer's Remorse:</strong> Customer pays return shipping</li>
                    <li><strong>Changed Mind:</strong> Return shipping at customer's expense</li>
                    <li><strong>Size/Color Issues:</strong> Customer bears shipping costs</li>
                    <li><strong>Damaged by Customer:</strong> Customer pays return fees</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Shipping Fee Determination:</strong> The responsible party for return shipping costs is determined based on the refund reason and merchant's return policy. NodeBN can mediate disputes over shipping fee responsibility.
                </p>
              </div>
            </div>
          </section>

          {/* Special Cases */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">7. Special Cases & Exceptions</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">Exceptional Circumstances</h3>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <p><strong>Merchant-Initiated Refunds:</strong> Merchants may offer refunds at their discretion beyond standard policy, including goodwill gestures and customer satisfaction initiatives.</p>
                  <p><strong>Platform Errors:</strong> If refunds are denied due to NodeBN platform issues, we guarantee full refund processing and may provide additional compensation.</p>
                  <p><strong>Force Majeure:</strong> Natural disasters, political unrest, or other uncontrollable events may extend refund processing times with customer notification.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Chargebacks</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Chargebacks initiated through payment gateways are handled separately and may incur additional fees. Merchants are responsible for chargeback resolution.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Partial Refunds</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Partial refunds may be offered for damaged goods, missing parts, or service deficiencies. Amount determined by merchant assessment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg shadow-sm border border-green-200 dark:border-green-800 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 text-center">8. Refund Support</h2>
            <div className="text-center space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">For Customers</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Contact the merchant directly first. If unresolved, escalate to NodeBN support.
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">nodebrunei@gmail.com</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Response within 24 hours</p>
                </div>

                <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">For Merchants</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Get guidance on refund processing and dispute resolution.
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">nodebrunei@gmail.com</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dedicated merchant support</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Refund Request Template</h3>
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded text-left text-sm">
                  <p><strong>Subject:</strong> Refund Request - Order #[Order Number]</p>
                  <br />
                  <p>Dear [Merchant Name],</p>
                  <br />
                  <p>I am requesting a refund for the following order:</p>
                  <p>• Order Number: [Order Number]</p>
                  <p>• Purchase Date: [Date]</p>
                  <p>• Items: [Item Description]</p>
                  <p>• Reason: [Brief explanation with photos if applicable]</p>
                  <br />
                  <p>Please let me know if you need any additional information.</p>
                  <br />
                  <p>Best regards,</p>
                  <p>[Your Name]</p>
                  <p>[Your Contact Information]</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Important Notes</h3>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <p>• All refund requests must be made within the eligibility period</p>
                  <p>• Provide clear evidence (photos, videos) for damaged or incorrect items</p>
                  <p>• Refunds are processed only after items are returned and inspected (if applicable)</p>
                  <p>• NodeBN acts as a mediator and may intervene in disputed refund cases</p>
                  <p>• Final refund decisions rest with the merchant, subject to platform policy compliance</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                  <strong>Last Updated:</strong> April 28, 2026 • <strong>Effective Date:</strong> April 28, 2026
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
            <p>
              <Link href="/legal/terms-of-service" className="hover:underline">Terms of Service</Link> •
              <Link href="/legal/privacy-policy" className="hover:underline ml-2">Privacy Policy</Link> •
              <Link href="mailto:nodebrunei@gmail.com" className="text-green-600 hover:underline ml-2">Contact Refund Team</Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}