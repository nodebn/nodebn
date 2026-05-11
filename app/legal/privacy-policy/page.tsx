import Link from "next/link";
import { ArrowLeft, Shield, Eye, Lock, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Privacy Policy
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
              <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">1. Introduction</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                NodeBN ("we," "us," or "our") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our WhatsApp-based e-commerce platform.
              </p>
              <p>
                By accessing or using NodeBN, you agree to the collection and use of information in accordance with this policy. We will not use or share your information except as described in this Privacy Policy.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">2. Information We Collect</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">2.1 Information You Provide</h3>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                    <li>• <strong>Account Information:</strong> Name, email address, phone number, business details</li>
                    <li>• <strong>Store Information:</strong> Store name, description, contact details, product listings</li>
                    <li>• <strong>Order Information:</strong> Customer details, delivery addresses, order history</li>
                    <li>• <strong>Payment Information:</strong> Payment method details (processed securely by payment gateways)</li>
                    <li>• <strong>Communication Data:</strong> WhatsApp messages, customer service inquiries</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">2.2 Information We Collect Automatically</h3>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                    <li>• <strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                    <li>• <strong>Usage Data:</strong> Pages visited, time spent, click patterns, search queries</li>
                    <li>• <strong>Location Data:</strong> General location based on IP address (not precise GPS)</li>
                    <li>• <strong>Cookies and Tracking:</strong> Session data, preferences, analytics information</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">3. How We Use Your Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Service Provision</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Process orders and payments</li>
                    <li>• Provide customer support</li>
                    <li>• Send order confirmations</li>
                    <li>• Manage store operations</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Communication</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• WhatsApp order notifications</li>
                    <li>• Service updates and alerts</li>
                    <li>• Marketing communications (with consent)</li>
                    <li>• Platform announcements</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Platform Improvement</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Analyze usage patterns</li>
                    <li>• Improve platform features</li>
                    <li>• Develop new services</li>
                    <li>• Personalize user experience</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Legal Compliance</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Prevent fraud and abuse</li>
                    <li>• Comply with legal obligations</li>
                    <li>• Resolve disputes</li>
                    <li>• Enforce platform policies</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">4. Information Sharing and Disclosure</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">Permitted Sharing</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>Payment Processors:</strong> Payment information shared with Pocket, Visa, Mastercard for transaction processing</li>
                  <li><strong>Service Providers:</strong> Trusted third parties who assist in platform operations (hosting, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect platform safety</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
                  <li><strong>Consent:</strong> With your explicit permission for specific purposes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">5. Data Security</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We implement comprehensive security measures to protect your personal information:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Technical Security</h3>
                  <ul className="text-sm space-y-1">
                    <li>• SSL/TLS encryption for data transmission</li>
                    <li>• AES-256 encryption for stored data</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Secure server infrastructure</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Access Controls</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Role-based access permissions</li>
                    <li>• Multi-factor authentication options</li>
                    <li>• Regular password requirements</li>
                    <li>• Session timeout and monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">6. Your Rights</h2>
            </div>
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300">You have the following rights regarding your personal information:</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Access & Control</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Access your personal data</li>
                    <li>• Correct inaccurate information</li>
                    <li>• Delete your account and data</li>
                    <li>• Export your data</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Communication Preferences</h3>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Opt-out of marketing emails</li>
                    <li>• Control WhatsApp notifications</li>
                    <li>• Manage cookie preferences</li>
                    <li>• Withdraw consent for processing</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  To exercise these rights, contact us at <Link href="mailto:nodebrunei@gmail.com" className="text-blue-600 hover:underline">nodebrunei@gmail.com</Link>.
                  We will respond to your request within 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">7. Cookies and Tracking</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We use cookies and similar technologies to enhance your experience:</p>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Types of Cookies</h3>
                <dl className="text-sm space-y-2">
                  <div>
                    <dt className="font-medium">Essential Cookies:</dt>
                    <dd>Required for platform functionality, authentication, and security</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Analytics Cookies:</dt>
                    <dd>Help us understand how you use the platform to improve services</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Marketing Cookies:</dt>
                    <dd>Used to show relevant advertisements and promotions (with consent)</dd>
                  </div>
                </dl>
              </div>

              <p>You can control cookie preferences through your browser settings or our cookie consent banner.</p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">8. Data Retention</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We retain your information for the following periods:</p>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <dl className="text-sm space-y-2">
                  <div>
                    <dt className="font-medium">Account Data:</dt>
                    <dd>Retained while account is active and for 7 years after deactivation for tax/compliance purposes</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Order Records:</dt>
                    <dd>Retained for 7 years to comply with financial regulations and dispute resolution</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Communication Logs:</dt>
                    <dd>Retained for 2 years for customer service and quality assurance</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Analytics Data:</dt>
                    <dd>Aggregated and anonymized data retained indefinitely for platform improvement</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* International Data */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">9. International Data Transfers</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>Your information may be transferred to and processed in countries other than Brunei. We ensure appropriate safeguards:</p>
              <ul className="space-y-2 text-sm">
                <li>• Compliance with Brunei Personal Data Protection Act</li>
                <li>• Standard contractual clauses with service providers</li>
                <li>• Secure transmission protocols (HTTPS, encryption)</li>
                <li>• Regular audits of international data processors</li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">10. Children's Privacy</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>NodeBN is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.</p>
              <p>If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.</p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">11. Changes to This Privacy Policy</h2>
            </div>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by:</p>
              <ul className="space-y-2 text-sm">
                <li>• Posting the new Privacy Policy on this page</li>
                <li>• Sending you an email notification</li>
                <li>• Displaying a prominent notice on our platform</li>
              </ul>
              <p>Your continued use of NodeBN after such changes constitutes acceptance of the updated Privacy Policy.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 text-center">12. Contact Us</h2>
            <div className="text-center space-y-4">
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg max-w-md mx-auto">
                <div className="text-center">
                  <strong className="text-slate-900 dark:text-white text-lg">Privacy Inquiries</strong>
                  <p className="text-slate-600 dark:text-slate-300 text-xl font-medium mt-2">nodebrunei@gmail.com</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">We respond to privacy concerns within 48 hours</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Data Protection Officer</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  For privacy-related questions, concerns about data processing, or to exercise your rights under this Privacy Policy, please contact our Data Protection Officer.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
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
              <Link href="/legal/refund-policy" className="hover:underline ml-2">Refund Policy</Link> •
              <Link href="mailto:nodebrunei@gmail.com" className="text-blue-600 hover:underline ml-2">Contact Privacy Team</Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}