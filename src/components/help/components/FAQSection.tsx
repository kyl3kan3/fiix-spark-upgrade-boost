
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqItems } from "../data/helpData";

interface FAQSectionProps {
  searchQuery: string;
  searchResults: typeof faqItems;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  searchQuery,
  searchResults
}) => {
  const itemsToShow = searchQuery ? searchResults : faqItems;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>
          Find answers to common questions about using MaintenEase
        </CardDescription>
      </CardHeader>
      <CardContent>
        {searchQuery && searchResults.length === 0 ? (
          <p className="text-gray-500">No results found for "{searchQuery}" in FAQs</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {itemsToShow.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>
                  <div className="prose">
                    {item.answer}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-gray-500">Was this helpful?</span>
                      <Button size="sm" variant="outline" className="h-8">Yes</Button>
                      <Button size="sm" variant="outline" className="h-8">No</Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
