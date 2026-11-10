
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
const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];

export type ChartDatum = Record<string, string | number>;

interface ChartProps {
 data: ChartDatum[];
}

export const BarChartComponent: React.FC<ChartProps> = ({ data }) => {
 return (
 <ChartContainer
 className="h-full w-full"
 config={{
 workOrders: { label: "Work Orders", color: "var(--chart-1)" },
 completed: { label: "Completed", color: "var(--chart-2)" },
 inProgress: { label: "In Progress", color: "var(--chart-3)" },
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
 <Bar dataKey="workOrders" fill="var(--chart-1)" />
 <Bar dataKey="completed" fill="var(--chart-2)" />
 <Bar dataKey="inProgress" fill="var(--chart-3)" />
 </BarChart>
 </ChartContainer>
 );
};

export const LineChartComponent: React.FC<ChartProps> = ({ data }) => {
 return (
 <ChartContainer
 className="h-full w-full"
 config={{
 preventive: { label: "Preventive", color: "var(--chart-1)" },
 corrective: { label: "Corrective", color: "var(--chart-2)" },
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
 <Line type="monotone" dataKey="preventive" stroke="var(--chart-1)" activeDot={{ r: 8 }} />
 <Line type="monotone" dataKey="corrective" stroke="var(--chart-2)" />
 </LineChart>
 </ChartContainer>
 );
};

export const PieChartComponent: React.FC<ChartProps> = ({ data }) => {
 return (
 <ChartContainer
 className="h-full w-full"
 config={{
 value: { label: "Value", color: "var(--chart-1)" },
 }}
 >
 <PieChart>
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 labelLine={false}
 outerRadius={80}
 fill="var(--chart-1)"
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
