import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - AnotherSEOGuru Legal</title>
        <meta name="description" content="Terms of Service for AnotherSEOGuru SEO platform. Review our usage policies, data ownership, and subscription terms." />
        <meta name="keywords" content="terms of service, SEO terms, legal agreement, usage policy" />
        <link rel="canonical" href="https://anotherseoguru.com/terms" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: September 30, 2025</p>
          </div>

          <Card className="p-8 md:p-12 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using AnotherSEOGuru, you agree to be bound by these Terms of Service and all applicable 
                laws and regulations. If you do not agree with any of these terms, you are prohibited from using our platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">2. Use License</h2>
              <p className="text-muted-foreground leading-relaxed">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, 
                revocable license to access and use our service for your personal or internal business purposes.
              </p>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">You may not:</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose without our written consent</li>
                  <li>Attempt to reverse engineer any software contained on our service</li>
                  <li>Remove any copyright or other proprietary notations</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features of the service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">4. Data Ownership</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain all rights to your SEO data, projects, and configurations. We process your data solely to provide 
                our SEO analysis services. Your third-party API keys remain your property and are encrypted in our system.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">5. SEO Data Accuracy</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive for accuracy in our SEO metrics and analysis:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>SEO data is sourced from third-party providers and may vary</li>
                <li>Rankings and metrics can change frequently</li>
                <li>We do not guarantee specific SEO results or ranking improvements</li>
                <li>You are responsible for your SEO strategy and implementation decisions</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">6. Subscription and Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                Paid subscriptions automatically renew unless cancelled. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Pay all fees associated with your subscription</li>
                <li>Provide current, complete, and accurate billing information</li>
                <li>Promptly update account information if payment details change</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Refund Policy: We offer a 1-day money-back guarantee for new subscriptions. After 24 hours, 
                subscriptions are non-refundable.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">7. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may not use our service to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Scrape or crawl websites without permission</li>
                <li>Generate spam or manipulate search rankings artificially</li>
                <li>Violate any search engine's terms of service</li>
                <li>Access competitor data through unauthorized means</li>
                <li>Interfere with or disrupt our platform or services</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Resell or redistribute our services without authorization</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">8. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain service availability but do not guarantee uninterrupted access. We reserve 
                the right to modify, suspend, or discontinue any part of the service at any time.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Amplify shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">10. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we 
                believe violates these Terms or is harmful to other users, us, or third parties, or for any other 
                reason in our sole discretion.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material 
                changes. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-muted-foreground">Email: support@anotherseoguru.com</p>
            </section>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
};

export default Terms;
