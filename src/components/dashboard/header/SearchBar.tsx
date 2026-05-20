
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar: React.FC = () => {
 return (
 <div className="relative w-full max-w-md hidden md:flex items-center">
 <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 type="search"
 placeholder="Search..."
 className="w-full bg-card pl-8 py-1"
 />
 </div>
 );
};

export default SearchBar;
