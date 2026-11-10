
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AssetDistributionData {
 name: string;
 assets: number;
}

interface HierarchyData {
 level: string;
 count: number;
}

interface LocationAnalyticsChartsProps {
 assetDistribution: AssetDistributionData[];
 hierarchyData: HierarchyData[];
}

const COLORS = ['#5057C8', '#2E8B4E', '#B58A00', '#C3261D', '#1591A8'];

export const LocationAnalyticsCharts: React.FC<LocationAnalyticsChartsProps> = ({
 assetDistribution,
 hierarchyData,
}) => {
 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Asset Distribution Chart */}
 <Card>
 <CardHeader>
 <CardTitle>Asset Distribution by Location</CardTitle>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={assetDistribution}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
 <YAxis />
 <Tooltip />
 <Bar dataKey="assets" fill="#5057C8" />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 {/* Hierarchy Distribution Chart */}
 <Card>
 <CardHeader>
 <CardTitle>Hierarchy Distribution</CardTitle>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={hierarchyData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, value }) => `${name}: ${value}`}
 outerRadius={80}
 fill="#5057C8"
 dataKey="count"
 >
 {hierarchyData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </div>
 );
};
