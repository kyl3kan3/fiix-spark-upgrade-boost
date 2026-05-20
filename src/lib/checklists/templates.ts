export type ChecklistTemplate = {
 id: string;
 name: string;
 description: string;
 defaultChecklistName: string;
 defaultFrequency: string;
 items: string[];
};

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
 {
 id: "freezer-coil-daily",
 name: "Freezer coil — daily",
 description: "Standard daily coil inspection: ice, belts, valves, cleanliness.",
 defaultChecklistName: "Freezer coil daily check",
 defaultFrequency: "daily",
 items: [
 "Ice build-up OK",
 "Belt condition OK",
 "No leaking valves",
 "Coil clean",
 "Temperature in range",
 ],
 },
 {
 id: "walk-in-twice-daily",
 name: "Walk-in freezer — twice daily",
 description: "AM/PM checks for walk-in units with door seals and defrost.",
 defaultChecklistName: "Walk-in freezer AM/PM check",
 defaultFrequency: "twice-daily",
 items: [
 "Door seal intact",
 "No frost on floor",
 "Defrost cycle ran",
 "Temperature in range",
 "Evaporator fan running",
 "No unusual noises",
 ],
 },
 {
 id: "reach-in-weekly",
 name: "Reach-in freezer — weekly",
 description: "Lighter weekly inspection for reach-in units.",
 defaultChecklistName: "Reach-in freezer weekly check",
 defaultFrequency: "weekly",
 items: [
 "Gasket condition OK",
 "Coil free of dust",
 "Drain pan clear",
 "Temperature log reviewed",
 ],
 },
 {
 id: "compressor-monthly",
 name: "Compressor — monthly",
 description: "Monthly mechanical check for compressor units.",
 defaultChecklistName: "Compressor monthly inspection",
 defaultFrequency: "monthly",
 items: [
 "Oil level OK",
 "No refrigerant leaks",
 "Suction/discharge pressures normal",
 "Mounts and vibration OK",
 "Electrical connections tight",
 ],
 },
 {
 id: "blank",
 name: "Blank — start from scratch",
 description: "Empty template; define your own checklist items.",
 defaultChecklistName: "Custom inspection",
 defaultFrequency: "daily",
 items: [],
 },
];

export const getTemplateById = (id: string) =>
 CHECKLIST_TEMPLATES.find((t) => t.id === id) ?? CHECKLIST_TEMPLATES[0];