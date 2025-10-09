import { useState, useEffect, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../hooks/AxiosInstance/AxiosInstance";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import Swal from "sweetalert2";
import { AppContext } from "../../../context/AppContext";

interface Employee {
  id: number;
  name: string;
  status: string;
  email: string;
  mobile: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  on_leave:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export default function EmployeeList() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("Branch Id is not provided");
  }
  const { branchId } = context;

  const [tableData, setTableData] = useState<Employee[]>([]);
  const [filteredData, setFilteredData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    work_date: new Date().toISOString().split("T")[0],
    overtime: "",
    advancePayment: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("hr/employees?role=worker", {
        headers: {
          "X-Branch-ID": branchId,
        },
      });
      setTableData(res.data.employees);
      setFilteredData(res.data.employees);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [branchId]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = tableData.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.mobile.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  }, [searchQuery, tableData]);

  const handleAttendanceClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      work_date: new Date().toISOString().split("T")[0],
      overtime: "",
      advancePayment: "",
    });
    openModal();
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) return;
    try {
      setSaving(true);
      const payload = {
        employee_id: selectedEmployee.id,
        work_date: formData.work_date,
        overtime_hours: formData.overtime ? parseFloat(formData.overtime) : 0,
        advance_payment: formData.advancePayment
          ? parseFloat(formData.advancePayment)
          : 0,
      };
      const response = await axiosInstance.post(
        "/hr/attendance/present/single",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Branch-ID": branchId,
          },
        }
      );

      if (response.data.status === "success") {
        Swal.fire("Success", "Attendance recorded successfully!", "success");
        closeModal();
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Failed to record attendance",
          "error"
        );
      }
    } catch (err) {
      console.error("Error recording attendance:", err);
      Swal.fire("Error", "Failed to record attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading employees...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Worker Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage workers and record attendance
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 flex items-center gap-2">
        <Search className="text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search by name or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <TableRow>
                <TableCell className="py-2">ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Profile</TableCell>
                <TableCell>Attendance</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    {searchQuery
                      ? "No employees match your search."
                      : "No employees found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                          statusColors[employee.status] ||
                          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {employee.status.charAt(0).toUpperCase() +
                          employee.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.mobile}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => navigate(`/profile/${employee.id}`)}
                        size="sm"
                        variant="outline"
                      >
                        View Profile
                      </Button>
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        onClick={() => handleAttendanceClick(employee)}
                        size="sm"
                        variant="outline"
                      >
                        Check
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Attendance Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
          <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Record Attendance
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Name</Label>
              <Input type="text" value={formData.name} disabled />
            </div>
            <div>
              <Label>Work Date</Label>
              <Input
                type="date"
                value={formData.work_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    work_date: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Overtime Hours</Label>
              <Input
                type="number"
                placeholder="Enter overtime hours"
                value={formData.overtime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, overtime: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Advance Payment</Label>
              <Input
                type="number"
                placeholder="Enter advance payment amount"
                value={formData.advancePayment}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    advancePayment: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={saving}>
              {saving ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
