
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
  Bar
} from "recharts";

interface ReportChartProps {
  reportType: string;
  data: any[];
  isMobile: boolean;
  isExporting: boolean;
  onExport: () => void;
}

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
              </RechartBarChart>
            ) : reportType === "Asset Performance" ? (
              <RechartLineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#8884d8" activeDot={{ r: 8 }} name="Performance Rating" />
              </RechartLineChart>
            ) : (
              <RechartLineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requested" stroke="#8884d8" activeDot={{ r: 8 }} name="Preventive" />
                <Line type="monotone" dataKey="completed" stroke="#82ca9d" activeDot={{ r: 8 }} name="Corrective" />
              </RechartLineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportChart;
