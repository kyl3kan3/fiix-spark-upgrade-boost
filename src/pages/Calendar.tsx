
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Filter, Users } from "lucide-react";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeView, setActiveView] = useState("month");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  
  // Sample data for maintenance events
  const events = [
    {
      id: 1,
      title: "HVAC Maintenance",
      description: "Regular maintenance check for HVAC system in Building A",
      date: new Date(2025, 4, 12), // May 12, 2025
      technician: "Sarah Johnson",
      status: "scheduled",
      type: "preventive",
      duration: "2 hours",
    },
    {
      id: 2,
      title: "Electrical Inspection",
      description: "Annual electrical system inspection for compliance",
      date: new Date(2025, 4, 15), // May 15, 2025
      technician: "Michael Lee",
      status: "scheduled",
      type: "inspection",
      duration: "3 hours",
    },
    {
      id: 3,
      title: "Broken Elevator Repair",
      description: "Urgent repair for elevator #3 in main building",
      date: new Date(), // Today
      technician: "Sarah Johnson",
      status: "in-progress",
      type: "corrective",
      duration: "4 hours",
    },
    {
      id: 4,
      title: "Generator Testing",
      description: "Monthly backup generator testing and maintenance",
      date: new Date(2025, 4, 20), // May 20, 2025
      technician: "John Smith",
      status: "scheduled",
      type: "preventive",
      duration: "1 hour",
    },
    {
      id: 5,
      title: "Plumbing System Check",
      description: "Quarterly plumbing system inspection",
      date: new Date(2025, 4, 10), // May 10, 2025
      technician: "Emily Davis",
      status: "completed",
      type: "inspection",
      duration: "2 hours",
    },
  ];

  const technicians = [
    { id: 1, name: "All Technicians", value: "all" },
    { id: 2, name: "John Smith", value: "John Smith" },
    { id: 3, name: "Sarah Johnson", value: "Sarah Johnson" },
    { id: 4, name: "Michael Lee", value: "Michael Lee" },
    { id: 5, name: "Emily Davis", value: "Emily Davis" },
  ];

  // Filter events by selected date and technician
  const filteredEvents = events.filter((event) => {
    const isTechnicianMatch = technicianFilter === "all" || event.technician === technicianFilter;
    
    if (activeView === "day" && date) {
      return (
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear() &&
        isTechnicianMatch
      );
    }
    
    return isTechnicianMatch;
  });

  // Status color mapping
  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  // Type color mapping
  const typeColors: Record<string, string> = {
    preventive: "bg-purple-100 text-purple-800 border-purple-200",
    corrective: "bg-orange-100 text-orange-800 border-orange-200",
    inspection: "bg-teal-100 text-teal-800 border-teal-200",
  };

  // Function to check if a date has events
  const hasEvents = (day: Date) => {
    return events.some(
      (event) =>
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    );
  };

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
          <p className="text-gray-500">Schedule and manage maintenance events</p>
        </div>
        <Button className="bg-maintenease-600 hover:bg-maintenease-700">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border p-3 pointer-events-auto"
              modifiers={{
                hasEvents: hasEvents,
              }}
              modifiersStyles={{
                hasEvents: {
                  fontWeight: 'bold',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                },
              }}
            />

            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Filter by Technician</label>
              <Select
                value={technicianFilter}
                onValueChange={setTechnicianFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.value}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Event Types</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                  <span className="text-sm">Preventive</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-orange-400 mr-2"></span>
                  <span className="text-sm">Corrective</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-teal-400 mr-2"></span>
                  <span className="text-sm">Inspection</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>
                {date ? format(date, "MMMM d, yyyy") : "Scheduled Events"}
              </CardTitle>
              <Tabs
                defaultValue="day"
                value={activeView}
                onValueChange={setActiveView}
                className="w-[260px]"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>
              {technicianFilter === "all"
                ? "All technicians"
                : `Technician: ${technicianFilter}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="day" className="mt-0">
              <div className="space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <Card key={event.id} className={`border-l-4 ${typeColors[event.type].split(' ')[2] || 'border-gray-200'}`}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {event.description}
                            </CardDescription>
                          </div>
                          <Badge className={statusColors[event.status]}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                          <div>
                            <p className="text-gray-500">Technician</p>
                            <p className="font-medium">{event.technician}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Time</p>
                            <p className="font-medium">{format(event.date, "h:mm a")}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Type</p>
                            <p className="font-medium capitalize">{event.type}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-medium">{event.duration}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button size="sm">Update Status</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No maintenance events scheduled for this day.
                    </p>
                    <div className="mt-6">
                      <Button>Schedule New Event</Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="week" className="mt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-50">Time</th>
                      <th className="border p-2 bg-gray-50">Monday</th>
                      <th className="border p-2 bg-gray-50">Tuesday</th>
                      <th className="border p-2 bg-gray-50">Wednesday</th>
                      <th className="border p-2 bg-gray-50">Thursday</th>
                      <th className="border p-2 bg-gray-50">Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"].map((time) => (
                      <tr key={time}>
                        <td className="border p-2 font-medium text-sm">{time}</td>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                          <td key={`${day}-${time}`} className="border p-2">
                            {Math.random() > 0.7 ? (
                              <div className="p-1 bg-blue-50 border border-blue-200 rounded text-sm">
                                {["HVAC Check", "Electrical Inspection", "Plumbing Repair", "Generator Test"][Math.floor(Math.random() * 4)]}
                              </div>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="month" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events
                  .filter((event) => technicianFilter === "all" || event.technician === technicianFilter)
                  .map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader className={`p-4 pb-2 ${typeColors[event.type].split(' ')[0]} ${typeColors[event.type].split(' ')[1]}`}>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <Badge className={statusColors[event.status]}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1 font-medium">
                          {format(event.date, "MMMM d, yyyy")} at {format(event.date, "h:mm a")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm mb-3">{event.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{event.technician}</span>
                          </div>
                          <span>{event.duration}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
