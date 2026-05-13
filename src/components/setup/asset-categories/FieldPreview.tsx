import React from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { CustomField } from "./types";

export const FieldPreview: React.FC<{ field: CustomField }> = ({ field }) => {
  switch (field.type) {
    case "text":
      return <Input className="h-9" placeholder="Text value" disabled />;
    case "number":
      return <Input className="h-9" type="number" placeholder="0" disabled />;
    case "date":
      return <Input className="h-9" type="text" value={format(new Date(), "yyyy-MM-dd")} disabled />;
    case "boolean":
      return <Checkbox disabled />;
    case "dropdown":
      return (
        <select
          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          disabled
        >
          <option>Select an option...</option>
          {field.options?.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      );
    default:
      return null;
  }
};
