import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

interface Employee {
  id: string;
  fullName: string;
  role: string;
  status: string;
  email: string;
  mobile: string;
}

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [overtime, setOvertime] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(
        "https://api.erp.pssoft.xyz/api/v1/hr/employees"
      );



      // Handle different possible response structures
      let rawEmployees = [];
      
      if (res.data.employees) {
        rawEmployees = res.data.employees;
      } else if (Array.isArray(res.data)) {
        rawEmployees = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        rawEmployees = res.data.data;
      } else {
        console.warn("Unexpected response structure:", res.data);
        rawEmployees = [];
      }



      // Map the data to our interface
      const mapped: Employee[] = rawEmployees.map((emp: any, index: number) => {
        // console.log(`Employee ${index}:`, emp);
        
        return {
          id: emp.id?.toString() || emp.employee_id?.toString() || `emp_${index}`,
          fullName: `${emp.first_name || emp.firstName || ""} ${emp.last_name || emp.lastName || ""}`.trim(),
          role: emp.role || emp.position || emp.designation || "",
          status: emp.status || "unknown",
          email: emp.email || "",
          mobile: emp.mobile || emp.phone || emp.phone_number || "",
        };
      });

      // console.log("Mapped employees:", mapped);
      setEmployees(mapped);

    } catch (error: any) {
      console.error("Failed to fetch employees:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      setError(error.response?.data?.message || error.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAttendanceChange = (id: string, value: string) => {
    setAttendance({ ...attendance, [id]: value });
    if (value === "Absent") {
      setOvertime({ ...overtime, [id]: "" });
    }
  };

  const handleOvertimeChange = (id: string, value: string) => {
    setOvertime({ ...overtime, [id]: value });
  };

  const handleSubmit = (id: string) => {
    alert(
      `Employee ${id} submitted with ${attendance[id]} and Overtime Hour: ${
        overtime[id] || 0
      }`
    );
    setOvertime({ ...overtime, [id]: "" });
  };

  const handleRefresh = () => {
    fetchEmployees();
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Error: {error}
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Employee List ({employees.length})
        </h2>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Mobile</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Profile</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Attendance</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{emp.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{emp.fullName || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{emp.role || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    emp.status?.toLowerCase() === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {emp.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{emp.email || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{emp.mobile || 'N/A'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigate(`/profile/${emp.id}`)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                  >
                    View Profile
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <select
                      value={attendance[emp.id] || ""}
                      onChange={(e) =>
                        handleAttendanceChange(emp.id, e.target.value)
                      }
                      className="p-1 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    >
                      <option value="">Select</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>

                    {attendance[emp.id] === "Present" && (
                      <>
                        <input
                          type="number"
                          placeholder="Overtime Hour"
                          value={overtime[emp.id] || ""}
                          onChange={(e) =>
                            handleOvertimeChange(emp.id, e.target.value)
                          }
                          className="p-1 border rounded w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          min="0"
                          max="24"
                        />
                        <button
                          onClick={() => handleSubmit(emp.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
                        >
                          Submit
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {employees.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="text-lg mb-2">No employees found</div>
                  <div className="text-sm">Try refreshing or check if employees have been added to the system</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;