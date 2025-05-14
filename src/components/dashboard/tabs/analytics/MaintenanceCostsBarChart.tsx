
import React from "react";
import { BarChart3 } from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart as RechartBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MaintenanceCostsChartProps {
  data: Array<{
    month: string;
    planned: number;
    unplanned: number;
  }>;
  onDataNotAvailable: () => void;
}

const MaintenanceCostsBarChart: React.FC<MaintenanceCostsChartProps> = ({ 
  data, 
  onDataNotAvailable 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <span>Maintenance Costs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]" onClick={onDataNotAvailable}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartBarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#3B82F6" name="Planned Maintenance" />
              <Bar dataKey="unplanned" fill="#EC4899" name="Unplanned Maintenance" />
            </RechartBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceCostsBarChart;
