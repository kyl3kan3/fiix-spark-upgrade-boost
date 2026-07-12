import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";

export default function RefundPolicy() {
 return (
 <MarketingLayout>
 <Helmet>
 <title>Refund Policy | MaintenEase</title>
 <meta name="description" content="MaintenEase offers a 30-day money-back guarantee. Learn how to request a refund through Paddle, our Merchant of Record, and how trials and renewals work." />
 <link rel="canonical" href="https://maintenease.com/refund-policy" />
 <meta property="og:title" content="Refund Policy | MaintenEase" />
 <meta property="og:description" content="30-day money-back guarantee. How to request a refund through Paddle." />
 <meta property="og:url" content="https://maintenease.com/refund-policy" />
 <meta property="og:type" content="article" />
 <meta property="og:image" content="https://maintenease.com/og-image.png?v=2" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="Refund Policy | MaintenEase" />
 <meta name="twitter:description" content="30-day money-back guarantee. How to request a refund through Paddle." />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=2" />
 </Helmet>
 <div className="container mx-auto max-w-3xl px-4 py-12">
 <Button asChild variant="ghost" size="sm" className="mb-6">
 <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
 </Button>
 <h1 className="text-4xl font-bold tracking-normal mb-2">Refund Policy</h1>
 <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

 <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
 <section>
 <p>
 <strong>Decent4</strong> (trading as MaintenEase) offers a <strong>30-day money-back guarantee</strong>.
 If you are not satisfied with your purchase, you may request a full refund within 30 days of your order date.
 </p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">How to request a refund</h2>
 <p>
 Refunds are processed by our Merchant of Record, <strong>Paddle</strong>. To request a refund, visit
 {" "}
 <a className="underline" href="https://paddle.net" target="_blank" rel="noreferrer">paddle.net</a>
 {" "}
 and look up your order using the email address you used at checkout, or email us at{" "}
 <a className="underline" href="mailto:info@decent4.com">info@decent4.com</a> and we will help you.
 </p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">Free trials</h2>
 <p>
 All paid plans start with a 7-day free trial. You will not be charged during the trial period. If you cancel before
 the trial ends, no charge is made and no refund is needed.
 </p>
 </section>

 <section>
 <h2 className="text-2xl font-semibold">Subscription renewals</h2>
 <p>
 Subscriptions renew automatically at the end of each billing period. You can cancel renewal at any time from your
 billing settings; cancellation stops future charges but does not, by itself, refund the current period. If you would
 like a refund for the current period, request one within the 30-day window described above.
 </p>
 </section>

 <section>
 <p>
 For full payment terms, see Paddle's
 {" "}
 <a className="underline" href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noreferrer">Refund Policy</a>
 {" "}and our <Link className="underline" to="/terms">Terms &amp; Conditions</Link>.
 </p>
 </section>
 </div>
 </div>
 </MarketingLayout>
 );
}