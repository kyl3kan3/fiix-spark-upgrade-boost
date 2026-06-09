import React, { useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { useNavigate } from "react-router-dom";
import { MaintenanceEvent } from "./types";

interface WeekViewProps {
  events: MaintenanceEvent[];
  date: Date | undefined;
}

const WeekView: React.FC<WeekViewProps> = ({ events, date }) => {
  const navigate = useNavigate();
  const weekStart = startOfWeek(date || new Date(), { weekStartsOn: 1 });

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const day = addDays(weekStart, i);
        return {
          day,
          events: events
            .filter((event) => isSameDay(event.date, day))
            .sort((a, b) => a.date.getTime() - b.date.getTime()),
        };
      }),
    [events, weekStart],
  );

  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const today = days.findIndex(({ day }) => isSameDay(day, date || new Date()));
    return today >= 0 ? today : 0;
  });

  const renderEvent = (event: MaintenanceEvent) => (
    <button
      key={event.id}
      onClick={() => navigate(`/work-orders/${event.id}`)}
      className="w-full text-left p-1.5 bg-primary/10 border border-primary/20 rounded text-xs text-primary hover:bg-primary/20 transition-colors"
    >
      <span className="block font-semibold truncate">{event.title}</span>
      <span className="block text-[10px] opacity-80">{format(event.date, "h:mm a")}</span>
    </button>
  );

  return (
    <div className="w-full">
      <p className="text-sm text-muted-foreground mb-4">
        Week of {format(weekStart, "MMMM d")} – {format(addDays(weekStart, 6), "MMMM d, yyyy")}
      </p>

      {/* Mobile: day picker + vertical list */}
      <div className="sm:hidden">
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {days.map(({ day, events: dayEvents }, index) => (
            <button
              key={day.toISOString()}
              onClick={() => setActiveDayIndex(index)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeDayIndex === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              aria-pressed={activeDayIndex === index}
            >
              {format(day, "EEE d")}
              {dayEvents.length > 0 && ` (${dayEvents.length})`}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {days[activeDayIndex].events.length > 0 ? (
            days[activeDayIndex].events.map(renderEvent)
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-6">
              No events scheduled
            </p>
          )}
        </div>
      </div>

      {/* Tablet/desktop: 7-day grid */}
      <div className="hidden sm:grid grid-cols-7 gap-2">
        {days.map(({ day, events: dayEvents }) => (
          <div key={day.toISOString()} className="min-w-0">
            <div
              className={`text-center text-xs font-semibold py-1.5 rounded-t-md border border-b-0 border-border ${
                isSameDay(day, new Date())
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {format(day, "EEE d")}
            </div>
            <div className="border border-border rounded-b-md p-1.5 space-y-1.5 min-h-[120px]">
              {dayEvents.map(renderEvent)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
