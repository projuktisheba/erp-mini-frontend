import { useState, useMemo } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import Swal from "sweetalert2";

interface Employee {
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
}

interface UserInfoCardProps {
  employee: Employee;
}

export default function UserInfoCard({ employee }: UserInfoCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);

  const initialForm = useMemo(
    () => ({
      name: employee.name || "",
      bio: employee.bio || "",
      mobile: employee.mobile || "",
      tax_id: employee.tax_id || "",
      country: employee.country || "",
      city: employee.city || "",
      address: employee.address || "",
      postal_code: employee.postal_code || "",
    }),
    [employee]
  );

  const [formData, setFormData] = useState(initialForm);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        id: employee.id,
        ...formData,
        role: employee.role,
        status: employee.status,
      };

      const { data } = await axiosInstance.put("/hr/employee", payload);

      if (data.error) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message || "An unknown error occurred.",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Employee updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        closeModal();
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: "Could not update employee. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400 capitalize">
                {key.replace(/_/g, " ")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {value || "-"}
              </p>
            </div>
          ))}
        </div>

        <Button
          onClick={openModal}
          variant="outline"
          className="rounded-full"
        >
          Edit
        </Button>
      </div>

      {/* --- Modal --- */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10">
          <header className="mb-6">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your details to keep your profile up to date.
            </p>
          </header>

          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3">
              <section className="mt-4">
                <h5 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="col-span-2 lg:col-span-1">
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/_/g, " ")}
                      </Label>
                      <Input
                        id={key}
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handleChange(key as keyof typeof formData, e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                disabled={saving}
              >
                Close
              </Button>
              <Button
                size="sm"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </footer>
          </form>
        </div>
      </Modal>
    </div>
  );
}
