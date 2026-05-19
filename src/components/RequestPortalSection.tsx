import { AlertTriangle, QrCode, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RequestPortalSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-4">
              <Zap className="h-3 w-3" /> NEW
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Give your customers a way to report problems — instantly
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Every MaintenEase account comes with a free, branded public request portal. Share the link
              on your website, post a QR code on the wall, or email it to tenants. Submissions land
              straight in your inbox with full context.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex gap-3">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Urgent lane for "I need this fixed now"</p>
                  <p className="text-sm text-gray-600">Urgent requests fire instant push and email alerts to your on-call team. No more missed emergencies.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-maintenease-100 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-maintenease-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">One click to a work order</p>
                  <p className="text-sm text-gray-600">Convert any incoming request into a fully populated work order with location, photos, and contact info.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-maintenease-100 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-maintenease-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">No login required</p>
                  <p className="text-sm text-gray-600">Tenants, staff, or the public can submit a request in 30 seconds — no app install, no account.</p>
                </div>
              </div>
            </div>
            <Button asChild size="lg">
              <Link to="/solutions/maintenance-request-portal">See how it works →</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-5">
              <div className="h-8 w-8 rounded bg-maintenease-600 flex items-center justify-center text-white">
                <Wrench className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Maintenance requests</p>
                <p className="font-semibold text-gray-900 text-sm">Acme Facilities</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <Wrench className="h-5 w-5 text-maintenease-600 mb-1" />
                <p className="font-semibold text-sm">Submit a request</p>
              </div>
              <div className="p-4 rounded-lg border-2 border-red-600 bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600 mb-1" />
                <p className="font-semibold text-sm text-red-700">Urgent — needs fixing now</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">What's the issue?</p>
                <div className="h-9 rounded border border-gray-200 bg-gray-50 px-3 flex items-center text-gray-700">Leaking sink in break room</div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <div className="h-9 rounded border border-gray-200 bg-gray-50 px-3 flex items-center text-gray-700">Building B, 2nd floor</div>
              </div>
              <div className="h-10 rounded-md bg-red-600 text-white font-semibold flex items-center justify-center">
                Send urgent alert
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RequestPortalSection;