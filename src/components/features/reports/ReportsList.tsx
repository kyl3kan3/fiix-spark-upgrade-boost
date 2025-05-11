
import React from "react";
import ReportCard from "./ReportCard";

interface ReportsListProps {
  onGenerateReport: (reportType: string) => void;
}

const ReportsList: React.FC<ReportsListProps> = ({ onGenerateReport }) => {
  const reportTypes = [
    {
      title: "Work Order Statistics",
      description: "Analyze work order completion rates, average resolution times, and more.",
      icon: "bar" as const,
      type: "Work Order Statistics"
    },
    {
      title: "Asset Performance",
      description: "View equipment reliability, downtime analysis, and maintenance costs.",
      icon: "pie" as const,
      type: "Asset Performance"
    },
    {
      title: "Maintenance Trends",
      description: "Track preventive vs. corrective maintenance over time and identify patterns.",
      icon: "line" as const,
      type: "Maintenance Trends"
    }
  ];

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Available Reports</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <ReportCard
            key={report.title}
            title={report.title}
            description={report.description}
            icon={report.icon}
            onGenerate={() => onGenerateReport(report.type)}
          />
        ))}
      </div>
    </div>
  );
};

export default ReportsList;
