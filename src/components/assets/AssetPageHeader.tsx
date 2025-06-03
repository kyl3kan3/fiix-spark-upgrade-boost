
import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

const AssetPageHeader: React.FC = () => {
  return (
    <>
      <BackToDashboard />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link to="/assets/new">
            <Button className="whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default AssetPageHeader;
