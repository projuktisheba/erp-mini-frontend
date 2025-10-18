import React, { useState, useEffect, useContext, useRef } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { AppContext } from "../../context/AppContext";
import { printHTML } from "../../utils/printHtml";

interface StockReportItem {
  id: number;
  memo_no: string;
  stock_date: string;
  branch_name: string;
  product_name: string;
  quantity: number;
}

const branchList = [
  { id: 1, name: "AL FANAR ABAYAT" },
  { id: 2, name: "DIVA ABAYAT" },
  { id: 3, name: "EID AL ABAYAT" },
];

const StockReport: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<StockReportItem[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchMemo, setSearchMemo] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

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

  const fetchStockReports = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/products/stocks`, {
        headers: { "X-Branch-ID": branchId },
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      setData(res.data.report || []);
      setFilteredStocks(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch stock reports:", err);
      setData([]);
      setFilteredStocks([]);
    } finally {
      setLoading(false);
    }
  };
  // Compute totals dynamically from filteredWorkers
  const totals = filteredStocks.reduce(
    (acc, item) => {
      acc.total_quantity += item.quantity || 0;
      return acc;
    },
    { total_quantity: 0 }
  );

  // Compute summary: total quantity per product
  const productSummary = filteredStocks.reduce<
    Record<string, { product_name: string; total_quantity: number }>
  >((acc, item) => {
    if (!acc[item.product_name]) {
      acc[item.product_name] = {
        product_name: item.product_name,
        total_quantity: 0,
      };
    }
    acc[item.product_name].total_quantity += item.quantity;
    return acc;
  }, {});

  const summaryArray = Object.values(productSummary);

  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  useEffect(() => {
    if (startDate && endDate) fetchStockReports();
  }, [branchId, startDate, endDate, reportType]);

  // --- Search handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchMemo(value);

    if (value === "") {
      setFilteredStocks(data);
      setShowDropdown(false);
      return;
    }

    const filtered = data.filter(
      (s) =>
        s.product_name.toLowerCase().includes(value.toLowerCase()) ||
        s.memo_no.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredStocks(filtered);
    setShowDropdown(true);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (stock: StockReportItem) => {
    setSearchMemo(stock.product_name);
    const allMatching = data.filter(
      (s) => s.product_name === stock.product_name
    );
    setFilteredStocks(allMatching);
    setShowDropdown(false);
  };

  // --- Print handler ---
  const handlePrintFullReport = () => {
    if (filteredStocks.length === 0) {
      alert("No report data to print!");
      return;
    }

    const rows = filteredStocks
      .map(
        (item) => `
      <tr>
        <td>${item.stock_date.slice(0, 10)}</td>
        <td>${item.memo_no}</td>
        <td>${item.branch_name}</td>
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
      </tr>`
      )
      .join("");
    const totalsRow = `
        <tr style="font-weight:bold; background:#f3f3f3;">
            <td colspan="4" style="text-align:right">Total</td>
            <td>${totals.total_quantity}</td>
        </tr>
        `;
    const html = `
      <html>
        <head>
          <title>Stock Report - ${reportType.toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; }
            .header .meta { margin-top: 5px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #f3f3f3; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Product Stock Report</h1>
            <div class="meta">
              <strong>Branch:</strong> ${
                branchList[branchId - 1]?.name || "N/A"
              }<br/>
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
                <th>Memo No</th>
                <th>Branch</th>
                <th>Product</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>${totalsRow}</tfoot>
          </table>
        </body>
      </html>
    `;
    printHTML(html);
  };
  // Print main stock table
  const handlePrintStockTable = () => {
    if (filteredStocks.length === 0) {
      alert("No stock report data to print!");
      return;
    }

    const rows = filteredStocks
      .map(
        (item) => `
      <tr>
        <td>${item.stock_date.slice(0, 10)}</td>
        <td>${item.memo_no}</td>
        <td>${item.branch_name}</td>
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
      </tr>`
      )
      .join("");

    const totalsRow = `
        <tr style="font-weight:bold; background:#f3f3f3;">
            <td colspan="4" style="text-align:right">Total</td>
            <td>${totals.total_quantity}</td>
        </tr>
        `;

    const html = `
      <html>
        <head>
          <title>Stock Report - ${reportType.toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; }
            .header .meta { margin-top: 5px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #f3f3f3; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Product Stock Report</h1>
            <div class="meta">
              <strong>Branch:</strong> ${
                branchList[branchId - 1]?.name || "N/A"
              }<br/>
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
                <th>Memo No</th>
                <th>Branch</th>
                <th>Product</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>${totalsRow}</tfoot>
          </table>
        </body>
      </html>
  `;
    printHTML(html);
  };

  // Print summary table
  const handlePrintSummaryTable = () => {
    if (summaryArray.length === 0) {
      alert("No summary data to print!");
      return;
    }

    const summaryRows = summaryArray
      .map(
        (item) => `
      <tr>
        <td>${item.product_name}</td>
        <td>${item.total_quantity}</td>
      </tr>`
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>Stock Report - ${reportType.toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; }
            .header .meta { margin-top: 5px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #f3f3f3; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Product Stock Summary</h1>
            <div class="meta">
              <strong>Branch:</strong> ${
                branchList[branchId - 1]?.name || "N/A"
              }<br/>
              <strong>Date Range:</strong> ${startDate} to ${endDate}<br/>
              <strong>Report Type:</strong> ${
                reportType.charAt(0).toUpperCase() + reportType.slice(1)
              }
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Total Quantity</th>
              </tr>
            </thead>
            <tbody>${summaryRows}</tbody>
          </table>
        </body>
      </html>
  `;
    printHTML(html);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Stock Reports
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-end print:hidden">
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Search */}
        <div ref={searchRef} className="relative w-64">
          <input
            type="text"
            placeholder="Search product or memo..."
            value={searchMemo}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            className="px-3 py-2 border rounded-lg w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />

          {showDropdown && (
            <ul className="absolute top-full left-0 w-full z-10 bg-white border rounded-lg shadow-md max-h-48 overflow-y-auto mt-1">
              {filteredStocks.map((s) => (
                <li
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {s.product_name} {s.memo_no ? "-" + s.memo_no : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={fetchStockReports}
          className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
        >
          Fetch Report
        </button>

        <button
          onClick={handlePrintFullReport}
          className="px-4 py-2 text-sm font-medium text-green-800 border border-green-400 rounded-lg hover:bg-green-100 hover:text-green-800 transition-all duration-200 shadow-sm"
        >
          Print Report
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Loading stock reports...
        </div>
      ) : (
        <div
          ref={printRef}
          className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-start mb-2">
              <strong>Restock History</strong>
            </div>
            <div className="flex justify-end mb-2">
              <button
                onClick={handlePrintStockTable}
                className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
              >
                Print Stock
              </button>
            </div>
          </div>
          <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 border-b text-center">Date</th>
                <th className="px-3 py-2 border-b text-center">Memo No</th>
                <th className="px-3 py-2 border-b text-center">Product</th>
                <th className="px-3 py-2 border-b text-center">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No stock record found.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-3 py-2 border-b text-center">
                      {item.stock_date.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2 border-b text-center">
                      {item.memo_no}
                    </td>
                    <td className="px-3 py-2 border-b text-center">
                      {item.product_name}
                    </td>
                    <td className="px-3 py-2 border-b text-center">
                      {item.quantity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              {filteredStocks.length > 0 && (
                <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                  <td colSpan={3} className="px-3 py-2 border-b text-right">
                    Total
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    {totals.total_quantity}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}

      {summaryArray.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mt-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-start mb-2">
              <strong>Product Summary</strong>
            </div>
            <div className="flex justify-end mb-2">
              <button
                onClick={handlePrintSummaryTable}
                className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
              >
                Print Summary
              </button>
            </div>
          </div>
          <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 border-b text-center">Product</th>
                <th className="px-3 py-2 border-b text-center">
                  Total Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {summaryArray.map((item) => (
                <tr
                  key={item.product_name}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-3 py-2 border-b text-center">
                    {item.product_name}
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    {item.total_quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockReport;
