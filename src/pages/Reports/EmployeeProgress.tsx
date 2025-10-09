import React, { useContext, useEffect, useState, useRef } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { AppContext } from "../../context/AppContext";

interface EmployeeProgressItem {
  date: string;
  order_count: number;
  item_count: number;
  product_name: string;
  sale: number;
  sale_return: number;
  sales_person_name: string;
  mobile: string;
  base_salary: number;
  employee_id: number;
}

const EmployeeProgress: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");

  const { branchId } = context;

  const [data, setData] = useState<EmployeeProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<
    EmployeeProgressItem[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/reports/employee/progress`, {
        headers: {
          "X-Branch-ID": branchId,
        },
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });

      setData(res.data.report || []);
      setFilteredEmployees(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch employee progress:", err);
      setData([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  useEffect(() => {
    if (startDate && endDate) fetchProgress();
  }, [reportType, startDate, endDate, branchId]);

  // Employee search handler
  const handleEmployeeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setEmployeeSearch(value);

    if (value === "") {
      setFilteredEmployees(data);
      setShowDropdown(false);
      return;
    }

    const filtered = data.filter((emp) =>
      emp.mobile.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmployees(filtered);
    setShowDropdown(true);
  };

  const handleEmployeeSelect = (emp: EmployeeProgressItem) => {
    setEmployeeSearch(emp.sales_person_name); // or keep the name if you want
    // Keep all employees with the same mobile
    const allMatching = data.filter((e) => e.mobile === emp.mobile);
    setFilteredEmployees(allMatching);
    setShowDropdown(false);
  };

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

  // --- Print all employees ---
  const handlePrint = () => {
    if (filteredEmployees.length === 0) {
      alert("No report data to print!");
      return;
    }

    const rows = filteredEmployees
      .map(
        (item) => `
        <tr>
          <td>${item.date}</td>
          <td>${item.sales_person_name}</td>
          <td>${item.product_name}</td>
          <td>${item.order_count}</td>
          <td>${item.item_count}</td>
          <td>${item.sale.toFixed(2)}</td>
          <td>${item.sale_return.toFixed(2)}</td>
        </tr>`
      )
      .join("");

    const totals = filteredEmployees.reduce(
      (acc, item) => {
        acc.order_count += item.order_count;
        acc.item_count += item.item_count;
        acc.sale += item.sale;
        acc.sale_return += item.sale_return;
        return acc;
      },
      { order_count: 0, item_count: 0, sale: 0, sale_return: 0 }
    );

    const html = `
    <html>
      <head>
        <title>Employee Progress Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 10px; color: #222; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 22px; }
          .branch-info { font-size: 14px; color: #2c2c2cff; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
          th { background: #f3f3f3; text-transform: uppercase; letter-spacing: 0.5px; }
          tfoot { font-weight: bold; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Employee Progress Report</h1>
          <div class="branch-info">
            <strong>Branch:</strong> Main Factory, Rajshahi<br/>
            <strong>Date Range:</strong> ${startDate} To ${endDate}<br/>
            <strong>Report Type:</strong> ${reportType
              .charAt(0)
              .toUpperCase()}${reportType.slice(1)}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee Name</th>
              <th>Product Name</th>
              <th>Order Count</th>
              <th>Item Count</th>
              <th>Sale</th>
              <th>Sale Return</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3">Totals</td>
              <td>${totals.order_count}</td>
              <td>${totals.item_count}</td>
              <td>${totals.sale.toFixed(2)}</td>
              <td>${totals.sale_return.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  `;

    printHTML(html);
  };

  // Add totals computed from filteredEmployees dynamically:
  const totals = filteredEmployees.reduce(
    (acc, item) => {
      acc.order_count += item.order_count;
      acc.item_count += item.item_count;
      acc.sale += item.sale;
      acc.sale_return += item.sale_return;
      return acc;
    },
    { order_count: 0, item_count: 0, sale: 0, sale_return: 0 }
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Employee Progress
      </h1>

      {/* Filters */}
      <div className="mb-4 flex flex-col md:flex-row gap-3 items-end">
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
            Start Date
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
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={fetchProgress}
          className="px-4 py-2 text-sm font-medium text-green-800 border border-green-400 rounded-lg hover:bg-green-100 hover:text-green-800 transition-all duration-200 shadow-sm flex items-center justify-center"
        >
          Fetch Report
        </button>
        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm flex items-center justify-center"
          disabled={data.length === 0}
        >
          Print Report
        </button>
      </div>

      {/* Employee Search */}
      <div className="mb-4 relative" ref={searchRef}>
        <input
          type="text"
          placeholder="Search employee..."
          value={employeeSearch}
          onChange={handleEmployeeInputChange}
          onFocus={() => setShowDropdown(true)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-64 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {showDropdown && (
          <ul className="absolute z-10 bg-white border rounded-lg shadow-md mt-1 w-64 max-h-48 overflow-y-auto">
            {filteredEmployees.map((emp) => (
              <li
                key={emp.employee_id}
                onClick={() => handleEmployeeSelect(emp)}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {emp.sales_person_name}-{emp.mobile}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Loading employee progress...
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
                  Employee Name
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Product Name
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right">
                  Order Count
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right">
                  Item Count
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right">
                  Sale
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-right">
                  Sale Return
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No employee found.
                  </td>
                </tr>
              ) : (
                <>
                  {filteredEmployees.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-3 py-2 border-b">{item.date}</td>
                      <td className="px-3 py-2 border-b">
                        {item.sales_person_name}
                      </td>
                      <td className="px-3 py-2 border-b">
                        {item.product_name}
                      </td>
                      <td className="px-3 py-2 border-b text-right">
                        {item.order_count}
                      </td>
                      <td className="px-3 py-2 border-b text-right">
                        {item.item_count}
                      </td>
                      <td className="px-3 py-2 border-b text-right">
                        {item.sale.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 border-b text-right">
                        {item.sale_return.toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                    <td className="px-3 py-2 border-b text-right" colSpan={3}>
                      Totals:
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {totals.order_count}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {totals.item_count}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {totals.sale.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {totals.sale_return.toFixed(2)}
                    </td>
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

export default EmployeeProgress;
