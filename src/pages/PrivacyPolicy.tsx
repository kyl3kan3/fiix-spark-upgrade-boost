import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";

export default function PrivacyPolicy() {
 return (
 <MarketingLayout>
 <Helmet>
 <title>Privacy Notice | MaintenEase</title>
 <meta name="description" content="How MaintenEase (Decent4) collects, uses, and protects personal data, including your rights, retention, and sharing with subprocessors like Paddle." />
 <link rel="canonical" href="https://maintenease.com/privacy" />
 <meta property="og:title" content="Privacy Notice | MaintenEase" />
 <meta property="og:description" content="How MaintenEase collects, uses, and protects your personal data." />
 <meta property="og:url" content="https://maintenease.com/privacy" />
 <meta property="og:type" content="article" />
 <meta property="og:image" content="https://maintenease.com/og-image.png" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="Privacy Notice | MaintenEase" />
 <meta name="twitter:description" content="How MaintenEase collects, uses, and protects your personal data." />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png" />
 <script type="application/ld+json">{JSON.stringify({
 "@context": "https://schema.org",
 "@type": "Article",
 headline: "Privacy Notice",
 datePublished: "2024-01-01",
 author: { "@type": "Organization", name: "Decent4" },
 publisher: { "@type": "Organization", name: "MaintenEase" }
 })}</script>
 </Helmet>
 <div className="container mx-auto max-w-3xl px-4 py-12">
 <Button asChild variant="ghost" size="sm" className="mb-6">
 <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
 </Button>
 <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Notice</h1>
 <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

 <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
 <section>
 <h2 className="text-2xl font-semibold">1. Who we are</h2>
 <p>
 This Privacy Notice is issued by <strong>Decent4</strong> ("we", "us", "our"), trading as MaintenEase.
 Decent4 is the data controller responsible for personal data processed through the MaintenEase service
 (the "Service"). If you have questions about this notice, contact us at{" "}
 <a className="underline" href="mailto:info@decent4.com">info@decent4.com</a>.
 </p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">2. Categories of personal data we collect</h2>
 <ul className="list-disc pl-6 space-y-1">
 <li><strong>Account data:</strong> name, email address, password (hashed), company name, role.</li>
 <li><strong>Profile data:</strong> profile photo, phone number, notification preferences.</li>
 <li><strong>Operational data:</strong> assets, work orders, inspections, checklists, locations, vendors, and attachments you create.</li>
 <li><strong>Support data:</strong> messages and attachments you send to our support team.</li>
 <li><strong>Usage/telemetry:</strong> device identifiers, IP address, browser type, pages viewed, errors.</li>
 <li><strong>Payment data:</strong> handled by our Merchant of Record (Paddle). We do not store full card details.</li>
 </ul>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">3. Purposes and legal basis</h2>
 <ul className="list-disc pl-6 space-y-1">
 <li>Creating and managing your account — performance of contract.</li>
 <li>Providing and operating the Service — performance of contract.</li>
 <li>Security, fraud prevention and abuse detection — legitimate interests.</li>
 <li>Product improvement and analytics — legitimate interests.</li>
 <li>Customer support — performance of contract / legitimate interests.</li>
 <li>Marketing (only where you have opted in) — consent.</li>
 <li>Complying with legal, accounting and tax obligations — legal obligation.</li>
 </ul>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">4. How we share data</h2>
 <p>We share personal data with the following categories of recipients:</p>
 <ul className="list-disc pl-6 space-y-1">
 <li><strong>Service providers / subprocessors</strong> — cloud hosting, database, email delivery, analytics, and customer support tooling.</li>
 <li><strong>Paddle.com Market Ltd ("Paddle")</strong> — our Merchant of Record, which processes sales, subscription management, payments, tax compliance and invoicing on our behalf.</li>
 <li><strong>Professional advisers</strong> — legal, accounting and similar advisers.</li>
 <li><strong>Authorities</strong> — where required by law or to protect our rights.</li>
 </ul>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">5. Data retention</h2>
 <p>
 We keep personal data for as long as your account is active and as needed to provide the Service.
 After account closure we retain data only as long as necessary to meet legal, accounting and dispute
 resolution obligations, after which it is deleted or anonymised.
 </p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">6. Your rights</h2>
 <p>Subject to applicable law, you may have the right to access, correct, delete, restrict or object to processing
 of your personal data, to data portability, and to withdraw consent at any time. You may also have the right to
 lodge a complaint with a data protection supervisory authority. To exercise these rights, contact us at{" "}
 <a className="underline" href="mailto:info@decent4.com">info@decent4.com</a>.</p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">7. International transfers</h2>
 <p>Where personal data is transferred outside your country, we rely on appropriate safeguards such as Standard
 Contractual Clauses or adequacy decisions.</p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">8. Security</h2>
 <p>We implement appropriate technical and organisational measures — including encryption in transit, access
 controls, and audit logging — to protect personal data against unauthorised access, alteration or loss.</p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">9. Cookies</h2>
 <p>We use strictly necessary cookies to operate the Service (for example, to keep you signed in). Where we use
 analytics or marketing cookies, we will request your consent and provide a way to manage your preferences.</p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">10. Changes to this notice</h2>
 <p>We may update this notice from time to time. The "Last updated" date above reflects the most recent change.</p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">11. SMS messaging program</h2>
 <p>
 If you opt in to our SMS program (for example via our{" "}
 <Link className="underline" to="/sms-opt-in">SMS sign-up page</Link>{" "}
 or by providing your phone number in onboarding or notification
 settings), we collect and process your mobile phone number and
 consent record (timestamp, IP address, user agent, and source) in
 order to send you transactional and operational text messages such
 as work-order assignments, inspection reminders, and account
 alerts.
 </p>
 <p>
 <strong>We do not share, sell, rent, or otherwise disclose your
 mobile phone number or SMS consent information to third parties or
 affiliates for their marketing or promotional purposes.</strong>{" "}
 Phone numbers and SMS opt-in data are shared only with our
 messaging subprocessor (Twilio) strictly to deliver the messages
 you requested.
 </p>
 <p>
 Message frequency varies based on your account activity. Message
 and data rates may apply. You can opt out at any time by replying{" "}
 <strong>STOP</strong> to any message, or by updating your{" "}
 <Link className="underline" to="/settings/notifications">
 notification preferences
 </Link>
 . Reply <strong>HELP</strong> for assistance.
 </p>
 </section>
 </div>
 </div>
 </MarketingLayout>
 );
}