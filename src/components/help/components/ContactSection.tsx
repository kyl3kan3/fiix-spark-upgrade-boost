import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactSectionProps {
  onOpenChat: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenChat }) => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  
  const [featureForm, setFeatureForm] = useState({
    title: "",
    description: ""
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent",
      description: "We've received your message and will respond shortly.",
    });
    setContactForm({ name: "", email: "", message: "" });
  };

  const handleFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feature request submitted",
      description: "Thank you for your suggestion!",
    });
    setFeatureForm({ title: "", description: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Reach out to our team for personalized help
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => window.location.href = "mailto:support@maintenease.com"}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email Support
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onOpenChat}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Live Chat
          </Button>
          <form onSubmit={handleContactSubmit} className="pt-4 space-y-4">
            <h3 className="font-medium mb-2">Send us a message</h3>
            <div>
              <label className="text-sm font-medium block mb-1">Name</label>
              <Input 
                value={contactForm.name} 
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                placeholder="Your name" 
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <Input 
                type="email" 
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                placeholder="your.email@example.com" 
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Message</label>
              <textarea 
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                placeholder="How can we help you?"
                required
              />
            </div>
            <Button type="submit" className="w-full">Submit</Button>
          </form>
          
          <div className="pt-4">
            <h3 className="font-medium mb-2">Support Hours</h3>
            <p className="text-sm text-gray-500">Monday - Friday: 9am - 5pm EST</p>
            <p className="text-sm text-gray-500">Weekend: Limited support</p>
          </div>
          <div className="pt-2">
            <h3 className="font-medium mb-2">Emergency Contact</h3>
            <p className="text-sm text-gray-500">For urgent maintenance issues:</p>
            <p className="text-sm font-medium">1-800-MAINTAIN</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Request Feature</CardTitle>
          <CardDescription>
            Suggest new features or improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFeatureSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Feature Title</label>
              <Input 
                placeholder="Enter a short title for your feature request" 
                value={featureForm.title}
                onChange={(e) => setFeatureForm({...featureForm, title: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Description</label>
              <textarea 
                className="w-full min-h-[150px] p-2 border rounded-md" 
                placeholder="Please describe the feature you'd like to see..."
                value={featureForm.description}
                onChange={(e) => setFeatureForm({...featureForm, description: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full">Submit Request</Button>
          </form>
          
          <div className="mt-6 border-t pt-4">
            <h3 className="font-medium mb-3">Popular Feature Requests</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Mobile app for field technicians</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>QR code scanning for assets</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Custom dashboard widgets</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
