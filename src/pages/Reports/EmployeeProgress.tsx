import React, { useContext, useEffect, useState, useRef } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";
import { AppContext } from "../../context/AppContext";

interface EmployeeProgressItem {
  date: string;
  order_count: number;
  product_name: string;
  sale: number;
  sale_return: number;
  comment: string;
}

const EmployeeProgress: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext not provided");
  }
  const { branchId } = context;

  const [data, setData] = useState<EmployeeProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [employeeId, setEmployeeId] = useState<number>(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  // Helper to set start and end date based on reportType
  const updateDates = (type: "daily" | "weekly" | "monthly") => {
    const today = new Date();
    let start: Date;

    if (type === "daily") {
      start = today;
    } else if (type === "weekly") {
      start = new Date(today);
      start.setDate(today.getDate() - 6); // last 7 days including today
    } else {
      start = new Date(today);
      start.setMonth(today.getMonth() - 1);
    }

    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
  };

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/reports/employee/progress`, {
        headers: {
          "X-Branch-ID": branchId,
        },
        params: {
          employee_id: employeeId,
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });
      console.log(res.data);

      setData(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch employee progress:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Update dates automatically whenever reportType changes
  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  // Fetch data whenever reportType, employeeId, startDate, or endDate changes
  useEffect(() => {
    if (startDate && endDate) fetchProgress();
  }, [reportType, startDate, endDate, employeeId]);

  // Print report handler
  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Employee Progress Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h2>Employee Progress Report</h2>
          <p><strong>Employee ID:</strong> ${employeeId}</p>
          <p><strong>Report Type:</strong> ${reportType}</p>
          <p><strong>Date Range:</strong> ${startDate} to ${endDate}</p>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Progress</h1>

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
          <label className="mr-2 font-medium">Employee ID:</label>
          <input
            type="number"
            value={employeeId}
            onChange={(e) => setEmployeeId(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg w-24"
          />
        </div>

        <button
          onClick={fetchProgress}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Fetch Report
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">Loading employee progress...</div>
      ) : (
        <>
          <div className="flex justify-end mb-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={data.length === 0}
            >
              Print Report
            </button>
          </div>

          <div ref={printRef} className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Order Count</th>
                  <th className="px-4 py-2 border">Product Name</th>
                  <th className="px-4 py-2 border">Sale</th>
                  <th className="px-4 py-2 border">Sale Return</th>
                  <th className="px-4 py-2 border">Comment</th>
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
                      <td className="px-4 py-2 border">{item.order_count}</td>
                      <td className="px-4 py-2 border">{item.product_name}</td>
                      <td className="px-4 py-2 border">{item.sale}</td>
                      <td className="px-4 py-2 border">{item.sale_return}</td>
                      <td className="px-4 py-2 border">{item.comment}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeProgress;
