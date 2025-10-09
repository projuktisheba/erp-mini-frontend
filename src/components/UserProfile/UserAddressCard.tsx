import { useState, useMemo } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import Swal from "sweetalert2";

interface UserAddressCardProps {
  employee: {
    id: string;
    base_salary?: number;
    overtime_rate?: number;
  };
}

export default function UserAddressCard({ employee }: UserAddressCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);

  const initialForm = useMemo(
    () => ({
      baseSalary: employee?.base_salary?.toString() || "",
      overtime: employee?.overtime_rate?.toString() || "",
    }),
    [employee]
  );

  const [formData, setFormData] = useState(initialForm);

  const handleChange = (field: keyof typeof formData, value: string) => {
    // Only allow numeric or decimal input
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.baseSalary.trim() || isNaN(Number(formData.baseSalary))) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Base Salary",
        text: "Please enter a valid numeric base salary.",
      });
      return false;
    }
    if (!formData.overtime.trim() || isNaN(Number(formData.overtime))) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Overtime Rate",
        text: "Please enter a valid numeric overtime rate.",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        id: employee.id,
        base_salary: parseFloat(formData.baseSalary) || 0,
        overtime_rate: parseFloat(formData.overtime) || 0,
      };

      const { data } = await axiosInstance.put("/hr/employee/salary", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (data.error == false) {
        Swal.fire({
          icon: "success",
          title: "Salary Updated!",
          text: "Employee salary information has been updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        closeModal();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message || "Unable to update salary. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error updating employee salary:", err);
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: "Could not connect to the server. Please try again later.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Salary Info Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Salary Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Base Salary
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formData.baseSalary || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Overtime Rate
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formData.overtime || "-"} / hr
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={openModal}
            variant="outline"
            className="rounded-full"
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white rounded-3xl no-scrollbar dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Salary
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update the employee's salary and overtime rate.
            </p>
          </div>

          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="px-2 custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label htmlFor="baseSalary">Base Salary</Label>
                  <Input
                    id="baseSalary"
                    type="text"
                    value={formData.baseSalary}
                    onChange={(e) => handleChange("baseSalary", e.target.value)}
                    placeholder="Enter base salary"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label htmlFor="overtime">Overtime Rate (per hour)</Label>
                  <Input
                    id="overtime"
                    type="text"
                    value={formData.overtime}
                    onChange={(e) => handleChange("overtime", e.target.value)}
                    placeholder="Enter overtime rate"
                    disabled={saving}
                  />
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
              <Button size="sm" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
