import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: September 30, 2025</p>
          </div>

          <Card className="p-8 md:p-12 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Amplify ("we," "our," or "us"). We respect your privacy and are committed to protecting 
                your personal data. This privacy policy will inform you about how we look after your personal data 
                when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">2. Information We Collect</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may collect the following types of personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Name and contact information (email address)</li>
                  <li>Account credentials and authentication information</li>
                  <li>Payment information (processed securely through third-party payment processors)</li>
                  <li>Content you create and upload to our platform</li>
                  <li>Usage data and analytics</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use your personal information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>To provide and maintain our service</li>
                <li>To process your content repurposing requests</li>
                <li>To manage your account and subscription</li>
                <li>To send you service-related communications</li>
                <li>To improve our services and develop new features</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal 
                data against unauthorized or unlawful processing, accidental loss, destruction, or damage. Your 
                content is encrypted in transit and at rest.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We will retain your personal data only for as long as necessary to fulfill the purposes for which 
                we collected it, including for the purposes of satisfying any legal, accounting, or reporting 
                requirements. When you delete your account, we will delete your personal data within 30 days.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                Under data protection laws, you have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>The right to access your personal data</li>
                <li>The right to rectification of inaccurate data</li>
                <li>The right to erasure of your data</li>
                <li>The right to restrict processing</li>
                <li>The right to data portability</li>
                <li>The right to object to processing</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">7. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use third-party AI services to process your content. These services are bound by strict 
                confidentiality agreements and data processing terms. We do not share your content with any 
                other third parties without your explicit consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">8. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and store 
                certain information. You can instruct your browser to refuse all cookies or to indicate when 
                a cookie is being sent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our privacy policy from time to time. We will notify you of any changes by 
                posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this privacy policy, please contact us at:
              </p>
              <p className="text-muted-foreground">Email: privacy@amplify.app</p>
            </section>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
