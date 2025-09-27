import { useState } from "react";
import Swal from "sweetalert2";
import PageMeta from "../components/common/PageMeta";



interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: "Employee" | "Worker";
  status: "Active" | "Inactive";
  email: string;
  mobile: string;
  baseSalary: string;
  overtimeRate?: string;
}

const dummyEmployees: Employee[] = [
  {
    id: "EMP001",
    firstName: "John",
    lastName: "Doe",
    role: "Employee",
    status: "Active",
    email: "john@example.com",
    mobile: "0123456789",
    baseSalary: "$3000",
    overtimeRate: "$20/hr",
  },
  {
    id: "EMP002",
    firstName: "Jane",
    lastName: "Smith",
    role: "Worker",
    status: "Inactive",
    email: "jane@example.com",
    mobile: "0987654321",
    baseSalary: "$2500",
    overtimeRate: "$18/hr",
  },
];

const HrManagement: React.FC = () => {
  const [tab, setTab] = useState<"list" | "add" | "attendance">("list");
  const [employees, setEmployees] = useState<Employee[]>(dummyEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<"Present" | "Absent" | "Leave" | "">("");
  const [overtime, setOvertime] = useState<string>("");

  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: "",
    firstName: "",
    lastName: "",
    role: "Employee",
    status: "Active",
    email: "",
    mobile: "",
    baseSalary: "",
  });

  const handleOpenAttendanceModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setAttendanceStatus("");
    setOvertime("");

    Swal.fire({
      title: `Attendance: ${emp.firstName} ${emp.lastName}`,
      html: `
        <p>Email: ${emp.email}</p>
        <p>Mobile: ${emp.mobile}</p>
        <label class="swal2-label">Today Status</label>
        <select id="attendance-select" class="swal2-select mt-2">
          <option value="">Select Status</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
        </select>
        <div id="overtime-container" style="display:none; margin-top:10px;">
          <label>Overtime Hour</label>
          <input id="overtime-input" type="number" class="swal2-input" placeholder="Overtime hour" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Save",
      focusConfirm: false,
      didOpen: () => {
        const select = document.getElementById("attendance-select") as HTMLSelectElement;
        const overtimeContainer = document.getElementById("overtime-container")!;
        const overtimeInput = document.getElementById("overtime-input") as HTMLInputElement;

        select.addEventListener("change", () => {
          setAttendanceStatus(select.value as "Present" | "Absent" | "Leave" | "");
          if (select.value === "Present") {
            overtimeContainer.style.display = "block";
          } else {
            overtimeContainer.style.display = "none";
            setOvertime("");
          }
        });

        overtimeInput.addEventListener("input", () => {
          setOvertime(overtimeInput.value);
        });
      },
      preConfirm: () => {
        return {
          employee: emp,
          status: attendanceStatus,
          overtime: attendanceStatus === "Present" ? overtime : null,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Attendance Saved:", result.value);
        Swal.fire("Saved!", "Attendance has been recorded.", "success");
      }
    });
  };

  const handleAddEmployee = () => {
    setEmployees([...employees, { ...newEmployee }]);
    setNewEmployee({
      id: "",
      firstName: "",
      lastName: "",
      role: "Employee",
      status: "Active",
      email: "",
      mobile: "",
      baseSalary: "",
    });
    setTab("list");
    Swal.fire("Success!", "Employee added successfully", "success");
  };

  return (
    <>
      <PageMeta
        title="HR Management | ERP Mini"
        description="Employee & Attendance Management"
      />
      <div className="p-6 space-y-6 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-semibold">HR Management</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {(["list", "add", "attendance"] as const).map((t) => (
            <button
              key={t}
              className={`px-4 py-2 rounded ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-white"
              }`}
              onClick={() => setTab(t)}
            >
              {t === "list" ? "Employee List" : t === "add" ? "Add Employee" : "Attendance"}
            </button>
          ))}
        </div>

        {/* Employee List */}
        {tab === "list" && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {["ID", "Full Name", "Role", "Status", "Email", "Mobile", "Base Salary", "Overtime Rate", "Action"].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-sm font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-2">{emp.id}</td>
                    <td className="px-4 py-2">{emp.firstName} {emp.lastName}</td>
                    <td className="px-4 py-2">{emp.role}</td>
                    <td className="px-4 py-2">{emp.status}</td>
                    <td className="px-4 py-2">{emp.email}</td>
                    <td className="px-4 py-2">{emp.mobile}</td>
                    <td className="px-4 py-2">{emp.baseSalary}</td>
                    <td className="px-4 py-2">{emp.overtimeRate || "-"}</td>
                    <td className="px-4 py-2">
                      <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Employee */}
        {tab === "add" && (
          <div className="max-w-lg p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 space-y-4">
            {Object.entries(newEmployee).map(([key, value]) => {
              if (key === "overtimeRate") return null;
              return (
                <div key={key}>
                  <label className="block mb-1 capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
                  {key === "role" || key === "status" ? (
                    <select
                      className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={value as string}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, [key]: e.target.value })
                      }
                    >
                      {key === "role" ? ["Employee", "Worker"].map(v => <option key={v}>{v}</option>)
                        : ["Active", "Inactive"].map(v => <option key={v}>{v}</option>)}
                    </select>
                  ) : (
                    <input
                      type={key === "email" ? "email" : "text"}
                      value={value as string}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, [key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  )}
                </div>
              );
            })}
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={handleAddEmployee}>
              Add Employee
            </button>
          </div>
        )}

        {/* Attendance */}
        {tab === "attendance" && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {["ID", "Full Name", "Email", "Mobile", "Action"].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-sm font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-2">{emp.id}</td>
                    <td className="px-4 py-2">{emp.firstName} {emp.lastName}</td>
                    <td className="px-4 py-2">{emp.email}</td>
                    <td className="px-4 py-2">{emp.mobile}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleOpenAttendanceModal(emp)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Check
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default HrManagement;
