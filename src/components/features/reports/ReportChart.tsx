
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterIcon, Download, Loader2, BarChart3, PieChart, LineChart } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart as RechartLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart as RechartBarChart,
  Bar,
  PieChart as RechartPieChart,
  Pie,
  Cell
} from "recharts";

interface ReportChartProps {
  reportType: string;
  data: any[];
  isMobile: boolean;
  isExporting: boolean;
  onExport: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

const ReportChart: React.FC<ReportChartProps> = ({ reportType, data, isMobile, isExporting, onExport }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {reportType === "Work Order Statistics" && <BarChart3 className="h-5 w-5" />}
            {reportType === "Asset Performance" && <PieChart className="h-5 w-5" />}
            {reportType === "Maintenance Trends" && <LineChart className="h-5 w-5" />}
            <span>{reportType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FilterIcon className="h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Filter</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={onExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className={isMobile ? "sr-only" : ""}>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span className={isMobile ? "sr-only" : ""}>Export PDF</span>
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            {reportType === "Work Order Statistics" ? (
              <RechartBarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requested" fill="#8884d8" name="Work Orders Requested" />
                <Bar dataKey="completed" fill="#82ca9d" name="Work Orders Completed" />
                <Bar dataKey="onTime" fill="#0088fe" name="Completed On Time" />
                <Bar dataKey="late" fill="#ff8042" name="Completed Late" />
              </RechartBarChart>
            ) : reportType === "Asset Performance" ? (
              <RechartBarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="reliability" fill="#8884d8" name="Reliability %" />
                <Bar yAxisId="left" dataKey="downtime" fill="#ff8042" name="Downtime %" />
                <Bar yAxisId="right" dataKey="maintenanceCost" fill="#82ca9d" name="Maintenance Cost ($)" />
              </RechartBarChart>
            ) : (
              <RechartLineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="preventive" stroke="#8884d8" activeDot={{ r: 8 }} name="Preventive" />
                <Line yAxisId="left" type="monotone" dataKey="corrective" stroke="#ff8042" activeDot={{ r: 8 }} name="Corrective" />
                <Line yAxisId="right" type="monotone" dataKey="costs" stroke="#82ca9d" activeDot={{ r: 8 }} name="Costs ($)" />
              </RechartLineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportChart;
