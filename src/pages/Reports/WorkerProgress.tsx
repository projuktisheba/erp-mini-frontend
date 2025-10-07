import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";
import { AppContext } from "../../context/AppContext";

interface WorkerProgressItem {
  worker_id: number;
  worker_name: string;
  mobile: string;
  email: string;
  base_salary: number;
  date: string;
  present_days: number;
  total_advance_payment: number;
  total_production_units: number;
  total_overtime_hours: number;
}

const WorkerProgress: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [data, setData] = useState<WorkerProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [workerId, setWorkerId] = useState<number>(1);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Auto-set date range based on report type
  const updateDates = (type: "daily" | "weekly" | "monthly") => {
    const today = new Date();
    let start: Date;

    if (type === "daily") start = today;
    else if (type === "weekly") {
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
        headers: { "X-Branch-ID": branchId },
        params: {
          worker_id: workerId,
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });

      setData(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch worker progress:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Print single-day report
  const handlePrint = (item: WorkerProgressItem) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Worker Report - ${item.worker_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h3 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <h1>Worker Progress Report</h1>
          <h3>${item.worker_name}</h3>
          <p><strong>Mobile:</strong> ${item.mobile}</p>
          <p><strong>Email:</strong> ${item.email}</p>
          <p><strong>Base Salary:</strong> ${item.base_salary}</p>
          <table>
            <tr><th>Date</th><td>${item.date}</td></tr>
            <tr><th>Production Units</th><td>${item.total_production_units}</td></tr>
            <tr><th>Overtime Hours</th><td>${item.total_overtime_hours}</td></tr>
            <tr><th>Advance Payment</th><td>${item.total_advance_payment}</td></tr>
            <tr><th>Attendance (Days)</th><td>${item.present_days}</td></tr>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  // Print full report
  const handlePrintAll = () => {
    if (data.length === 0) {
      alert("No report data to print!");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const worker = data[0];
    const rows = data
      .map(
        (item) => `
          <tr>
            <td>${item.date}</td>
            <td>${item.total_production_units}</td>
            <td>${item.total_overtime_hours}</td>
            <td>${item.total_advance_payment}</td>
            <td>${item.present_days}</td>
          </tr>`
      )
      .join("");

    const totals = data.reduce(
      (acc, item) => {
        acc.total_production_units += item.total_production_units;
        acc.total_overtime_hours += item.total_overtime_hours;
        acc.total_advance_payment += item.total_advance_payment;
        acc.present_days += item.present_days;
        return acc;
      },
      {
        total_production_units: 0,
        total_overtime_hours: 0,
        total_advance_payment: 0,
        present_days: 0,
      }
    );

    const html = `
      <html>
        <head>
          <title>${reportType.toUpperCase()} Worker Progress Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h3 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f3f3; }
            tfoot { font-weight: bold; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>${reportType.toUpperCase()} Worker Progress Report</h1>
          <h3>${worker.worker_name}</h3>
          <p><strong>Mobile:</strong> ${worker.mobile}</p>
          <p><strong>Email:</strong> ${worker.email}</p>
          <p><strong>Base Salary:</strong> ${worker.base_salary}</p>
          <p><strong>Date Range:</strong> ${startDate} → ${endDate}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Production Units</th>
                <th>Overtime Hours</th>
                <th>Advance Payment</th>
                <th>Attendance (Days)</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr>
                <td>Totals</td>
                <td>${totals.total_production_units}</td>
                <td>${totals.total_overtime_hours}</td>
                <td>${totals.total_advance_payment}</td>
                <td>${totals.present_days}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  useEffect(() => {
    if (startDate && endDate) fetchWorkerProgress();
  }, [workerId, startDate, endDate, reportType]);

  // Calculate totals for UI table
  const totals = data.reduce(
    (acc, item) => {
      acc.total_production_units += item.total_production_units;
      acc.total_overtime_hours += item.total_overtime_hours;
      acc.total_advance_payment += item.total_advance_payment;
      acc.present_days += item.present_days;
      return acc;
    },
    {
      total_production_units: 0,
      total_overtime_hours: 0,
      total_advance_payment: 0,
      present_days: 0,
    }
  );

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

        <button
          onClick={handlePrintAll}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          🖨️ Print All
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
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Production Units</th>
                <th className="px-4 py-2 border">Overtime (Hours)</th>
                <th className="px-4 py-2 border">Advance Payment</th>
                <th className="px-4 py-2 border">Attendance (Days)</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No progress data found.
                  </td>
                </tr>
              ) : (
                <>
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border">{item.date}</td>
                      <td className="px-4 py-2 border">{item.worker_name}</td>
                      <td className="px-4 py-2 border text-right">
                        {item.total_production_units}
                      </td>
                      <td className="px-4 py-2 border text-right">
                        {item.total_overtime_hours}
                      </td>
                      <td className="px-4 py-2 border text-right">
                        {item.total_advance_payment}
                      </td>
                      <td className="px-4 py-2 border text-right">
                        {item.present_days}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          onClick={() => handlePrint(item)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          🖨️ Print
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Totals */}
                  <tr className="bg-gray-100 font-semibold">
                    <td colSpan={2} className="px-4 py-2 border text-right">
                      Totals:
                    </td>
                    <td className="px-4 py-2 border text-right">
                      {totals.total_production_units}
                    </td>
                    <td className="px-4 py-2 border text-right">
                      {totals.total_overtime_hours}
                    </td>
                    <td className="px-4 py-2 border text-right">
                      {totals.total_advance_payment}
                    </td>
                    <td className="px-4 py-2 border text-right">
                      {totals.present_days}
                    </td>
                    <td className="px-4 py-2 border"></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkerProgress;
