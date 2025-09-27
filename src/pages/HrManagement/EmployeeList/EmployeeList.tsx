import { useState } from "react";
import { useNavigate } from "react-router";

interface Employee {
  id: string;
  fullName: string;
  role: string;
  status: string;
  email: string;
  mobile: string;
}

const dummyEmployees: Employee[] = [
  {
    id: "EMP001",
    fullName: "John Doe",
    role: "Developer",
    status: "Active",
    email: "john@example.com",
    mobile: "0123456789",
  },
  {
    id: "EMP002",
    fullName: "Jane Smith",
    role: "Designer",
    status: "Inactive",
    email: "jane@example.com",
    mobile: "0987654321",
  },
];

const EmployeeList = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [overtime, setOvertime] = useState<{ [key: string]: string }>({});

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
    // Clear input after submit
    setOvertime({ ...overtime, [id]: "" });
  };

  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              ID
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              Mobile
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
              Attendance
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {dummyEmployees.map((emp) => (
            <tr key={emp.id}>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {emp.id}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {emp.fullName}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {emp.role}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {emp.status}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {emp.email}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {emp.mobile}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => navigate(`/profile/${emp.id}`)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  View Profile
                </button>
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <select
                    value={attendance[emp.id] || ""}
                    onChange={(e) =>
                      handleAttendanceChange(emp.id, e.target.value)
                    }
                    className="p-1 border rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <option
                      className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      value=""
                    >
                      Select
                    </option>
                    <option
                      className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      value="Present"
                    >
                      Present
                    </option>
                    <option
                      className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      value="Absent"
                    >
                      Absent
                    </option>
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
                        className="p-1 border rounded w-24"
                      />
                      <button
                        onClick={() => handleSubmit(emp.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Submit
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
