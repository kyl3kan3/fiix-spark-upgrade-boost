
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CompanyInfoFormValues } from "./companyInfoSchema";
import { TIMEZONE_OPTIONS } from "@/constants/timezones";

interface BasicInfoFieldsProps {
 form: UseFormReturn<CompanyInfoFormValues>;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form }) => {
 return (
 <>
 <FormField
 control={form.control}
 name="name"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Company Name*</FormLabel>
 <FormControl>
 <Input placeholder="Enter company name" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="industry"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Industry</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Select industry" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="manufacturing">Manufacturing</SelectItem>
 <SelectItem value="healthcare">Healthcare</SelectItem>
 <SelectItem value="education">Education</SelectItem>
 <SelectItem value="hospitality">Hospitality</SelectItem>
 <SelectItem value="real_estate">Real Estate</SelectItem>
 <SelectItem value="retail">Retail</SelectItem>
 <SelectItem value="transportation">Transportation</SelectItem>
 <SelectItem value="utilities">Utilities</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="timezone"
 render={({ field }) => {
 const options = Array.from(new Set([field.value, ...TIMEZONE_OPTIONS]));
 return (
 <FormItem>
 <FormLabel>Facility Timezone</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Select timezone" />
 </SelectTrigger>
 </FormControl>
 <SelectContent className="max-h-72">
 {options.map((timezone) => (
 <SelectItem key={timezone} value={timezone}>{timezone.replace(/_/g, " ")}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 );
 }}
 />
 </>
 );
};

export default BasicInfoFields;
