
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    quote: "Fiix has revolutionized how we approach maintenance at our manufacturing plant. We've reduced downtime by 35% since implementation.",
    author: "Sarah Johnson",
    position: "Maintenance Manager",
    company: "Global Manufacturing Inc.",
    rating: 5,
  },
  {
    quote: "The preventive maintenance features have saved us thousands in repair costs. The platform is intuitive and our team adopted it quickly.",
    author: "Michael Chen",
    position: "Operations Director",
    company: "Pacific Industrial",
    rating: 5,
  },
  {
    quote: "Customer support is exceptional. Any time we've needed help, the Fiix team has been responsive and knowledgeable.",
    author: "Emma Rodriguez",
    position: "Facility Manager",
    company: "City Hospital",
    rating: 5,
  },
];

const Testimonials = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section id="testimonials" className="py-20 bg-fiix-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Trusted by Maintenance Teams Everywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear what our customers have to say about their experience with Fiix.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white p-8 md:p-12 rounded-2xl shadow-lg">
            <div className="flex justify-center mb-6">
              {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-fiix-400 text-fiix-400" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-center text-gray-700 italic mb-8">
              "{testimonials[activeTestimonial].quote}"
            </blockquote>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{testimonials[activeTestimonial].author}</p>
              <p className="text-gray-600">{testimonials[activeTestimonial].position}, {testimonials[activeTestimonial].company}</p>
            </div>
            
            <div className="absolute top-1/2 -left-4 -translate-y-1/2">
              <button 
                onClick={prevTestimonial} 
                className="bg-white rounded-full p-2 shadow-md hover:bg-fiix-50 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6 text-fiix-600" />
              </button>
            </div>
            <div className="absolute top-1/2 -right-4 -translate-y-1/2">
              <button 
                onClick={nextTestimonial} 
                className="bg-white rounded-full p-2 shadow-md hover:bg-fiix-50 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6 text-fiix-600" />
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`h-2 w-2 mx-1 rounded-full transition-all ${
                  activeTestimonial === index ? "bg-fiix-600 w-8" : "bg-fiix-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
