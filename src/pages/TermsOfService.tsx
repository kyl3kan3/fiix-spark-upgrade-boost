import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms & Conditions | MaintenEase</title>
        <meta name="description" content="The legal terms governing your use of MaintenEase, including acceptable use, subscriptions, Paddle as Merchant of Record, liability, and termination." />
        <link rel="canonical" href="https://maintenease.com/terms" />
        <meta property="og:title" content="Terms & Conditions | MaintenEase" />
        <meta property="og:description" content="The terms governing your use of the MaintenEase service." />
        <meta property="og:url" content="https://maintenease.com/terms" />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Terms & Conditions",
          datePublished: "2024-01-01",
          author: { "@type": "Organization", name: "Decent4" },
          publisher: { "@type": "Organization", name: "MaintenEase" }
        })}</script>
      </Helmet>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">1. Who you are contracting with</h2>
            <p>These Terms &amp; Conditions ("Terms") form an agreement between you and <strong>Decent4</strong>, trading as
              MaintenEase ("we", "us", "our"). By creating an account, accessing or using the MaintenEase service (the "Service"),
              you agree to be bound by these Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Authority and eligibility</h2>
            <p>If you use the Service on behalf of an organisation, you represent that you have authority to bind that organisation
              to these Terms. If you use it as an individual, you must be of legal age in your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. The Service</h2>
            <p>MaintenEase is a maintenance management platform that helps teams track assets, work orders, inspections,
              checklists and related operations. We may change, add or remove features over time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Account and credentials</h2>
            <p>You are responsible for keeping your login credentials confidential and for all activity that occurs under your
              account. You must provide accurate information and keep it up to date.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Acceptable use</h2>
            <p>You must not misuse the Service. In particular, you must not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>use it for any unlawful, fraudulent or deceptive purpose;</li>
              <li>send spam or unsolicited messages;</li>
              <li>infringe the intellectual property or privacy rights of others;</li>
              <li>upload malware or attempt to probe, scan, scrape or otherwise interfere with the security or integrity of the Service;</li>
              <li>circumvent any technical limitations or access controls.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Intellectual property</h2>
            <p>We retain all right, title and interest in the Service, including all software, documentation, designs and branding.
              Subject to these Terms, we grant you a limited, non-exclusive, non-transferable right to use the Service in accordance
              with your subscription plan. You retain ownership of content you upload, and grant us a limited licence to host and
              process that content solely to provide the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Service availability</h2>
            <p>We work hard to keep the Service available, but we do not guarantee that it will be uninterrupted or error-free.
              To the fullest extent permitted by law, all implied warranties (including merchantability and fitness for a particular
              purpose) are disclaimed.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Payment, subscriptions and refunds</h2>
            <p>Our order process is conducted by our online reseller <strong>Paddle.com</strong>. <strong>Paddle.com is the Merchant
              of Record for all our orders.</strong> Paddle provides all customer service inquiries and handles returns. Payment,
              billing, tax, cancellation and refund mechanics are governed by Paddle's
              <a className="underline" href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noreferrer"> Buyer Terms</a>.
              See also our <Link className="underline" to="/refund-policy">Refund Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Suspension and termination</h2>
            <p>We may suspend or terminate your access to the Service for material breach of these Terms, non-payment, security or
              fraud risk, or repeated or serious policy violations. You may stop using the Service at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">10. Liability</h2>
            <p>To the fullest extent permitted by law, our aggregate liability arising out of or relating to the Service is limited
              to the fees paid by you in the 12 months preceding the event giving rise to the claim. We are not liable for indirect,
              consequential or special damages, including loss of profits, data or goodwill. Nothing in these Terms excludes liability
              for fraud, death or personal injury caused by negligence where such exclusion is prohibited by law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">11. Governing law</h2>
            <p>These Terms are governed by the laws applicable at Decent4's place of establishment, without regard to conflict of
              law principles. Disputes will be resolved by the competent courts of that jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">12. Changes to these Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes become effective constitutes
              acceptance of the updated Terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}