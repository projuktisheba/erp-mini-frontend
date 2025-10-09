import React, { useState, useEffect, useContext, useRef } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { AppContext } from "../../context/AppContext";

interface BranchReportItem {
  balance: number;
  bank: number;
  branch_id: number;
  cash: number;
  checkout: number;
  expense: number;
  date: string;
  delivery: number;
  expensed: number;
  total_amount: number;
  order_count: number;
}

const branchList = [
  { id: 1, name: "AL FANAR ABAYAT" },
  { id: 2, name: "DIVA ABAYAT" },
  { id: 3, name: "EID AL ABAYAT" },
];
const BranchReports: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<BranchReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  // Update start and end dates based on report type
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

    setStartDate(formatDate(start));
    setEndDate(formatDate(today));
  };

  const fetchReports = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/reports/branch`, {
        headers: {
          "X-Branch-ID": branchId?.toString() || "",
        },
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });
      setData(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch branch reports:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Update dates when reportType changes
  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  // Fetch reports whenever branchId, startDate, endDate, or reportType changes
  useEffect(() => {
    fetchReports();
  }, [branchId, startDate, endDate, reportType]);

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => {
      acc.total_amount += item.total_amount;
      acc.expense += item.expense;
      acc.cash += item.cash;
      acc.bank += item.bank;
      acc.balance += item.balance;
      acc.order_count += item.order_count;
      acc.delivery += item.delivery;
      acc.checkout += item.checkout;
      acc.expensed += item.expensed;
      return acc;
    },
    {
      total_amount: 0,
      expense: 0,
      cash: 0,
      bank: 0,
      balance: 0,
      order_count: 0,
      delivery: 0,
      checkout: 0,
      expensed: 0,
    }
  );

  // --- Print handler for branch reports ---
  const handlePrint = () => {
    if (data.length === 0) {
      alert("No report data to print!");
      return;
    }

    // Generate table rows
    const rows = data
      .map(
        (item) => `
      <tr>
        <td>${item.date.slice(0, 10)}</td>
        <td>${item.total_amount}</td>
        <td>${item.cash}</td>
        <td>${item.bank}</td>
        <td>${item.expense}</td>
        <td>${item.balance}</td>
        <td>${item.order_count}</td>
        <td>${item.checkout}</td>
        <td>${item.delivery}</td>
      </tr>`
      )
      .join("");

    // Totals row
    const totalsRow = `
    <tr style="font-weight:bold; background:#f3f3f3;">
      <td>Total</td>
      <td>${totals.order_count}</td>
      <td>${totals.checkout}</td>
      <td>${totals.delivery}</td>
      <td>${totals.total_amount}</td>
      <td>${totals.cash}</td>
      <td>${totals.bank}</td>
      <td>${totals.expense}</td>
      <td>${totals.balance}</td>
    </tr>
  `;

    // Full HTML
    const html = `
    <html>
      <head>
        <title>Branch Report - ${reportType.toUpperCase()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 22px; }
          .header .meta { margin-top: 5px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background: #f3f3f3; text-transform: uppercase; }
          tfoot tr { font-weight: bold; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Branch Report</h1>
          <div class="meta">
            <strong>Branch:</strong> ${branchList[branchId]?.name || "N/A"}<br/>
            <strong>Date Range:</strong> ${startDate} to ${endDate}<br/>
            <strong>Report Type:</strong> ${
              reportType.charAt(0).toUpperCase() + reportType.slice(1)
            }
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders</th>
              <th>Checkout</th>
              <th>Delivery</th>
              <th>Total</th>
              <th>Cash</th>
              <th>Bank</th>
              <th>Expense</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            ${totalsRow}
          </tfoot>
        </table>
      </body>
    </html>
  `;

    // Open in new window and print
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Branch Reports
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-end print:hidden">
        {/* Report Type */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={fetchReports}
            className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm flex items-center justify-center"
          >
            Fetch Report
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-green-800 border border-green-400 rounded-lg hover:bg-green-100 hover:text-green-800 transition-all duration-200 shadow-sm flex items-center justify-center"
          >
            Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Loading reports...
        </div>
      ) : (
        <div
          ref={printRef}
          className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Date
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Orders
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Checkout
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Delivery
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Total
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Cash
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Bank
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Expense
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-3 py-2 border-b">
                      {item.date.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2 border-b">{item.order_count}</td>
                    <td className="px-3 py-2 border-b">{item.checkout}</td>
                    <td className="px-3 py-2 border-b">{item.delivery}</td>
                    <td className="px-3 py-2 border-b">{item.total_amount}</td>
                    <td className="px-3 py-2 border-b">{item.cash}</td>
                    <td className="px-3 py-2 border-b">{item.bank}</td>
                    <td className="px-3 py-2 border-b">{item.expense}</td>
                    <td className="px-3 py-2 border-b">{item.balance}</td>
                  </tr>
                ))
              )}

              {data.length > 0 && (
                <tr className="font-semibold bg-gray-200 dark:bg-gray-700">
                  <td className="px-3 py-2 border-b">Total</td>
                  <td className="px-3 py-2 border-b">{totals.order_count}</td>
                  <td className="px-3 py-2 border-b">{totals.checkout}</td>
                  <td className="px-3 py-2 border-b">{totals.delivery}</td>
                  <td className="px-3 py-2 border-b">{totals.total_amount}</td>
                  <td className="px-3 py-2 border-b">{totals.cash}</td>
                  <td className="px-3 py-2 border-b">{totals.bank}</td>
                  <td className="px-3 py-2 border-b">{totals.expense}</td>
                  <td className="px-3 py-2 border-b">{totals.balance}</td>
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
