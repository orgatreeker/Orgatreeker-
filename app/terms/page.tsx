import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, FileText, AlertTriangle, Shield, CreditCard, Users, Gavel } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <span className="font-semibold text-xl">Orgatreeker</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These terms govern your use of Orgatreeker and outline our mutual rights and responsibilities.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Contact Info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Questions about these terms?</p>
                  <p className="text-sm text-muted-foreground">
                    Contact us at{" "}
                    <a href="mailto:support@orgatreeker.com" className="text-primary hover:underline">
                      support@orgatreeker.com
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-6">
            {/* Acceptance of Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gavel className="w-5 h-5 text-primary" />
                  <span>Acceptance of Terms</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  By accessing or using Orgatreeker ("the Service"), you agree to be bound by these Terms of Service
                  ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                </p>
                <p className="text-muted-foreground">
                  These Terms apply to all visitors, users, and others who access or use the Service.
                </p>
              </CardContent>
            </Card>

            {/* Description of Service */}
            <Card>
              <CardHeader>
                <CardTitle>Description of Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Orgatreeker is a web-based financial management application that helps users:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Track income from multiple sources</li>
                  <li>Create and manage budgets using the 50/30/20 rule</li>
                  <li>Monitor expenses and savings goals</li>
                  <li>Generate financial reports and insights</li>
                  <li>Access premium features with paid subscriptions</li>
                </ul>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>User Accounts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Creation</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>You must be at least 18 years old to create an account</li>
                    <li>One person may not maintain multiple accounts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Account Responsibilities</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Keep your password secure and confidential</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>You are liable for all activities under your account</li>
                    <li>Provide accurate financial information for proper service functionality</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Subscription and Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span>Subscription and Billing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Free and Premium Plans</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Free plan includes basic features with limitations</li>
                    <li>Premium plans unlock additional features and remove restrictions</li>
                    <li>Monthly plan: $12/month</li>
                    <li>Annual plan: $95/year (save $49 compared to monthly)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Billing Terms</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Subscriptions automatically renew unless cancelled</li>
                    <li>Billing occurs at the start of each billing period</li>
                    <li>No refunds for partial months or unused portions</li>
                    <li>Price changes will be communicated 30 days in advance</li>
                    <li>Failed payments may result in service suspension</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cancellation</h4>
                  <p className="text-muted-foreground">
                    You may cancel your subscription at any time through your account settings. Cancellation takes
                    effect at the end of the current billing period.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Acceptable Use Policy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Transmit any harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Create accounts through automated means</li>
                  <li>Share your account credentials with others</li>
                  <li>Use the Service to store or transmit infringing content</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data and Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Data and Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Your privacy is important to us. Our collection and use of personal information is governed by our
                  Privacy Policy, which is incorporated into these Terms by reference.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You retain ownership of your financial data</li>
                  <li>We implement security measures to protect your information</li>
                  <li>You can export or delete your data at any time</li>
                  <li>We do not sell your personal information to third parties</li>
                </ul>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Our Rights</h4>
                  <p className="text-muted-foreground">
                    The Service and its original content, features, and functionality are owned by Orgatreeker and are
                    protected by international copyright, trademark, patent, trade secret, and other intellectual
                    property laws.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Your Rights</h4>
                  <p className="text-muted-foreground">
                    You retain all rights to the financial data and content you input into the Service. By using our
                    Service, you grant us a limited license to use this data to provide our services to you.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Service Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Service Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                  <li>Scheduled maintenance will be announced in advance when possible</li>
                  <li>We may modify or discontinue features with reasonable notice</li>
                  <li>Emergency maintenance may occur without prior notice</li>
                </ul>
              </CardContent>
            </Card>

            {/* Disclaimers and Limitations */}
            <Card>
              <CardHeader>
                <CardTitle>Disclaimers and Limitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Financial Advice Disclaimer</h4>
                  <p className="text-muted-foreground">
                    Orgatreeker is a financial management tool and does not provide financial, investment, or tax
                    advice. Consult with qualified professionals for personalized financial guidance.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                  <p className="text-muted-foreground">
                    To the maximum extent permitted by law, Orgatreeker shall not be liable for any indirect,
                    incidental, special, consequential, or punitive damages, including loss of profits, data, or other
                    intangible losses.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice,
                  for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
                <p className="text-muted-foreground">
                  Upon termination, your right to use the Service will cease immediately. You may delete your account at
                  any time by contacting us.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle>Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where
                  Orgatreeker is incorporated, without regard to conflict of law provisions.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Changes to Terms</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes via
                  email or through the Service. Continued use after changes constitutes acceptance of the new Terms.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Questions About These Terms?</h3>
              <p className="mb-4 opacity-90">
                Our support team is here to help clarify any questions about our Terms of Service.
              </p>
              <Button variant="secondary" asChild>
                <a href="mailto:support@orgatreeker.com" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@orgatreeker.com</span>
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
