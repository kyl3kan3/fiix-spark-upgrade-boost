import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
type Day = (typeof DAYS)[number];
const DAY_SHORT: Record<Day, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
};
const TIMES = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"];
const EVENT_OPTIONS = [
  "HVAC Check",
  "Electrical Inspection",
  "Plumbing Repair",
  "Generator Test",
];

// Stable mock schedule so mobile/desktop views match and don't reshuffle on rerender.
const SCHEDULE: Record<string, string | null> = (() => {
  const map: Record<string, string | null> = {};
  DAYS.forEach((day, di) => {
    TIMES.forEach((time, ti) => {
      const seed = (di * 7 + ti * 13) % 10;
      map[`${day}-${time}`] = seed < 3 ? EVENT_OPTIONS[(di + ti) % EVENT_OPTIONS.length] : null;
    });
  });
  return map;
})();

const WeekView: React.FC = () => {
  const [activeDay, setActiveDay] = useState<Day>("Monday");

  const daySlots = useMemo(
    () => TIMES.map((time) => ({ time, event: SCHEDULE[`${activeDay}-${time}`] })),
    [activeDay],
  );

  return (
    <div className="w-full">
      <Tabs defaultValue="week-view">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="week-view" className="text-xs sm:text-sm">Week View</TabsTrigger>
        </TabsList>

        <TabsContent value="week-view">
          {/* Mobile: day picker + vertical list */}
          <div className="sm:hidden">
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeDay === day
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  aria-pressed={activeDay === day}
                >
                  {DAY_SHORT[day]}
                </button>
              ))}
            </div>
            <ul className="divide-y divide-border rounded-md border border-border">
              {daySlots.map(({ time, event }) => (
                <li key={time} className="flex items-center justify-between gap-3 p-3">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {time}
                  </span>
                  {event ? (
                    <span className="flex-1 text-right text-sm px-2 py-1 bg-primary/10 border border-primary/20 rounded text-primary">
                      {event}
                    </span>
                  ) : (
                    <span className="flex-1 text-right text-xs text-muted-foreground italic">
                      No events
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Tablet/desktop: 5-day table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border p-1 sm:p-2 bg-muted text-xs sm:text-sm font-medium">Time</th>
                  {DAYS.map((day) => (
                    <th key={day} className="border p-1 sm:p-2 bg-muted text-xs sm:text-sm font-medium">
                      {DAY_SHORT[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMES.map((time) => (
                  <tr key={time}>
                    <td className="border p-1 sm:p-2 font-medium text-xs sm:text-sm whitespace-nowrap">{time}</td>
                    {DAYS.map((day) => {
                      const event = SCHEDULE[`${day}-${time}`];
                      return (
                        <td key={`${day}-${time}`} className="border p-1 sm:p-2 min-w-[100px]">
                          {event ? (
                            <div className="p-1 bg-primary/10 border border-primary/20 rounded text-xs text-primary">
                              {event}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeekView;
