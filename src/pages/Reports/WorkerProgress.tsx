import React, { useContext, useEffect, useRef, useState } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
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

const branchList = [
  { id: 1, name: "AL FANAR ABAYAT" },
  { id: 2, name: "DIVA ABAYAT" },
  { id: 3, name: "EID AL ABAYAT" },
];

const WorkerProgress: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [data, setData] = useState<WorkerProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [workerSearch, setWorkerSearch] = useState("");
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerProgressItem[]>(
    []
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const workerRef = useRef<HTMLDivElement>(null);

  // Auto-set date range
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

  // Fetch report data
  const fetchWorkerProgress = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/reports/worker/progress`, {
        headers: { "X-Branch-ID": branchId },
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });
      setData(res.data.report || []);
      setFilteredWorkers(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch worker progress:", err);
      setData([]);
      setFilteredWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  useEffect(() => {
    if (startDate && endDate) fetchWorkerProgress();
  }, [branchId, startDate, endDate, reportType]);

  // --- Autocomplete Logic ---
  const handleWorkerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWorkerSearch(value);
    if (value.trim() === "") {
      setFilteredWorkers(data);
      setShowDropdown(false);
      return;
    }

    const suggestions = data.filter((w) =>
      w.worker_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredWorkers(suggestions);
    setShowDropdown(suggestions.length > 0);
  };

  const handleWorkerSelect = (worker: WorkerProgressItem) => {
    setWorkerSearch(worker.worker_name);

    // Keep all workers with the same name
    const allMatching = data.filter(
      (w) => w.worker_name === worker.worker_name
    );
    setFilteredWorkers(allMatching);

    setShowDropdown(false);
  };

  // Compute totals dynamically from filteredWorkers
  const totals = filteredWorkers.reduce(
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

  // Hide dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workerRef.current && !workerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Utility function: write HTML to hidden iframe and print
  const printHTML = (html: string) => {
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

  // --- Print single worker ---
  const handlePrint = (item: WorkerProgressItem) => {
    const html = `
    <html>
      <head>
        <title>Worker Report - ${item.worker_name}</title>
        <style>
          body { padding: 10px; color: #222; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 22px; }
          .branch-info { font-size: 14px; color: #555; margin-top: 5px; }
          h3 { text-align: center; margin: 10px 0 20px; }
          .info { margin-bottom: 20px; background: #f9f9f9; padding: 10px 15px; border-radius: 8px; }
          .info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
          th { background: #f3f3f3; text-transform: uppercase; letter-spacing: 0.5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Worker Progress Report</h1>
          <div class="branch-info">
            <strong>Branch:</strong>${branchList[branchId]?.name}<br/>
            <strong>Date Range:</strong> ${startDate} To ${endDate} <br/>
            <strong>Report Type:</strong> ${reportType
              .charAt(0)
              .toUpperCase()}${reportType.slice(1).toLowerCase()}
          </div>
        </div>

        <h3>${item.worker_name}</h3>
        <div class="info">
          <p><strong>Mobile:</strong> ${item.mobile}</p>
          <p><strong>Email:</strong> ${item.email}</p>
          <p><strong>Base Salary:</strong> ${item.base_salary}</p>
        </div>

        <table>
          <tr><th>Date</th><td>${item.date}</td></tr>
          <tr><th>Production Units</th><td>${
            item.total_production_units
          }</td></tr>
          <tr><th>Overtime Hours</th><td>${item.total_overtime_hours}</td></tr>
          <tr><th>Advance Payment</th><td>${
            item.total_advance_payment
          }</td></tr>
          <tr><th>Attendance (Days)</th><td>${item.present_days}</td></tr>
        </table>
      </body>
    </html>`;

    printHTML(html);
  };

  // --- Print all workers ---
  const handlePrintAll = () => {
    if (filteredWorkers.length === 0) {
      alert("No report data to print!");
      return;
    }

    const rows = filteredWorkers
      .map(
        (item) => `
        <tr>
          <td>${item.date}</td>
          <td>${item.worker_name}</td>
          <td>${item.total_production_units}</td>
          <td>${item.total_overtime_hours}</td>
          <td>${item.total_advance_payment}</td>
          <td>${item.present_days}</td>
        </tr>`
      )
      .join("");

    const totals = filteredWorkers.reduce(
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
        <title>Worker Progress Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 10px; color: #222; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 22px; }
          .branch-info { font-size: 14px; color: #555; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
          th { background: #f3f3f3; text-transform: uppercase; letter-spacing: 0.5px; }
          tfoot { font-weight: bold; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Worker Progress Report</h1>
          <div class="branch-info">
            <strong>Branch:</strong>${branchList[branchId]?.name}<br/>
            <strong>Date Range:</strong> ${startDate} To ${endDate} <br/>
            <strong>Report Type:</strong> ${reportType
              .charAt(0)
              .toUpperCase()}${reportType.slice(1).toLowerCase()}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Production Units</th>
              <th>Overtime Hours</th>
              <th>Advance Payment</th>
              <th>Attendance (Days)</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2">Totals</td>
              <td>${totals.total_production_units}</td>
              <td>${totals.total_overtime_hours}</td>
              <td>${totals.total_advance_payment}</td>
              <td>${totals.present_days}</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>`;

    printHTML(html);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Worker Progress
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-end">
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

        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            Start
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            End
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={fetchWorkerProgress}
          className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm flex items-center justify-center"
        >
          Fetch
        </button>

        <button
          onClick={handlePrintAll}
          className="px-4 py-2 text-sm font-medium text-green-800 border border-green-400 rounded-lg hover:bg-green-100 hover:text-green-800 transition-all duration-200 shadow-sm flex items-center justify-center"
        >
          Print All
        </button>
      </div>

      {/* Worker Autocomplete Search */}
      <div className="mb-4 relative" ref={workerRef}>
        <input
          type="text"
          placeholder="Search worker..."
          value={workerSearch}
          onChange={handleWorkerInputChange}
          onFocus={() => setShowDropdown(true)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-64 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {showDropdown && (
          <ul className="absolute z-10 bg-white border rounded-lg shadow-md mt-1 w-64 max-h-48 overflow-y-auto">
            {filteredWorkers.map((w) => (
              <li
                key={w.worker_id}
                onClick={() => handleWorkerSelect(w)}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {w.worker_name} — {w.mobile}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Loading worker progress...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Date
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Name
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right">
                  Production Units
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right">
                  Overtime (Hours)
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right">
                  Advance Payment
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right">
                  Attendance (Days)
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No worker found.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((item) => (
                  <tr
                    key={item.worker_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-3 py-2 border-b">{item.date}</td>
                    <td className="px-3 py-2 border-b">{item.worker_name}</td>
                    <td className="px-3 py-2 border-b text-right">
                      {item.total_production_units}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {item.total_overtime_hours}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {item.total_advance_payment}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {item.present_days}
                    </td>
                    <td className="px-3 py-2 border-b text-center">
                      <button
                        onClick={() => handlePrint(item)}
                        className="px-3 py-1 text-sm font-medium text-green-800 border border-green-400 rounded-lg hover:bg-green-100 hover:text-green-800 transition-all duration-200 shadow-sm"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-100 dark:bg-gray-700 font-semibold">
              <tr>
                <td className="px-3 py-2 border-b text-right" colSpan={2}>
                  Totals:
                </td>
                <td className="px-3 py-2 border-b text-right">
                  {totals.total_production_units}
                </td>
                <td className="px-3 py-2 border-b text-right">
                  {totals.total_overtime_hours}
                </td>
                <td className="px-3 py-2 border-b text-right">
                  {totals.total_advance_payment}
                </td>
                <td className="px-3 py-2 border-b text-right">
                  {totals.present_days}
                </td>
                <td className="px-3 py-2 border-b"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkerProgress;
