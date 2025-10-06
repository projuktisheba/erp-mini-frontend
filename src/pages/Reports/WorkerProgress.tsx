import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";
import { AppContext } from "../../context/AppContext";

interface WorkerProgressItem {
  date: string;
  order_count: number;
  total_production_units: number;
  sale: number;
  sale_return: number;
  comment: string;
  total_overtime_hours?: number;
  total_advance_payment?: number;
  present_days?: string;
}

const WorkerProgress: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext not provided");
  }
  const { branchId } = context;

  const [data, setData] = useState<WorkerProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [workerId, setWorkerId] = useState<number>(1);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Helper function to set start and end date based on reportType
  const updateDates = (type: "daily" | "weekly" | "monthly") => {
    const today = new Date();
    let start: Date;

    if (type === "daily") {
      start = today;
    } else if (type === "weekly") {
      start = new Date(today);
      start.setDate(today.getDate() - 6);
    } else {
      start = new Date(today);
      start.setMonth(today.getMonth() - 1);
    }

    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
  };

  const fetchWorkerProgress = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/reports/worker/progress`, {
        headers: {
          "X-Branch-ID": branchId,
        },
        params: {
          worker_id: workerId,
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });

      console.log(res.data);
      setData(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch worker progress:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to print report for a specific date
  const handlePrint = (item: WorkerProgressItem) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Worker Progress Report - ${item.date}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <h1>Worker Progress Report</h1>
          <h3>Date: ${item.date}</h3>
          <table>
            <tr><th>Total Production Units</th><td>${
              item.total_production_units
            }</td></tr>
            <tr><th>Total Overtime Hours</th><td>${
              item.total_overtime_hours || "-"
            }</td></tr>
            <tr><th>Total Advance Payment</th><td>${
              item.total_advance_payment || "-"
            }</td></tr>
            <tr><th>Attendance</th><td>${item.present_days || "0"}</td></tr>
            <tr><th>Comments</th><td>${item.comment || "-"}</td></tr>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  // Update dates whenever reportType changes
  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  // Fetch data whenever filters change
  useEffect(() => {
    if (startDate && endDate) fetchWorkerProgress();
  }, [workerId, startDate, endDate, reportType]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Worker Progress</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-start">
        <div>
          <label className="mr-2 font-medium">Report Type:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="mr-2 font-medium">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="mr-2 font-medium">Worker ID:</label>
          <input
            type="number"
            value={workerId}
            onChange={(e) => setWorkerId(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg w-24"
          />
        </div>

        <button
          onClick={fetchWorkerProgress}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Fetch Report
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">Loading worker progress...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Piece</th>
                <th className="px-4 py-2 border">Overtime</th>
                <th className="px-4 py-2 border">Payment</th>
                <th className="px-4 py-2 border">Attendance</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No progress data found.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border">{item.date}</td>
                    <td className="px-4 py-2 border">
                      {item.total_production_units}
                    </td>
                    <td className="px-4 py-2 border">
                      {item.total_overtime_hours || "-"}
                    </td>
                    <td className="px-4 py-2 border">
                      {item.total_advance_payment}
                    </td>
                    <td className="px-4 py-2 border">
                      {item.present_days || "0"}
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => handlePrint(item)}
                      >
                        🖨️ Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkerProgress;
