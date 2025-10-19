import React, { useState, useEffect, useContext, useRef } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { AppContext } from "../../context/AppContext";
import { printHTML } from "../../utils/printHtml";

// Match backend model
interface Transaction {
  id: number;
  transaction_id?: string; // optional unique identifier if provided
  memo_no: string;
  branch_id: number;
  from_id: number;
  from_account_name: string;
  from_type: string; // customers, employees, accounts, etc.
  to_id: number;
  to_account_name: string;
  to_type: string; // customers, employees, accounts, etc.
  amount: number;
  transaction_type: string; // payment, refund, adjustment, salary
  created_at: string; // ISO string
  notes?: string;
}

const branchList = [
  { id: 1, name: "AL FANAR ABAYAT" },
  { id: 2, name: "DIVA ABAYAT" },
  { id: 3, name: "EID AL ABAYAT" },
];

const TransactionReport: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTransaction, setSearchTransaction] = useState("");
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

  const fetchTransactions = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      // Adjust endpoint to your backend route for transactions
      const res = await axiosInstance.get(`/transactions/list`, {
        headers: { "X-Branch-ID": branchId },
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      const list: Transaction[] = res.data.report || res.data.transactions || [];
      setTransactions(list);
      setFilteredTransactions(list);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };
  // Compute totals from filtered transactions
  const totals = filteredTransactions.reduce(
    (acc, t) => {
      acc.total_amount += Number(t.amount || 0);
      return acc;
    },
    { total_amount: 0 }
  );

  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  useEffect(() => {
    if (startDate && endDate) fetchTransactions();
  }, [branchId, startDate, endDate, reportType]);

  // --- Search handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTransaction(value);

    if (value === "") {
      setFilteredTransactions(transactions);
      setShowDropdown(false);
      return;
    }

    const filtered = transactions.filter((t) => {
      const v = value.toLowerCase();
      return (
        (t.memo_no && t.memo_no.toLowerCase().includes(v)) ||
        (t.transaction_id && t.transaction_id.toLowerCase().includes(v)) ||
        (t.from_account_name && t.from_account_name.toLowerCase().includes(v)) ||
        (t.to_account_name && t.to_account_name.toLowerCase().includes(v)) ||
        (t.transaction_type && t.transaction_type.toLowerCase().includes(v))
      );
    });
    setFilteredTransactions(filtered);
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

  const handleSelect = (tx: Transaction) => {
    setSearchTransaction(tx.memo_no);
    const allMatching = transactions.filter((t) => t.memo_no === tx.memo_no);
    setFilteredTransactions(allMatching);
    setShowDropdown(false);
  };

  // --- Print handler ---
  const handlePrintFullReport = () => {
    if (filteredTransactions.length === 0) {
      alert("No report data to print!");
      return;
    }

    const rows = filteredTransactions
      .map(
        (t) => `
      <tr>
        <td>${(t.created_at || "").slice(0, 10)}</td>
        <td>${t.memo_no}</td>
        <td>${t.transaction_id || ""}</td>
        <td>${t.from_account_name} (${t.from_type.slice(0, -1)})</td>
        <td>${t.to_account_name} (${t.to_type.slice(0, -1)})</td>
        <td>${t.transaction_type}</td>
        <td style="text-align:right">${Number(t.amount || 0).toFixed(2)}</td>
        <td>${t.notes || ""}</td>
      </tr>`
      )
      .join("");
    const totalsRow = `
        <tr style="font-weight:bold; background:#f3f3f3;">
            <td colspan="6" style="text-align:right">Total Amount</td>
            <td style="text-align:right">${Number(totals.total_amount).toFixed(2)}</td>
            <td></td>
        </tr>
        `;
    const html = `
      <html>
        <head>
          <title>Transaction Report - ${reportType.toUpperCase()}</title>
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
            <h1>Transaction Report</h1>
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
                <th>Tx ID</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Amount</th>
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
  // Print main transaction table
  const handlePrintTable = () => {
    if (filteredTransactions.length === 0) {
      alert("No transaction data to print!");
      return;
    }

    const rows = filteredTransactions
      .map(
        (t) => `
      <tr>
        <td>${(t.created_at || "").slice(0, 10)}</td>
        <td>${t.memo_no}</td>
        <td>${t.transaction_id || ""}</td>
        <td>${t.from_account_name} (${t.from_type.slice(0, -1)})</td>
        <td>${t.to_account_name} (${t.to_type.slice(0, -1)})</td>
        <td>${t.transaction_type}</td>
        <td style="text-align:right">${Number(t.amount || 0).toFixed(2)}</td>
        <td>${t.notes || ""}</td>
      </tr>`
      )
      .join("");

    const totalsRow = `
        <tr style=\"font-weight:bold; background:#f3f3f3;\">
            <td colspan=\"6\" style=\"text-align:right\">Total Amount</td>
            <td style=\"text-align:right\">${Number(totals.total_amount).toFixed(2)}</td>
            <td></td>
        </tr>
        `;

    const html = `
      <html>
        <head>
          <title>Transaction Report - ${reportType.toUpperCase()}</title>
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
          <div class=\"header\">
            <h1>Transaction Report</h1>
            <div class=\"meta\">
              <strong>Branch:</strong> ${branchList[branchId - 1]?.name || "N/A"}<br/>
              <strong>Date Range:</strong> ${startDate} to ${endDate}<br/>
              <strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Memo No</th>
                <th>Tx ID</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Amount</th>
                <th colspan=2>Notes</th>
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Transaction Reports
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
            placeholder="Search transaction..."
            value={searchTransaction}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            className="px-3 py-2 border rounded-lg w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />

          {showDropdown && (
            <ul className="absolute top-full left-0 w-full z-10 bg-white border rounded-lg shadow-md max-h-48 overflow-y-auto mt-1">
              {filteredTransactions.map((s) => (
                <li
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {s.memo_no} {s.transaction_type ? "-" + s.transaction_type : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={fetchTransactions}
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
          Loading transaction reports...
        </div>
      ) : (
        <div
          ref={printRef}
          className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-start mb-2">
              <strong>Transaction History</strong>
            </div>
            <div className="flex justify-end mb-2">
              <button
                onClick={handlePrintTable}
                className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
              >
                Print Table
              </button>
            </div>
          </div>
          <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 border-b text-left">Date</th>
                <th className="px-3 py-2 border-b text-left">Memo No</th>
                <th className="px-3 py-2 border-b text-left">Transaction ID</th>
                <th className="px-3 py-2 border-b text-left">From</th>
                <th className="px-3 py-2 border-b text-left">To</th>
                <th className="px-3 py-2 border-b text-left">Type</th>
                <th className="px-3 py-2 border-b text-right">Amount</th>
                <th className="px-3 py-2 border-b text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-3 py-2 border-b text-left">{(t.created_at || "").slice(0, 10)}</td>
                    <td className="px-3 py-2 border-b text-left">{t.memo_no}</td>
                    <td className="px-3 py-2 border-b text-left">{t.transaction_id || ""}</td>
                    <td className="px-3 py-2 border-b text-left">{t.from_account_name} ({t.from_type.slice(0, -1)})</td>
                    <td className="px-3 py-2 border-b text-left">{t.to_account_name} ({t.to_type.slice(0, -1)})</td>
                    <td className="px-3 py-2 border-b text-left">{t.transaction_type}</td>
                    <td className="px-3 py-2 border-b text-right">{Number(t.amount || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 border-b text-left">{t.notes || ""}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              {filteredTransactions.length > 0 && (
                <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                  <td colSpan={6} className="px-3 py-2 border-b text-right">Total Amount</td>
                  <td className="px-3 py-2 border-b text-right">{totals.total_amount.toFixed(2)}</td>
                  <td className="px-3 py-2 border-b text-right"></td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}

    </div>
  );
};

export default TransactionReport;
