import React from "react";
import { Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldPreview } from "./FieldPreview";
import type { AssetCategory } from "./types";

export const CategoryFormPreview: React.FC<{ category: AssetCategory | null }> = ({ category }) => {
  if (!category) {
    return (
      <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
        <Wrench className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium">No Category Selected</h3>
        <p className="mt-2">Select a category to preview its form</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New {category.name}</CardTitle>
        <CardDescription>Enter the {category.name.toLowerCase()} details below</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name*</Label>
                <Input placeholder={`${category.name} name`} />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Description of the asset" />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Asset location" />
              </div>
            </div>

            <div className="space-y-4">
              {category.customFields.length > 0 ? (
                category.customFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label>
                      {field.name}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </Label>
                    <FieldPreview field={field} />
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-muted-foreground border border-dashed rounded-md">
                  <p>No custom fields defined for this category</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button disabled>Save Asset</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
