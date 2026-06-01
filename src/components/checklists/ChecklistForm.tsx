import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checklistService } from "@/services/checklistService";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BasicInformationSection from "./BasicInformationSection";
import ChecklistItemsSection from "./ChecklistItemsSection";
import ChecklistAssetsSelector from "./ChecklistAssetsSelector";
import { MaterialIcon } from "@/components/ui/material-icon";

interface ChecklistFormProps {
 mode: "create" | "edit";
}

interface ChecklistItemForm {
 id?: string;
 title: string;
 description: string;
 item_type: "checkbox" | "text" | "number" | "date";
 is_required: boolean;
 sort_order: number;
}

interface ChecklistFormData {
 name: string;
 description: string;
 type: string;
 frequency: string;
 is_active: boolean;
 items: ChecklistItemForm[];
 assetIds: string[];
 assetOffsets: Record<string, number>;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ mode }) => {
 const { id } = useParams();
 const navigate = useNavigate();
 const queryClient = useQueryClient();

 const [formData, setFormData] = useState<ChecklistFormData>({
   name: "",
   description: "",
   type: "general",
   frequency: "one-time",
   is_active: true,
   items: [],
   assetIds: [],
   assetOffsets: {},
 });

 // Load existing checklist for edit mode
 const { data: checklist, isLoading } = useQuery({
   queryKey: ["checklist", id],
   queryFn: () => checklistService.getChecklistById(id!),
   enabled: mode === "edit" && !!id,
 });

 useEffect(() => {
   if (checklist && mode === "edit") {
     setFormData({
       name: checklist.name,
       description: checklist.description || "",
       type: checklist.type,
       frequency: checklist.frequency,
       is_active: checklist.is_active,
       items: checklist.items?.map((item, index) => ({
         id: item.id,
         title: item.title,
         description: item.description || "",
         item_type: item.item_type,
         is_required: item.is_required,
         sort_order: item.sort_order || index
       })) || [],
       assetIds: checklist.asset_ids || [],
       assetOffsets: checklist.asset_offsets || {},
     });
   }
 }, [checklist, mode]);

 const createMutation = useMutation({
   mutationFn: async (data: ChecklistFormData) => {
     const newChecklist = await checklistService.createChecklist({
       name: data.name,
       description: data.description,
       type: data.type,
       frequency: data.frequency,
       is_active: data.is_active
     });

     for (let i = 0; i < data.items.length; i++) {
       const item = data.items[i];
       await checklistService.createChecklistItem({
         checklist_id: newChecklist.id,
         title: item.title,
         description: item.description,
         item_type: item.item_type,
         is_required: item.is_required,
         sort_order: i
       });
     }

     await checklistService.setChecklistAssets(newChecklist.id, data.assetIds, {
       offsets: data.assetOffsets,
     });
     await checklistService.ensureSchedule(newChecklist.id, data.frequency);

     return newChecklist;
   },
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["checklists"] });
     toast.success("Checklist created successfully");
     navigate("/checklists");
   },
   onError: (error: any) => {
     toast.error("Failed to create checklist", {
       description: error.message
     });
   }
 });

 const updateMutation = useMutation({
   mutationFn: async (data: ChecklistFormData) => {
     if (!id) throw new Error("No checklist ID");

     await checklistService.updateChecklist(id, {
       name: data.name,
       description: data.description,
       type: data.type,
       frequency: data.frequency,
       is_active: data.is_active
     });

     const existingItems = checklist?.items || [];
     const newItems = data.items;

     for (let i = 0; i < newItems.length; i++) {
       const item = newItems[i];
       if (item.id) {
         await checklistService.updateChecklistItem(item.id, {
           title: item.title,
           description: item.description,
           item_type: item.item_type,
           is_required: item.is_required,
           sort_order: i
         });
       } else {
         await checklistService.createChecklistItem({
           checklist_id: id,
           title: item.title,
           description: item.description,
           item_type: item.item_type,
           is_required: item.is_required,
           sort_order: i
         });
       }
     }

     const newItemIds = newItems.filter(item => item.id).map(item => item.id);
     const itemsToDelete = existingItems.filter(item => !newItemIds.includes(item.id));

     for (const item of itemsToDelete) {
       await checklistService.deleteChecklistItem(item.id);
     }

     await checklistService.setChecklistAssets(id, data.assetIds, {
       offsets: data.assetOffsets,
     });
     await checklistService.ensureSchedule(id, data.frequency);
   },
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["checklist", id] });
     queryClient.invalidateQueries({ queryKey: ["checklists"] });
     toast.success("Checklist updated successfully");
     navigate("/checklists");
   },
   onError: (error: any) => {
     toast.error("Failed to update checklist", {
       description: error.message
     });
   }
 });

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();

   if (!formData.name.trim()) {
     toast.error("Please enter a checklist name");
     return;
   }

   if (formData.items.length === 0) {
     toast.error("Please add at least one checklist item");
     return;
   }

   if (mode === "create") {
     createMutation.mutate(formData);
   } else {
     updateMutation.mutate(formData);
   }
 };

 const handleBasicInfoUpdate = (field: keyof Omit<ChecklistFormData, 'items'>, value: any) => {
   setFormData(prev => ({ ...prev, [field]: value }));
 };

 const addItem = () => {
   setFormData(prev => ({
     ...prev,
     items: [
       ...prev.items,
       {
         title: "",
         description: "",
         item_type: "checkbox",
         is_required: false,
         sort_order: prev.items.length
       }
     ]
   }));
 };

 const removeItem = (index: number) => {
   setFormData(prev => ({
     ...prev,
     items: prev.items.filter((_, i) => i !== index)
   }));
 };

 const updateItem = (index: number, field: keyof ChecklistItemForm, value: any) => {
   setFormData(prev => ({
     ...prev,
     items: prev.items.map((item, i) =>
       i === index ? { ...item, [field]: value } : item
     )
   }));
 };

 const moveItem = (index: number, direction: "up" | "down") => {
   if (
     (direction === "up" && index === 0) ||
     (direction === "down" && index === formData.items.length - 1)
   ) {
     return;
   }

   const newIndex = direction === "up" ? index - 1 : index + 1;
   const newItems = [...formData.items];
   [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

   setFormData(prev => ({ ...prev, items: newItems }));
 };

 if (mode === "edit" && isLoading) {
   return (
     <DashboardLayout>
       <div className="flex-1 flex flex-col h-full overflow-hidden bg-background pt-20">
         <div className="text-center py-12 text-on-surface-variant">Loading checklist...</div>
       </div>
     </DashboardLayout>
   );
 }

 return (
   <>
     {/* Multi-step Progress Bar */}
     <div className="w-full bg-surface-container-lowest border-b border-outline-variant/30 px-container_padding py-4">
       <div className="max-w-4xl mx-auto flex justify-between items-center">
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md">1</div>
           <span className="font-label-md text-label-md text-primary">Setup</span>
         </div>
         <div className="h-px flex-1 bg-primary mx-4"></div>
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center font-label-md text-label-md">2</div>
           <span className="font-label-md text-label-md text-primary">Builder</span>
         </div>
         <div className="h-px flex-1 bg-outline-variant/50 mx-4"></div>
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full border-2 border-outline-variant/50 text-on-surface-variant flex items-center justify-center font-label-md text-label-md">3</div>
           <span className="font-label-md text-label-md text-on-surface-variant">Schedule</span>
         </div>
       </div>
     </div>

     <div className="flex-1 flex overflow-hidden">
       {/* Left Sidebar - Component Palette */}
       <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/20 p-4 flex flex-col overflow-y-auto shrink-0">
         <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Question Types</h3>
         <div className="space-y-3">
           <div className="bg-surface border border-outline-variant/30 rounded-lg p-3 flex items-center gap-3 hover:border-primary/50 hover:shadow-sm transition-all cursor-grab">
             <MaterialIcon name="check_box" className="text-primary" />
             <span className="font-label-md text-label-md text-on-surface">Yes/No</span>
             <MaterialIcon name="drag_indicator" className="text-outline-variant ml-auto text-sm" />
           </div>
           <div className="bg-surface border border-outline-variant/30 rounded-lg p-3 flex items-center gap-3 hover:border-primary/50 hover:shadow-sm transition-all cursor-grab">
             <MaterialIcon name="pin" className="text-primary" />
             <span className="font-label-md text-label-md text-on-surface">Numeric Entry</span>
             <MaterialIcon name="drag_indicator" className="text-outline-variant ml-auto text-sm" />
           </div>
           <div className="bg-surface border border-outline-variant/30 rounded-lg p-3 flex items-center gap-3 hover:border-primary/50 hover:shadow-sm transition-all cursor-grab">
             <MaterialIcon name="photo_camera" className="text-primary" />
             <span className="font-label-md text-label-md text-on-surface">Photo Proof</span>
             <MaterialIcon name="drag_indicator" className="text-outline-variant ml-auto text-sm" />
           </div>
           <div className="bg-surface border border-outline-variant/30 rounded-lg p-3 flex items-center gap-3 hover:border-primary/50 hover:shadow-sm transition-all cursor-grab">
             <MaterialIcon name="draw" className="text-primary" />
             <span className="font-label-md text-label-md text-on-surface">Signature</span>
             <MaterialIcon name="drag_indicator" className="text-outline-variant ml-auto text-sm" />
           </div>
         </div>
         <div className="mt-8">
           <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Logic</h3>
           <div className="bg-surface-container-low border border-primary/20 rounded-lg p-3 flex items-center gap-3 hover:border-primary/50 hover:shadow-sm transition-all cursor-grab">
             <MaterialIcon name="call_split" className="text-primary" />
             <span className="font-label-md text-label-md text-on-surface">Conditional Branch</span>
             <MaterialIcon name="drag_indicator" className="text-outline-variant ml-auto text-sm" />
           </div>
         </div>
       </aside>

       {/* Center Canvas - Builder Area */}
       <section className="flex-1 bg-background overflow-y-auto p-8">
         <div className="max-w-3xl mx-auto space-y-6">
           {/* Title block */}
           <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-card_padding">
             <input
               className="w-full bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 font-headline-md text-headline-md text-on-surface px-0 py-2 mb-2 placeholder:text-on-surface-variant/50"
               placeholder="Checklist Title"
               type="text"
               value={formData.name}
               onChange={(e) => handleBasicInfoUpdate("name", e.target.value)}
             />
             <input
               className="w-full bg-transparent border-0 focus:ring-0 font-body-md text-body-md text-on-surface-variant px-0 py-1"
               placeholder="Description (Optional)"
               type="text"
               value={formData.description}
               onChange={(e) => handleBasicInfoUpdate("description", e.target.value)}
             />
           </div>

           {/* Basic info (type, frequency) */}
           <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-card_padding">
             <BasicInformationSection
               formData={formData}
               onUpdate={handleBasicInfoUpdate}
             />
           </div>

           {/* Items drop zone */}
           <div className="space-y-4">
             {formData.items.map((item, index) => (
               <div key={index} className="bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/20 relative group hover:border-primary/30 transition-colors">
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
                 <div className="p-4 flex items-start gap-4">
                   <div className="cursor-grab text-outline-variant hover:text-on-surface pt-2">
                     <MaterialIcon name="drag_indicator" />
                   </div>
                   <div className="flex-1 space-y-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-primary font-label-md text-label-md bg-surface-container-high px-2 py-1 rounded">
                         <MaterialIcon name="check_box" className="text-sm" />
                         {item.item_type === "checkbox" ? "Yes/No" :
                          item.item_type === "number" ? "Numeric Entry" :
                          item.item_type === "text" ? "Text" : "Date"}
                       </div>
                       <div className="flex gap-2">
                         <button
                           type="button"
                           className="text-on-surface-variant hover:text-primary"
                           onClick={() => moveItem(index, "up")}
                         >
                           <MaterialIcon name="content_copy" className="text-sm" />
                         </button>
                         <button
                           type="button"
                           className="text-on-surface-variant hover:text-error"
                           onClick={() => removeItem(index)}
                         >
                           <MaterialIcon name="delete" className="text-sm" />
                         </button>
                       </div>
                     </div>
                     <input
                       className="w-full bg-surface-container-low border-0 rounded focus:ring-2 focus:ring-primary font-body-md text-body-md text-on-surface p-3"
                       type="text"
                       placeholder="Enter checklist item..."
                       value={item.title}
                       onChange={(e) => updateItem(index, "title", e.target.value)}
                     />
                     <div className="flex items-center gap-2 mt-2">
                       <label className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant cursor-pointer">
                         <input
                           checked={item.is_required}
                           className="rounded border-outline-variant text-primary focus:ring-primary"
                           type="checkbox"
                           onChange={(e) => updateItem(index, "is_required", e.target.checked)}
                         />
                         Required
                       </label>
                     </div>
                   </div>
                 </div>
               </div>
             ))}

             {/* Empty state / add button */}
             <div
               onClick={addItem}
               className="border-2 border-dashed border-outline-variant/50 rounded-xl p-8 flex flex-col items-center justify-center text-on-surface-variant bg-surface/50 cursor-pointer hover:border-primary/40 hover:bg-surface-container-low/50 transition-colors"
             >
               <MaterialIcon name="add_circle" className="text-3xl mb-2 text-outline-variant" />
               <p className="font-body-md text-body-md">
                 {formData.items.length === 0
                   ? "Drag components here or click to add your first checklist item"
                   : "Click to add another checklist item"}
               </p>
             </div>
           </div>

           {/* Asset selector */}
           <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-card_padding">
             <ChecklistAssetsSelector
               selectedAssetIds={formData.assetIds}
               onChange={(ids) => setFormData(prev => ({ ...prev, assetIds: ids }))}
               assetOffsets={formData.assetOffsets}
               onOffsetsChange={(offsets) =>
                 setFormData((prev) => ({ ...prev, assetOffsets: offsets }))
               }
             />
           </div>
         </div>
       </section>

       {/* Right Sidebar - Settings */}
       <aside className="w-80 bg-surface-container-lowest border-l border-outline-variant/20 p-6 flex flex-col overflow-y-auto shrink-0">
         <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Schedule Settings</h2>
         <div className="space-y-6">
           <div>
             <label className="font-label-md text-label-md text-on-surface block mb-2">Frequency</label>
             <select
               className="w-full bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary font-body-md text-body-md text-on-surface p-3"
               value={formData.frequency}
               onChange={(e) => handleBasicInfoUpdate("frequency", e.target.value)}
             >
               <option value="daily">Daily</option>
               <option value="weekly">Weekly</option>
               <option value="monthly">Monthly</option>
               <option value="quarterly">Quarterly</option>
               <option value="yearly">Annual</option>
               <option value="one-time">One-time</option>
             </select>
           </div>
           <div>
             <label className="font-label-md text-label-md text-on-surface block mb-2">Type</label>
             <select
               className="w-full bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary font-body-md text-body-md text-on-surface p-3"
               value={formData.type}
               onChange={(e) => handleBasicInfoUpdate("type", e.target.value)}
             >
               <option value="general">General</option>
               <option value="safety">Safety</option>
               <option value="equipment">Equipment</option>
               <option value="maintenance">Maintenance</option>
               <option value="quality">Quality</option>
             </select>
           </div>
         </div>
         <div className="mt-auto pt-6 border-t border-outline-variant/20 flex gap-3">
           <button
             type="button"
             onClick={() => navigate("/checklists")}
             className="flex-1 py-3 px-4 rounded-lg font-label-md text-label-md text-primary bg-transparent border border-primary hover:bg-primary/5 transition-colors"
           >
             Cancel
           </button>
           <button
             type="button"
             onClick={handleSubmit as any}
             disabled={createMutation.isPending || updateMutation.isPending}
             className="flex-1 py-3 px-4 rounded-lg font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container transition-colors shadow-sm disabled:opacity-60"
           >
             {createMutation.isPending || updateMutation.isPending
               ? "Saving..."
               : mode === "create"
               ? "Publish"
               : "Update"}
           </button>
         </div>
       </aside>
     </div>
   </>
 );
};

export default ChecklistForm;
