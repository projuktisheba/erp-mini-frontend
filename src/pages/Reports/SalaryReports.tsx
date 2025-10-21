import React, { useContext, useEffect, useRef, useState } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { AppContext } from "../../context/AppContext";
import { printHTML } from "../../utils/printHtml";

interface SalaryItem {
  employee_id: number;
  employee_name: string;
  role: string;
  base_salary: number;
  total_salary: number;
  sheet_date: string;
}

const SalaryReport: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [data, setData] = useState<SalaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<SalaryItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const employeeRef = useRef<HTMLDivElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<SalaryItem | null>(
    null
  );

  // Auto-set default date range (monthly)
  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setMonth(today.getMonth() - 1);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (startDate && endDate) fetchSalaries();
  }, [startDate, endDate, branchId]);
  // Fetch salary data
  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const params: any = {
        start_date: startDate,
        end_date: endDate,
        employee_id: selectedEmployee?.employee_id || 0,
      };
      const res = await axiosInstance.get(`/reports/employee/salaries`, {
        headers: { "X-Branch-ID": branchId },
        params,
      });
      setData(res.data.report || []);
      setFilteredEmployees(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch salaries:", err);
      setData([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Autocomplete: Unique employee names only ---
  const uniqueEmployees = Array.from(
    new Map(data.map((item) => [item.employee_id, item])).values()
  );

  const handleEmployeeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setEmployeeSearch(value);
    if (!value.trim()) {
      setFilteredEmployees(data);
      setShowDropdown(false);
      return;
    }

    const suggestions = uniqueEmployees.filter((e) =>
      e.employee_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmployees(suggestions);
    setShowDropdown(suggestions.length > 0);
  };

  const handleEmployeeSelect = (emp: SalaryItem) => {
    setEmployeeSearch(emp.employee_name);
    setSelectedEmployee(emp);
    setFilteredEmployees(data.filter((d) => d.employee_id === emp.employee_id));
    setShowDropdown(false);
  };

  // Hide dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        employeeRef.current &&
        !employeeRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Print functions ---
  const handlePrint = (item: SalaryItem) => {
    const html = `
      <html>
        <head>
          <title>Salary Report - ${item.employee_name}</title>
          <style>
            body { padding: 10px; font-family: Arial, sans-serif; color: #222; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <h1>Salary Report</h1>
          <p><strong>Name:</strong> ${item.employee_name}</p>
          <p><strong>Role:</strong> ${item.role}</p>
          <p><strong>Date:</strong> ${item.sheet_date}</p>
          <table>
            <tr><th>Base Salary</th><td>${item.base_salary}</td></tr>
            <tr><th>Total Salary</th><td>${item.total_salary}</td></tr>
          </table>
        </body>
      </html>`;
    printHTML(html);
  };

  const handlePrintAll = () => {
    if (filteredEmployees.length === 0) return alert("No data to print!");
    const rows = filteredEmployees
      .map(
        (item) => `
        <tr>
          <td>${item.sheet_date}</td>
          <td>${item.employee_name}</td>
          <td>${item.role}</td>
          <td style="text-align:right;">${item.base_salary}</td>
          <td style="text-align:right;">${item.total_salary}</td>
        </tr>`
      )
      .join("");
    const totals = filteredEmployees.reduce(
      (acc, item) => {
        acc.total_salary += item.total_salary;
        return acc;
      },
      { base_salary: 0, total_salary: 0 }
    );

    const html = `
      <html>
        <head>
          <title>Salary Report</title>
          <style>
            body { padding: 10px; font-family: Arial, sans-serif; color: #222; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f3f3f3; text-transform: uppercase; }
            tfoot { font-weight: bold; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Salary Report</h1>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Role</th>
                <th>Base Salary</th>
                <th>Total Salary</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">Totals</td>
                <td style="text-align:right;">${totals.total_salary}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>`;
    printHTML(html);
  };

  // --- Calculate totals for the table footer in UI ---
  const totals = filteredEmployees.reduce(
    (acc, item) => {
      acc.total_salary += item.total_salary;
      return acc;
    },
    { base_salary: 0, total_salary: 0 }
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Salaries</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-end print:hidden">
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
        <div className="flex flex-col">
          <input
            type="text"
            placeholder="Search employee..."
            value={employeeSearch}
            onChange={handleEmployeeInputChange}
            onFocus={() => setShowDropdown(true)}
            className="px-3 py-2 border rounded-lg w-64 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {showDropdown && (
            <ul className="absolute z-10 mt-11 bg-white border rounded-lg shadow-md mt-1 w-64 max-h-48 overflow-y-auto">
              {uniqueEmployees.map((e) => (
                <li
                  key={e.employee_id}
                  onClick={() => handleEmployeeSelect(e)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {e.employee_name} - {e.employee_id}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={fetchSalaries}
          className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
        >
          Fetch Report
        </button>

        <button
          onClick={handlePrintAll}
          className="px-4 py-2 text-sm font-medium text-green-800 border border-green-400 rounded-lg hover:bg-green-100 hover:text-green-800 transition-all duration-200 shadow-sm"
        >
          Print Report
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading salaries...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b text-left">Date</th>
                <th className="px-3 py-2 border-b text-left">Name</th>
                <th className="px-3 py-2 border-b text-left">Role</th>
                <th className="px-3 py-2 border-b text-right">Base Salary</th>
                <th className="px-3 py-2 border-b text-right">Total Salary</th>
                <th className="px-3 py-2 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No employee found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((item, index) => (
                  <tr
                    key={
                      item.employee_id
                        ? `${item.employee_id}-${item.sheet_date}-${index}`
                        : index
                    }
                    className="hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 border-b">
                      {item.sheet_date
                        ? new Date(item.sheet_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2 border-b">{item.employee_name}</td>
                    <td className="px-3 py-2 border-b">{item.role}</td>
                    <td className="px-3 py-2 border-b text-right">
                      {item.base_salary}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {item.total_salary}
                    </td>
                    <td className="px-3 py-2 border-b text-center">
                      <button
                        onClick={() => handlePrint(item)}
                        className="px-3 py-1 text-sm text-green-800 border border-green-400 rounded-lg hover:bg-green-100"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Totals Row */}
            {filteredEmployees.length > 0 && (
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td colSpan={4} className="px-3 py-2 border-t text-left">
                    Totals:
                  </td>
                  <td className="px-3 py-2 border-t text-right">
                    {totals.total_salary}
                  </td>
                  <td className="px-3 py-2 border-t"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default SalaryReport;
