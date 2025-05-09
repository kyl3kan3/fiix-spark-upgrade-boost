
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const features = [
  "Free 14-day trial",
  "No credit card required",
  "Easy self-onboarding",
  "Unlimited users during trial"
];

const CTA = () => {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-fiix-600 to-fiix-800 rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Ready to transform your maintenance operations?
              </h2>
              <p className="text-fiix-100 text-lg mb-8 max-w-lg">
                Join thousands of companies that use Fiix to reduce downtime, extend equipment life, and make data-driven maintenance decisions.
              </p>
              <ul className="mb-10 space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center text-white">
                    <CheckCircle className="h-5 w-5 mr-3 text-fiix-200" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="bg-white text-fiix-700 hover:bg-fiix-50 group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <div className="md:w-1/2 bg-white/10 p-8 md:p-16 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 md:p-8 shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Enterprise Plan</h3>
                <p className="text-gray-600 mb-6">For organizations with complex maintenance needs</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">$89</span>
                  <span className="text-gray-600">/month per user</span>
                </div>
                <ul className="mb-8 space-y-3">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 mr-3 text-fiix-600" />
                    <span>All Fiix features included</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 mr-3 text-fiix-600" />
                    <span>Unlimited assets & work orders</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 mr-3 text-fiix-600" />
                    <span>Premium 24/7 support</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 mr-3 text-fiix-600" />
                    <span>Custom integrations</span>
                  </li>
                </ul>
                <Button className="w-full bg-fiix-600 hover:bg-fiix-700 text-white">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
