
import React from "react";
import { PieChart } from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart as RechartPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AssetStatusChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  onDataNotAvailable: () => void;
}

const AssetStatusPieChart: React.FC<AssetStatusChartProps> = ({ 
  data, 
  onDataNotAvailable 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          <span>Asset Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]" onClick={onDataNotAvailable}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetStatusPieChart;
