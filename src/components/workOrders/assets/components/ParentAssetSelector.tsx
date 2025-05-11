
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { AssetFormValues } from "../AssetFormSchema";

type ParentAssetSelectorProps = {
  form: UseFormReturn<AssetFormValues>;
  availableParentAssets: any[];
  onParentChange: (value: string) => void;
};

export const ParentAssetSelector: React.FC<ParentAssetSelectorProps> = ({
  form,
  availableParentAssets,
  onParentChange,
}) => {
  return (
    <FormField
      control={form.control}
      name="parent_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Parent Asset</FormLabel>
          <Select 
            onValueChange={onParentChange}
            value={field.value || "none"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a parent asset (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None (Top Level Asset)</SelectItem>
              <SelectItem value="new">+ Create New Parent Asset</SelectItem>
              {availableParentAssets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
