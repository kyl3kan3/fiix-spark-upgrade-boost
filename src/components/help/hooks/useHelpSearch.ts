
import { useState, useEffect } from "react";
import { faqItems, documentationItems, tutorialItems } from "../data/helpData";

interface SearchResults {
  faq: typeof faqItems;
  documentation: any[];
  tutorials: typeof tutorialItems;
}

export function useHelpSearch(searchQuery: string) {
  const [searchResults, setSearchResults] = useState<SearchResults>({
    faq: [],
    documentation: [],
    tutorials: []
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ faq: [], documentation: [], tutorials: [] });
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Search FAQs
    const faqResults = faqItems.filter(item => 
      item.question.toLowerCase().includes(query) || 
      item.answer.toLowerCase().includes(query)
    );
    
    // Search documentation
    const docResults = documentationItems.flatMap(category => 
      category.articles.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.description.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      )
    );
    
    // Search tutorials
    const tutorialResults = tutorialItems.filter(tutorial => 
      tutorial.title.toLowerCase().includes(query) || 
      tutorial.description.toLowerCase().includes(query) ||
      tutorial.category.toLowerCase().includes(query)
    );
    
    setSearchResults({
      faq: faqResults,
      documentation: docResults,
      tutorials: tutorialResults
    });
  }, [searchQuery]);

  const totalResults = searchResults.faq.length + 
                     searchResults.documentation.length + 
                     searchResults.tutorials.length;

  return { searchResults, totalResults };
}
