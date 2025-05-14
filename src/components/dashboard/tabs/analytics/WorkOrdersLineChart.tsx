
import React from "react";
import { LineChart } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart as RechartLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface WorkOrdersChartProps {
  data: Array<{
    month: string;
    completed: number;
    pending: number;
    canceled: number;
  }>;
  onDataNotAvailable: () => void;
}

const WorkOrdersLineChart: React.FC<WorkOrdersChartProps> = ({ 
  data, 
  onDataNotAvailable 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          <span>Work Orders Over Time</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]" onClick={onDataNotAvailable}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartLineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                content={(props) => (
                  <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md text-xs">
                    <p className="font-medium">{props.payload?.[0]?.payload?.month}</p>
                    {props.payload?.map((entry, index) => (
                      <p key={index} className="flex items-center gap-2">
                        <span 
                          className="block w-2 h-2 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span>{entry.name}: {entry.value}</span>
                      </p>
                    ))}
                  </div>
                )} 
              />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#10B981" activeDot={{ r: 8 }} strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="pending" stroke="#F59E0B" activeDot={{ r: 8 }} strokeWidth={2} name="Pending" />
              <Line type="monotone" dataKey="canceled" stroke="#EF4444" activeDot={{ r: 8 }} strokeWidth={2} name="Canceled" />
            </RechartLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrdersLineChart;
