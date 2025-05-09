
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-white via-fiix-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
              Simplify Your <span className="text-fiix-600">Maintenance</span> Management
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-lg">
              The complete CMMS solution that helps you organize, track, and optimize your maintenance operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-fiix-600 hover:bg-fiix-700 text-white px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="group">
                Book a Demo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <div className="mt-8 text-sm text-gray-500">
              Join 3,000+ companies already managing their assets
            </div>
          </div>
          <div className="md:w-1/2 animate-slide-up">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-fiix-200 to-fiix-400 rounded-xl transform rotate-3 opacity-30"></div>
              <div className="relative bg-white p-4 rounded-lg shadow-xl">
                <div className="aspect-[16/9] bg-fiix-100 rounded-md flex items-center justify-center">
                  <div className="p-8 text-center">
                    <div className="mb-4 mx-auto w-16 h-16 bg-fiix-200 rounded-full flex items-center justify-center">
                      <span className="text-fiix-600 text-2xl font-bold">F</span>
                    </div>
                    <div className="h-2 bg-fiix-200 rounded-full w-3/4 mx-auto mb-4"></div>
                    <div className="h-2 bg-fiix-200 rounded-full w-1/2 mx-auto mb-4"></div>
                    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-16 bg-fiix-100 border border-fiix-200 rounded-md"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
