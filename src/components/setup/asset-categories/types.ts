export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "boolean" | "dropdown";
  options?: string[];
  required: boolean;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  customFields: CustomField[];
}

export const fieldTypeOptions: { label: string; value: CustomField["type"] }[] = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
  { label: "Checkbox", value: "boolean" },
  { label: "Dropdown", value: "dropdown" },
];

export const defaultAssetCategories: AssetCategory[] = [
  {
    id: "equipment",
    name: "Equipment",
    description: "Machinery and equipment used in operations",
    customFields: [
      { id: "model_number", name: "Model Number", type: "text", required: true },
      { id: "manufacturer", name: "Manufacturer", type: "text", required: false },
      { id: "warranty_expiry", name: "Warranty Expiration", type: "date", required: false },
    ],
  },
  {
    id: "facility",
    name: "Facility",
    description: "Buildings and facility infrastructure",
    customFields: [
      { id: "square_footage", name: "Square Footage", type: "number", required: false },
      { id: "construction_year", name: "Year Constructed", type: "number", required: false },
    ],
  },
  {
    id: "vehicles",
    name: "Vehicles",
    description: "Company vehicles and mobile equipment",
    customFields: [
      { id: "license_plate", name: "License Plate", type: "text", required: true },
      { id: "vin", name: "VIN", type: "text", required: true },
      { id: "mileage", name: "Mileage", type: "number", required: false },
    ],
  },
];
