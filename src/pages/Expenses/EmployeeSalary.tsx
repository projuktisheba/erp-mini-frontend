import React, { useState, useEffect, useRef, useContext } from "react";
import Swal from "sweetalert2";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { Loader2 } from "lucide-react";

export interface Employee {
  id: number;
  name: string;
  role: "chairman" | "manager" | "salesperson" | "worker";
  status: "active" | "inactive";
  mobile: string;
  email?: string;
  passport_no?: string;
  joining_date: string; // ISO string
  address?: string;
  base_salary: number;
  overtime_rate: number;
  branch_id: number;
}

const EmployeeSalary: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [salaryAmount, setSalaryAmount] = useState<string>("");

  const employeeRef = useRef<HTMLDivElement>(null);

  // Initialize with current date
  const [salaryDate, setSalaryDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // "YYYY-MM-DD"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close dropdown when clicking outside
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

  // Fetch employee list
  const fetchEmployees = async () => {
    try {
      const { data } = await axiosInstance.get("/hr/employees", {
        headers: { "X-Branch-ID": branchId },
      });
      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      Swal.fire("Error", "Failed to fetch employees", "error");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [branchId]);

  // Filter employees
  useEffect(() => {
    setFilteredEmployees(
      employees.filter(
        (emp) =>
          emp.mobile.includes(employeeSearch) ||
          emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
      )
    );
  }, [employeeSearch, employees]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      Swal.fire("Error", "Please select an employee", "error");
      return;
    }
    if (!salaryDate) {
      Swal.fire("Error", "Please select a date", "error");
      return;
    }
    if (!salaryAmount || isNaN(Number(salaryAmount))) {
      Swal.fire("Error", "Please enter a valid salary amount", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const salaryDateObj = new Date(salaryDate);

      const payload = {
        employee_id: selectedEmployee.id,
        salary_amount: Number(salaryAmount),
        salary_date: salaryDateObj.toISOString(), // full date
      };

      const res = await axiosInstance.post(
        "hr/employee/salary/submit",
        payload,
        { headers: { "X-Branch-ID": branchId } }
      );

      if (!res.data.error) {
        Swal.fire("Success", "Salary submitted successfully", "success");
        setSalaryAmount(""); // Reset input
      }
    } catch (err) {
      console.error("Salary submission failed:", err);
      Swal.fire("Error", "Failed to submit salary", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full p-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Employee Salary Input
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Date Selector */}
          <div>
            <label>Select Date *</label>
            <input
              type="date"
              value={salaryDate}
              onChange={(e) => setSalaryDate(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Employee Selector */}
          <div className="relative" ref={employeeRef}>
            <label>Employee *</label>
            <input
              type="text"
              placeholder="Search employee"
              value={employeeSearch}
              onChange={(e) => {
                setEmployeeSearch(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full p-2 border rounded-lg"
            />
            {showDropdown && (
              <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <li
                      key={emp.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setEmployeeSearch(`${emp.name} ${emp.mobile}`);
                        setShowDropdown(false);
                      }}
                    >
                      {emp.name} - {emp.mobile}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No employee found</li>
                )}
              </ul>
            )}
          </div>

          {/* Employee Info */}
          {selectedEmployee && (
            <div className="md:col-span-2 border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-lg font-semibold mb-2">Employee Info</h3>
              <p>
                <strong>Name:</strong> {selectedEmployee.name}
              </p>
              <p>
                <strong>Role:</strong> {selectedEmployee.role}
              </p>
              <p>
                <strong>Status:</strong> {selectedEmployee.status}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedEmployee.mobile}
              </p>
              {selectedEmployee.email && (
                <p>
                  <strong>Email:</strong> {selectedEmployee.email}
                </p>
              )}
              {selectedEmployee.passport_no && (
                <p>
                  <strong>Passport No:</strong> {selectedEmployee.passport_no}
                </p>
              )}
              <p>
                <strong>Joining Date:</strong>{" "}
                {new Date(selectedEmployee.joining_date).toLocaleDateString()}
              </p>
              {selectedEmployee.address && (
                <p>
                  <strong>Address:</strong> {selectedEmployee.address}
                </p>
              )}
              <p>
                <strong>Base Salary:</strong> $
                {selectedEmployee.base_salary.toFixed(2)}
              </p>
              <p>
                <strong>Overtime Rate:</strong> $
                {selectedEmployee.overtime_rate.toFixed(2)}
              </p>

              {/* Salary Input */}
              <div className="mt-4">
                <label>Enter Salary Amount *</label>
                <input
                  type="number"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter salary"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedEmployee && (
            <div className="md:col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 justify-center ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSubmitting ? "Submitting..." : "Submit Salary"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmployeeSalary;
