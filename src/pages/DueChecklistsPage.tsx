import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { checklistService } from "@/services/checklistService";
import { Checklist, ChecklistFrequencies } from "@/types/checklists";
import { format, formatDistanceToNowStrict, isToday, startOfDay, endOfDay } from "date-fns";
import { dueAssetIds } from "@/lib/checklists/scheduling";
import { MaterialIcon } from "@/components/ui/material-icon";

type Bucket = "overdue" | "today" | "upcoming";

const bucketFor = (nextDueAt: string | null | undefined): Bucket | null => {
 if (!nextDueAt) return null;
 const due = new Date(nextDueAt);
 const now = new Date();
 if (due < startOfDay(now)) return "overdue";
 if (due <= endOfDay(now)) return "today";
 return "upcoming";
};

const freqLabel = (v: string) =>
 ChecklistFrequencies.find((f) => f.value === v)?.label || v;

const ChecklistRow: React.FC<{ checklist: Checklist; bucket: Bucket }> = ({ checklist, bucket }) => {
 const navigate = useNavigate();
 const due = checklist.schedule?.next_due_at ? new Date(checklist.schedule.next_due_at) : null;

 const dueLabel = due
   ? bucket === "overdue"
     ? `Overdue by ${formatDistanceToNowStrict(due)}`
     : isToday(due)
     ? `Due ${format(due, "h:mm a")}`
     : `Due ${format(due, "MMM d, h:mm a")}`
   : "No schedule";

 const total = checklist.asset_ids?.length ?? 0;
 const readyNow = total
   ? dueAssetIds(
       checklist.schedule?.next_due_at,
       checklist.asset_ids ?? [],
       checklist.asset_offsets ?? {},
     ).length
   : 0;
 const waiting = total - readyNow;

 const borderColor = bucket === "overdue" ? "border-l-error" : bucket === "today" ? "border-l-warning" : "border-l-primary";
 const dueColor = bucket === "overdue" ? "text-error" : bucket === "today" ? "text-warning" : "text-secondary";

 return (
   <div
     onClick={() => navigate(`/checklists/${checklist.id}/submit`)}
     className={`bg-surface-container-lowest rounded-xl shadow-level-1 border border-l-4 ${borderColor} border-transparent hover:shadow-level-2 hover:-translate-y-1 transition-all duration-300 p-card_padding group flex flex-col sm:flex-row gap-6 cursor-pointer`}
   >
     <div className="flex-1">
       <div className="flex items-center gap-3 mb-2">
         <span className="bg-surface-container-high text-primary font-label-sm text-label-sm px-2 py-1 rounded uppercase tracking-wider">
           {freqLabel(checklist.frequency)}
         </span>
         <h4 className="font-headline-md text-[20px] text-on-surface font-semibold group-hover:text-primary transition-colors">
           {checklist.name}
         </h4>
       </div>
       {checklist.description && (
         <p className="font-body-md text-body-md text-on-surface-variant mb-4">{checklist.description}</p>
       )}
       <div className="flex flex-wrap gap-4 text-label-sm font-label-sm text-secondary">
         {total > 0 && (
           <span className="flex items-center gap-1">
             <MaterialIcon name="precision_manufacturing" className="text-[16px]" />
             {readyNow}/{total} assets ready
             {waiting > 0 && bucket !== "upcoming" && (
               <span className="ml-1 text-primary">· {waiting} staggered</span>
             )}
           </span>
         )}
         <span className={`flex items-center gap-1 font-medium ${dueColor}`}>
           <MaterialIcon name="schedule" className="text-[16px]" />
           {dueLabel}
         </span>
       </div>
     </div>
     <div className="sm:w-48 flex flex-col justify-between gap-4 border-t sm:border-t-0 sm:border-l border-outline-variant/20 pt-4 sm:pt-0 sm:pl-6">
       <div className="text-center sm:text-right">
         <span className={`block text-label-sm font-label-sm ${dueColor} uppercase tracking-wider mb-1`}>
           {bucket === "overdue" ? "Overdue" : bucket === "today" ? "Due Today" : "Upcoming"}
         </span>
       </div>
       <button
         onClick={(e) => { e.stopPropagation(); navigate(`/checklists/${checklist.id}/submit`); }}
         className={`w-full ${bucket === "overdue" ? "bg-primary text-on-primary hover:bg-on-primary-fixed-variant" : "bg-surface-container border border-primary/20 text-primary hover:bg-surface-container-high"} py-2.5 rounded-lg font-label-md text-label-md uppercase tracking-wider transition-colors shadow-sm flex justify-center items-center gap-2`}
       >
         <MaterialIcon name="play_arrow" className="text-[18px]" />
         Start Check
       </button>
     </div>
   </div>
 );
};

const DueChecklistsPage: React.FC = () => {
 const navigate = useNavigate();
 const { data: scheduled = [], isLoading } = useQuery({
   queryKey: ["scheduled-checklists"],
   queryFn: checklistService.getScheduledChecklists,
   refetchInterval: 5 * 60 * 1000,
 });

 const { overdue, today, upcoming } = useMemo(() => {
   const groups: { overdue: Checklist[]; today: Checklist[]; upcoming: Checklist[] } = {
     overdue: [],
     today: [],
     upcoming: [],
   };
   scheduled.forEach((c) => {
     const b = bucketFor(c.schedule?.next_due_at);
     if (b) groups[b].push(c);
   });
   const sevenDays = new Date();
   sevenDays.setDate(sevenDays.getDate() + 7);
   groups.upcoming = groups.upcoming.filter((c) => {
     const d = c.schedule?.next_due_at ? new Date(c.schedule.next_due_at) : null;
     return d && d <= sevenDays;
   });
   return groups;
 }, [scheduled]);

 const totalAssigned = overdue.length + today.length + upcoming.length;
 const donePct = totalAssigned > 0 ? Math.round((upcoming.length / totalAssigned) * 100) : 65;
 const ringOffset = 251.2 - (251.2 * donePct / 100);

 return (
   <DashboardLayout>
     <Helmet>
       <title>Due Today — PM Checklists | MaintenEase</title>
       <meta name="description" content="View and complete today's preventive maintenance checklists." />
     </Helmet>

     <div className="flex-1 w-full pt-6 px-4 md:px-container_padding pb-24 md:pb-12 max-w-[1600px] mx-auto">
       {/* Page Header */}
       <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
           <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight mb-2">
             Today's Preventive Maintenance
           </h2>
           <p className="font-body-lg text-body-lg text-on-surface-variant">
             {overdue.length > 0
               ? `Prioritize high-impact equipment checks. ${overdue.length} critical item${overdue.length !== 1 ? "s" : ""} overdue.`
               : "View and complete your scheduled maintenance tasks."}
           </p>
         </div>
         <div className="flex items-center gap-2 text-label-md font-label-md text-secondary">
           <MaterialIcon name="calendar_today" className="text-[18px]" />
           <span>{format(new Date(), "MMM d, yyyy")}</span>
         </div>
       </div>

       {isLoading ? (
         <div className="text-center py-12 text-on-surface-variant">Loading…</div>
       ) : scheduled.length === 0 ? (
         <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-12 text-center border border-transparent">
           <MaterialIcon name="check_circle" className="text-[48px] text-success block mx-auto mb-4" />
           <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No scheduled checklists</h3>
           <p className="font-body-md text-body-md text-secondary mb-6">
             Create a checklist with a recurring frequency to start seeing prompts here.
           </p>
           <button
             onClick={() => navigate("/checklists/new")}
             className="bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md uppercase tracking-wider hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex justify-center items-center gap-2 mx-auto px-6"
           >
             <MaterialIcon name="add" />
             Create a Checklist
           </button>
         </div>
       ) : (
         /* Bento Grid Layout */
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
           {/* Daily Progress Widget */}
           <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-level-1 p-card_padding border border-transparent hover:border-primary/10 transition-colors flex flex-col justify-between">
             <div className="flex justify-between items-start mb-6">
               <h3 className="font-headline-md text-headline-md text-on-surface">Daily Progress</h3>
               <button className="text-primary hover:bg-surface-container-low p-1 rounded-full transition-colors">
                 <MaterialIcon name="more_vert" />
               </button>
             </div>
             <div className="flex-1 flex flex-col items-center justify-center relative my-4">
               <svg className="w-40 h-40" viewBox="0 0 100 100">
                 <circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                 <circle
                   className="text-primary stroke-current"
                   cx="50" cy="50" fill="transparent" r="40"
                   strokeDasharray="251.2"
                   strokeDashoffset={ringOffset}
                   strokeLinecap="round"
                   strokeWidth="8"
                   style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                 ></circle>
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="font-display-lg text-display-lg text-primary">
                   {donePct}<span className="text-2xl">%</span>
                 </span>
                 <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mt-1">Complete</span>
               </div>
             </div>
             <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between text-label-md font-label-md">
               <div className="text-center">
                 <span className="block text-on-surface text-lg">{totalAssigned}</span>
                 <span className="text-secondary">Assigned</span>
               </div>
               <div className="text-center">
                 <span className="block text-success text-lg">{upcoming.length}</span>
                 <span className="text-secondary">Upcoming</span>
               </div>
               <div className="text-center">
                 <span className="block text-error text-lg">{overdue.length}</span>
                 <span className="text-secondary">Overdue</span>
               </div>
             </div>
           </div>

           {/* High Priority Tasks */}
           <div className="lg:col-span-8 flex flex-col gap-base_unit">
             {overdue.length > 0 && (
               <>
                 <div className="flex justify-between items-center mb-2">
                   <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                     <MaterialIcon name="warning" className="text-error" />
                     Critical Checks
                   </h3>
                   <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider font-bold">Action Required</span>
                 </div>
                 {overdue.map((c) => (
                   <ChecklistRow key={c.id} checklist={c} bucket="overdue" />
                 ))}
               </>
             )}

             {today.length > 0 && (
               <>
                 <h3 className="font-headline-md text-headline-md text-on-surface mt-4 mb-2">Due Today</h3>
                 {today.map((c) => (
                   <ChecklistRow key={c.id} checklist={c} bucket="today" />
                 ))}
               </>
             )}

             {overdue.length === 0 && today.length === 0 && (
               <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-8 border border-transparent text-center flex flex-col items-center gap-2">
                 <MaterialIcon name="check_circle" className="text-[36px] text-success" />
                 <p className="font-headline-md text-headline-md text-on-surface">All caught up!</p>
                 <p className="font-body-md text-body-md text-secondary">No overdue or due-today items.</p>
               </div>
             )}
           </div>

           {/* Standard Operational Checks — upcoming */}
           {upcoming.length > 0 && (
             <div className="lg:col-span-12 mt-4">
               <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Coming Up (Next 7 Days)</h3>
               <div className="bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden">
                 <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-outline-variant/20 bg-surface-bright text-label-sm font-label-sm text-secondary uppercase tracking-wider">
                   <div className="col-span-6">Task Description</div>
                   <div className="col-span-3">Frequency</div>
                   <div className="col-span-3 text-right">Status</div>
                 </div>
                 {upcoming.map((c) => (
                   <div
                     key={c.id}
                     onClick={() => navigate(`/checklists/${c.id}/submit`)}
                     className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors items-center cursor-pointer"
                   >
                     <div className="col-span-1 sm:col-span-6 flex items-start gap-3">
                       <div className="mt-0.5 w-5 h-5 rounded border-2 border-outline-variant flex items-center justify-center hover:border-primary transition-colors"></div>
                       <div>
                         <h5 className="font-label-md text-label-md text-on-surface">{c.name}</h5>
                         {c.description && (
                           <p className="font-body-md text-[14px] text-on-surface-variant mt-0.5">{c.description}</p>
                         )}
                       </div>
                     </div>
                     <div className="col-span-1 sm:col-span-3 hidden sm:flex items-center">
                       <span className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded">
                         {freqLabel(c.frequency)}
                       </span>
                     </div>
                     <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-end items-center">
                       <span className="sm:hidden text-label-sm text-secondary">Status:</span>
                       <span className="text-secondary font-label-sm text-label-sm flex items-center gap-1">
                         <MaterialIcon name="pending" className="text-[16px]" /> Upcoming
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>
       )}
     </div>
   </DashboardLayout>
 );
};

export default DueChecklistsPage;
