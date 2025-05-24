
import React from "react";

interface SearchResultsProps {
  searchQuery: string;
  totalResults: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  totalResults
}) => {
  if (!searchQuery) return null;

  return (
    <div className="mb-4 p-2 bg-gray-50 rounded-md">
      <p className="text-sm text-gray-600">
        Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchQuery}"
      </p>
    </div>
  );
};
