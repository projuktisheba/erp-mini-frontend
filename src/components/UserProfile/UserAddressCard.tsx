import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";

interface UserAddressCardProps {
  employee: {
    id: string;
    base_salary?: number;
    overtime_rate?: number;
  };
}

export default function UserAddressCard({ employee }: UserAddressCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
const [formData, setFormData] = useState<{
  baseSalary: string;
  overtime: string;
}>({
  baseSalary: employee?.base_salary?.toString() || "",
  overtime: employee?.overtime_rate?.toString() || "",
});


  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        id: employee.id,
        base_salary: parseFloat(formData.baseSalary) || 0,
        overtime_rate: parseFloat(formData.overtime) || 0,
      };

      const response = await axiosInstance.put(
        "/hr/employee/salary",
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        alert("Employee salary updated successfully!");
        closeModal();
      } else {
        alert("Failed to update employee: " + response.data.message);
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      alert("Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
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

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Salary
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update employee salary and overtime rate.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Base Salary</Label>
                  <Input
                    type="text"
                    value={formData.baseSalary}
                    onChange={(e) => handleChange("baseSalary", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Overtime (Hr)</Label>
                  <Input
                    type="text"
                    value={formData.overtime}
                    onChange={(e) => handleChange("overtime", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
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
