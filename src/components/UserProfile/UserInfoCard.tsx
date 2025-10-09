import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";

interface UserInfoCardProps {
  employee: {
    id: string;
    name: string;
    bio?: string;
    mobile?: string;
    tax_id?: string;
    country?: string;
    city?: string;
    address?: string;
    postal_code?: string;
    role: string;
    status: string;
    email: string;
  };
}

export default function UserInfoCard({ employee }: UserInfoCardProps) {
  const { isOpen, openModal, closeModal } = useModal();

  const [formData, setFormData] = useState({
    name: employee.name || "",
    bio: employee.bio || "",
    mobile: employee.mobile || "",
    taxId: employee.tax_id || "",
    country: employee.country || "",
    city: employee.city || "",
    address: employee.address || "",
    postalCode: employee.postal_code || "",
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
        name: formData.name,
        bio: formData.bio,
        mobile: formData.mobile,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        postal_code: formData.postalCode,
        tax_id: formData.taxId,
        role: employee.role,
        status: employee.status,
      };

      const response = await axiosInstance.put("/hr/employee", payload);

      if (response.data.status === "success") {
        alert("Employee updated successfully!");
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
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          {Object.entries(formData).map(([key, value], idx) => (
            <div key={idx}>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {value || "-"}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          Edit
        </button>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  {Object.entries(formData).map(([key, value], idx) => (
                    <div key={idx} className="col-span-2 lg:col-span-1">
                      <Label>
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </Label>
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  ))}
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
    </div>
  );
}
