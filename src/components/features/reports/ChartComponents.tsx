
import React from "react";
import {
 BarChart,
 Bar,
 LineChart,
 Line,
 PieChart,
 Pie,
 Cell,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

// Colors for charts
const COLORS = ['#1F63CF', '#0F8A86', '#B58A00', '#C2610C', '#5057C8', '#2E8B4E'];

export type ChartDatum = Record<string, string | number>;

interface ChartProps {
 data: ChartDatum[];
}

export const BarChartComponent: React.FC<ChartProps> = ({ data }) => {
 return (
 <ChartContainer
 className="h-full w-full"
 config={{
 workOrders: { label: "Work Orders", color: "#1F63CF" },
 completed: { label: "Completed", color: "#2E8B4E" },
 inProgress: { label: "In Progress", color: "#C2610C" },
 }}
 >
 <BarChart
 data={data}
 margin={{
 top: 5,
 right: 30,
 left: 20,
 bottom: 5,
 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" />
 <YAxis />
 <Tooltip />
 <Legend />
 <Bar dataKey="workOrders" fill="#1F63CF" />
 <Bar dataKey="completed" fill="#2E8B4E" />
 <Bar dataKey="inProgress" fill="#C2610C" />
 </BarChart>
 </ChartContainer>
 );
};

export const LineChartComponent: React.FC<ChartProps> = ({ data }) => {
 return (
 <ChartContainer
 className="h-full w-full"
 config={{
 preventive: { label: "Preventive", color: "#2E8B4E" },
 corrective: { label: "Corrective", color: "#C2610C" },
 }}
 >
 <LineChart
 data={data}
 margin={{
 top: 5,
 right: 30,
 left: 20,
 bottom: 5,
 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" />
 <YAxis />
 <Tooltip />
 <Legend />
 <Line type="monotone" dataKey="preventive" stroke="#2E8B4E" activeDot={{ r: 8 }} />
 <Line type="monotone" dataKey="corrective" stroke="#C2610C" />
 </LineChart>
 </ChartContainer>
 );
};

export const PieChartComponent: React.FC<ChartProps> = ({ data }) => {
 return (
 <ChartContainer
 className="h-full w-full"
 config={{
 value: { label: "Value", color: "#1F63CF" },
 }}
 >
 <PieChart>
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 labelLine={false}
 outerRadius={80}
 fill="#5057C8"
 dataKey="value"
 nameKey="name"
 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
 >
 {data.map((_, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ChartContainer>
 );
};
