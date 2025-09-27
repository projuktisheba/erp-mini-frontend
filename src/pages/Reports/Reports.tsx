import React from "react";
import PageMeta from "../../components/common/PageMeta";


interface Report {
  id: string;
  title: string;
  date: string;
  status: "Completed" | "Pending" | "In Progress";
}

const dummyReports: Report[] = [
  { id: "RPT001", title: "Monthly Sales Report", date: "2025-09-01", status: "Completed" },
  { id: "RPT002", title: "Inventory Audit", date: "2025-09-10", status: "Pending" },
  { id: "RPT003", title: "Employee Attendance", date: "2025-09-15", status: "In Progress" },
];

const Reports: React.FC = () => {
  return (
    <>
      <PageMeta title="Reports | ERP Mini" description="View all reports" />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold dark:text-white">Reports</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyReports.map((report) => (
            <div
              key={report.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold dark:text-white">{report.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">Date: {report.date}</p>
              <p className={`text-sm font-medium mt-2 ${
                report.status === "Completed"
                  ? "text-green-600 dark:text-green-400"
                  : report.status === "Pending"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}>
                Status: {report.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Reports;
