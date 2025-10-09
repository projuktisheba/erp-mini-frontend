import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../hooks/AxiosInstance/AxiosInstance";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import Swal from "sweetalert2";

interface AccessControlProps {
  employee: {
    id: string;
    email?: string;
    role?: string;
    status?: string;
  };
}

export default function AccessControl({ employee }: AccessControlProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: employee?.email || "",
    role: employee?.role || "Employee",
    status: employee?.status || "Active",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: "Please provide a valid email address.",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: employee.id,
        email: formData.email.trim(),
        role: formData.role,
        status: formData.status,
      };

      const res = await axiosInstance.put("/hr/employee", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.error == false) {
        Swal.fire({
          icon: "success",
          title: "Access Updated",
          text: "Employee access control updated successfully.",
          timer: 1800,
          showConfirmButton: false,
        });
        closeModal();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: res.data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Unable to update employee right now. Please try again later.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* --- Access Control Section --- */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Access Control
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formData.email || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Role</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formData.role}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p
                  className={`text-sm font-medium ${
                    formData.status === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  } dark:text-white/90`}
                >
                  {formData.status}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            Edit
          </button>
        </div>
      </div>

      {/* --- Edit Modal --- */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Access Control
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update employee access information.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="flex flex-col"
          >
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label>Role</Label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    disabled={saving}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Worker">Worker</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    disabled={saving}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                disabled={saving}
              >
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
