import React, { useEffect, useState } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";

interface EmployeeProgressItem {
  date: string;
  order_count: number;
  product_name: string;
  sale: number;
  sale_return: number;
  comment: string;
}

const EmployeeProgress: React.FC = () => {
  const [data, setData] = useState<EmployeeProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [employeeId, setEmployeeId] = useState<number>(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
        params: {
          employee_id: employeeId,
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });
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
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Order Count</th>
                <th className="px-4 py-2 border">Product Name</th>
                <th className="px-4 py-2 border">Sale</th>
                <th className="px-4 py-2 border">Sale Return</th>
                <th className="px-4 py-2 border">Comment</th>
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
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border">{item.date}</td>
                    <td className="px-4 py-2 border">{item.order_count}</td>
                    <td className="px-4 py-2 border">{item.product_name}</td>
                    <td className="px-4 py-2 border">{item.sale}</td>
                    <td className="px-4 py-2 border">{item.sale_return}</td>
                    <td className="px-4 py-2 border">{item.comment}</td>
                    <td className="px-4 py-2 border">
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() =>
                          alert(`Viewing progress for ${item.date}`)
                        }
                      >
                        View
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

export default EmployeeProgress;
