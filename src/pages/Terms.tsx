import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
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
                By accessing or using Amplify, you agree to be bound by these Terms of Service and all applicable 
                laws and regulations. If you do not agree with any of these terms, you are prohibited from using 
                or accessing this site.
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
              <h2 className="text-2xl font-bold">4. Content Ownership</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain all rights to the content you submit to Amplify. By submitting content, you grant us 
                a limited license to process, store, and generate derivative versions of your content solely for 
                the purpose of providing our service to you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">5. AI-Generated Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service uses AI to generate content based on your input. While we strive for accuracy and quality:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>You are responsible for reviewing all AI-generated content before publication</li>
                <li>We do not guarantee the accuracy, completeness, or appropriateness of generated content</li>
                <li>You should not rely solely on AI-generated content without human review</li>
                <li>You are responsible for ensuring generated content complies with applicable laws</li>
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
                <li>Generate illegal, harmful, or offensive content</li>
                <li>Violate any intellectual property rights</li>
                <li>Impersonate any person or entity</li>
                <li>Distribute spam or malware</li>
                <li>Interfere with or disrupt the service</li>
                <li>Attempt to gain unauthorized access to our systems</li>
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
              <p className="text-muted-foreground">Email: legal@amplify.app</p>
            </section>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;
