import React, { useState, useEffect, useContext, useRef } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { AppContext } from "../../context/AppContext";

interface PurchaseReportItem {
  id: number;
  memo_no: string;
  purchase_date: string;
  supplier_name: string;
  branch_name: string;
  total_amount: number;
  notes: string;
}

const branchList = [
  { id: 1, name: "AL FANAR ABAYAT" },
  { id: 2, name: "DIVA ABAYAT" },
  { id: 3, name: "EID AL ABAYAT" },
];

const PurchaseReport: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<PurchaseReportItem[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<
    PurchaseReportItem[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [searchSupplier, setSearchSupplier] = useState("");
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

  const fetchReports = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/purchase/list`, {
        headers: { "X-Branch-ID": branchId },
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });
      setData(res.data.report || []);
      setFilteredPurchases(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch purchase reports:", err);
      setData([]);
      setFilteredPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  useEffect(() => {
    if (startDate && endDate) fetchReports();
  }, [branchId, startDate, endDate, reportType]);

  // --- Search handlers ---
  const handleSupplierInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setSearchSupplier(value);

    if (value === "") {
      setFilteredPurchases(data);
      setShowDropdown(false);
      return;
    }

    const filtered = data.filter(
      (p) =>
        p.supplier_name.toLowerCase().includes(value.toLowerCase()) ||
        p.memo_no.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPurchases(filtered);
    setShowDropdown(true);
  };

  const handleSupplierSelect = (purchase: PurchaseReportItem) => {
    setSearchSupplier(purchase.supplier_name);
    const allMatching = data.filter(
      (p) => p.supplier_name === purchase.supplier_name
    );
    setFilteredPurchases(allMatching);
    setShowDropdown(false);
  };

  // --- Print handler ---
  const handlePrint = () => {
    if (filteredPurchases.length === 0) {
      alert("No report data to print!");
      return;
    }

    const rows = filteredPurchases
      .map(
        (item) => `
      <tr>
        <td>${item.purchase_date.slice(0, 10)}</td>
        <td>${item.memo_no}</td>
        <td>${item.supplier_name}</td>
        <td>${item.branch_name}</td>
        <td>${item.total_amount}</td>
        <td>${item.notes}</td>
      </tr>`
      )
      .join("");

    const totalAmount = filteredPurchases.reduce(
      (sum, item) => sum + item.total_amount,
      0
    );

    const totalsRow = `
      <tr style="font-weight:bold; background:#f3f3f3;">
        <td colspan="4">Total</td>
        <td>${totalAmount}</td>
        <td></td>
      </tr>
    `;

    const html = `
      <html>
        <head>
          <title>Purchase Report - ${reportType.toUpperCase()}</title>
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
            <h1>Purchase Report</h1>
            <div class="meta">
              <strong>Branch:</strong> ${
                branchList[branchId]?.name || "N/A"
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
                <th>Supplier</th>
                <th>Branch</th>
                <th>Total Amount</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>${totalsRow}</tfoot>
          </table>
        </body>
      </html>
    `;

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

  const totalAmount = filteredPurchases.reduce(
    (sum, item) => sum + item.total_amount,
    0
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Purchase Reports
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

        <button
          onClick={fetchReports}
          className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
        >
          Fetch Report
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 text-sm font-medium text-green-800 border border-green-400 rounded-lg hover:bg-green-100 hover:text-green-800 transition-all duration-200 shadow-sm"
        >
          Print Report
        </button>
      </div>

      {/* Supplier / Memo Search */}
      <div className="mb-4 relative" ref={searchRef}>
        <input
          type="text"
          placeholder="Search supplier or memo..."
          value={searchSupplier}
          onChange={handleSupplierInputChange}
          onFocus={() => setShowDropdown(true)}
          className="px-3 py-2 border rounded-lg w-64 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {showDropdown && (
          <ul className="absolute z-10 bg-white border rounded-lg shadow-md mt-1 w-64 max-h-48 overflow-y-auto">
            {filteredPurchases.map((p) => (
              <li
                key={p.id}
                onClick={() => handleSupplierSelect(p)}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {p.supplier_name} - {p.memo_no}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Loading purchase reports...
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
                  Memo No
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Supplier
                </th>
                <th className="px-3 py-2 border-b text-right">Total Amount</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No purchase found.
                  </td>
                </tr>
              ) : (
                <>
                  {filteredPurchases.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                        {item.purchase_date.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                        {item.memo_no}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                        {item.supplier_name}
                      </td>
                      <td className="px-3 py-2 border-b text-right">
                        {item.total_amount}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                        {item.notes}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                    <td className="px-3 py-2 border-b text-right" colSpan={4}>
                      Totals:
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {totalAmount}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left"></td>
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

export default PurchaseReport;
