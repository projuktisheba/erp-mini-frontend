import React, { useState, useEffect } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";

interface BranchReportItem {
  date: string;
  total: number;
  cost: number;
  cash: number;
  bank: number;
  balance: number;
  order: number;
  delivery: number;
  checkout: number;
}

const BranchReports: React.FC = () => {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<BranchReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Update start and end dates based on reportType
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
      start.setMonth(today.getMonth() - 1); // last 1 month
    }

    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/reports/branch`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });
      console.log(res.data);

      setData(res.data.reports || []);
    } catch (err) {
      console.error("Failed to fetch branch reports:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Update dates whenever reportType changes
  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  // Fetch reports whenever startDate, endDate, or reportType changes
  useEffect(() => {
    if (startDate && endDate) fetchReports();
  }, [startDate, endDate, reportType]);

  const totals = data.reduce(
    (acc, item) => {
      acc.total += item.total;
      acc.cost += item.cost;
      acc.cash += item.cash;
      acc.bank += item.bank;
      acc.balance += item.balance;
      acc.order += item.order;
      acc.delivery += item.delivery;
      acc.checkout += item.checkout;
      return acc;
    },
    {
      total: 0,
      cost: 0,
      cash: 0,
      bank: 0,
      balance: 0,
      order: 0,
      delivery: 0,
      checkout: 0,
    }
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Branch Reports</h1>

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

        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Fetch Report
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading reports...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Cost</th>
                <th className="px-4 py-2 border">Cash</th>
                <th className="px-4 py-2 border">Bank</th>
                <th className="px-4 py-2 border">Balance</th>
                <th className="px-4 py-2 border">Order</th>
                <th className="px-4 py-2 border">Delivery</th>
                <th className="px-4 py-2 border">Checkout</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    No reports found.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border">{item.date}</td>
                    <td className="px-4 py-2 border">{item.total}</td>
                    <td className="px-4 py-2 border">{item.cost}</td>
                    <td className="px-4 py-2 border">{item.cash}</td>
                    <td className="px-4 py-2 border">{item.bank}</td>
                    <td className="px-4 py-2 border">{item.balance}</td>
                    <td className="px-4 py-2 border">{item.order}</td>
                    <td className="px-4 py-2 border">{item.delivery}</td>
                    <td className="px-4 py-2 border">{item.checkout}</td>
                  </tr>
                ))
              )}

              {data.length > 0 && (
                <tr className="font-semibold bg-gray-100">
                  <td className="px-4 py-2 border">Total</td>
                  <td className="px-4 py-2 border">{totals.total}</td>
                  <td className="px-4 py-2 border">{totals.cost}</td>
                  <td className="px-4 py-2 border">{totals.cash}</td>
                  <td className="px-4 py-2 border">{totals.bank}</td>
                  <td className="px-4 py-2 border">{totals.balance}</td>
                  <td className="px-4 py-2 border">{totals.order}</td>
                  <td className="px-4 py-2 border">{totals.delivery}</td>
                  <td className="px-4 py-2 border">{totals.checkout}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchReports;
