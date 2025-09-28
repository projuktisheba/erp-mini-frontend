import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../hooks/AxiosIntence/AxiosIntence";
import { useNavigate } from "react-router";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  email: string;
  mobile: string;
}

interface AttendanceFormData {
  name: string;
  email: string;
  mobile: string;
  status: string;
  overtime: string;
  checkin: string;
  checkout: string;
}

export default function BasicTableOne() {
  const [tableData, setTableData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AttendanceFormData>({
    name: "",
    email: "",
    mobile: "",
    status: "Present",
    overtime: "",
    checkin: "",
    checkout: "",
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("hr/employees");
      setTableData(res.data.employees);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAttendanceClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: `${employee.first_name} ${employee.last_name}`,
      email: employee.email,
      mobile: employee.mobile,
      status: "Present",
      overtime: "",
      checkin: "",
      checkout: "",
    });
    openModal();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleSubmit = async () => {
  if (!selectedEmployee) return;

  try {
    setSaving(true);

    const payload = JSON.stringify({
      employee_id: selectedEmployee.id,
      work_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      status: formData.status, 
      checkin: formData.checkin || "10:00",
      checkout: formData.checkout || "6:00",
      overtime_hours: formData.overtime ? parseFloat(formData.overtime) : 0,
    });

    const response = await axiosInstance.post(
      "/hr/attendance/present/single",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data.status === "success") {
      alert("Attendance recorded successfully!");
      closeModal();
    } else {
      alert("Failed to record attendance: " + response.data.message);
    }
  } catch (err) {
    console.error("Error recording attendance:", err);
    alert("Failed to record attendance");
  } finally {
    setSaving(false);
  }
};




  if (loading) {
    return (
      <div>
        <h1>Loading.....</h1>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  isHeader
                >
                  ID
                </TableCell>
                <TableCell
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  isHeader
                >
                  Name
                </TableCell>
                <TableCell
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  isHeader
                >
                  Role
                </TableCell>
                <TableCell
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  isHeader
                >
                  Status
                </TableCell>
                <TableCell
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  isHeader
                >
                  Email
                </TableCell>
                <TableCell
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  isHeader
                >
                  Mobile
                </TableCell>
                <TableCell
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  isHeader
                >
                  Profile
                </TableCell>
                <TableCell
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  isHeader
                >
                  Attendance
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="px-5 py-4 text-start">{employee.id}</TableCell>

                  <TableCell className="px-5 py-4 text-start">
                    {employee.first_name} {employee.last_name}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-start">{employee.role}</TableCell>

                  <TableCell className="px-5 py-4 text-start">{employee.status}</TableCell>

                  <TableCell className="px-5 py-4 text-start">{employee.email}</TableCell>

                  <TableCell className="px-5 py-4 text-start">{employee.mobile}</TableCell>

                  <TableCell className="px-5 py-4 text-start">
                    <Button
                      onClick={() => navigate(`/profile/${employee.id}`)}
                      size="sm"
                      variant="outline"
                    >
                      View Profile
                    </Button>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-start">
                    <Button
                      onClick={() => handleAttendanceClick(employee)}
                      size="sm"
                      variant="outline"
                    >
                      Check
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Attendance Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Record Attendance
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mark employee attendance and update their status.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Name Field */}
                <div>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled
                  />
                </div>

                {/* Email Field */}
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled
                  />
                </div>

                {/* Mobile Field */}
                <div>
                  <Label>Mobile</Label>
                  <Input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    disabled
                  />
                </div>

                {/* Status Field */}
                <div>
                  <Label>Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                {/* Conditional fields for Present status */}
                {formData.status === "Present" && (
                  <>
                    {/* Overtime Field */}
                    <div>
                      <Label>Overtime (Hours)</Label>
                      <Input
                        type="number"
                        placeholder="Enter overtime hours"
                        value={formData.overtime}
                        onChange={(e) => handleChange("overtime", e.target.value)}
                      />
                    </div>

                    {/* Check-in Time */}
                    <div>
                      <Label>Check-in Time</Label>
                      <Input
                        type="time"
                        value={formData.checkin}
                        onChange={(e) => handleChange("checkin", e.target.value)}
                      />
                    </div>

                    {/* Check-out Time */}
                    <div>
                      <Label>Check-out Time</Label>
                      <Input
                        type="time"
                        value={formData.checkout}
                        onChange={(e) => handleChange("checkout", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={saving}>
                {saving ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}