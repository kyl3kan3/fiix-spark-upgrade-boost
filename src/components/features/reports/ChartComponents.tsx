
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
  ResponsiveContainer
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface ChartProps {
  data: any[];
}

export const BarChartComponent: React.FC<ChartProps> = ({ data }) => {
  return (
    <ChartContainer
      config={{
        workOrders: { label: "Work Orders", color: "#1976D2" },
        completed: { label: "Completed", color: "#4CAF50" },
        inProgress: { label: "In Progress", color: "#FF9800" },
      }}
    >
      <BarChart
        width={500}
        height={300}
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
        <Bar dataKey="workOrders" fill="#1976D2" />
        <Bar dataKey="completed" fill="#4CAF50" />
        <Bar dataKey="inProgress" fill="#FF9800" />
      </BarChart>
    </ChartContainer>
  );
};

export const LineChartComponent: React.FC<ChartProps> = ({ data }) => {
  return (
    <ChartContainer
      config={{
        preventive: { label: "Preventive", color: "#4CAF50" },
        corrective: { label: "Corrective", color: "#FF9800" },
      }}
    >
      <LineChart
        width={500}
        height={300}
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
        <Line type="monotone" dataKey="preventive" stroke="#4CAF50" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="corrective" stroke="#FF9800" />
      </LineChart>
    </ChartContainer>
  );
};

export const PieChartComponent: React.FC<ChartProps> = ({ data }) => {
  return (
    <ChartContainer
      config={{
        value: { label: "Value", color: "#1976D2" },
      }}
    >
      <PieChart width={500} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
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
