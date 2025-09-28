import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import axios from "axios";
import Calendar from "./Calendar/Calendar";
import Laser from "./Laser/Laser";
import { useParams } from "react-router";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  email: string;
  mobile: string;
  bio: string;
  city: string;
  country: string;
  postal_code: string;
  tax_id: string;
  avatar_link: string;
  base_salary: number;
  overtime_rate: number;
  created_at: string;
  updated_at: string;
}

const fallbackImage = "https://i.postimg.cc/kG1Byx5n/photo-1740252117044-2af197eea287.avif";
const API_BASE = "https://api.erp.pssoft.xyz/api/v1";

export default function UserProfiles() {
  const {id} = useParams();
  const { isOpen, openModal, closeModal } = useModal();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>(fallbackImage);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"Profile" | "Calendar" | "Laser">("Profile");

  // Fetch employee data
useEffect(() => {
  const fetchEmployee = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.erp.pssoft.xyz/api/v1/hr/employee?id=${id}`
      );

      // console.log("API Response:", response.data);

      if (response.data.error === false && response.data.employee) {
        const employeeData = response.data.employee; 
        setEmployee(employeeData);
        setImagePreview(`${API_BASE}${employeeData.avatar_link}`);
      } else {
        setError(response.data.message || "Employee not found");
      }
    } catch (err) {
      setError("Failed to fetch employee data");
      console.error("Error fetching employee:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchEmployee();
}, [id]);

const handleSave = async () => {
  if (!employee) return;

  try {
    setSaving(true);

    const employeePayload = {
      id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      bio: employee.bio,
      mobile: employee.mobile,
      address: employee.city || "", 
      postal_code: employee.postal_code,
      tax_id: employee.tax_id,
      role: employee.role,
      status: employee.status,
      email: employee.email,
    };

    const response = await axios.put(`${API_BASE}/hr/employee`, employeePayload);

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





  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && employee) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file)); // Local preview

      try {
        setUploading(true);
        
        // Upload to backend
        const formData = new FormData();
        formData.append("id", employee.id.toString());
        formData.append("profile_picture", file);

 const res = await axios.post(
  // https://api.erp.pssoft.xyz/api/v1
  `${API_BASE}/hr/employee/profile-picture`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);

        
if (res.data.status === "success") {
  setEmployee((prev) =>
    prev ? { ...prev, avatar_link: res.data.avatar_link } : null
  );
  setImagePreview(res.data.avatar_link);
} else {
  alert("Image upload failed: " + res.data.message);
}

      } catch (err) {
        console.error("Image upload failed", err);
        alert("Image upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleResetPassword = () => {
    // Implement password reset functionality
    alert("Password reset functionality to be implemented");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error || "Employee not found"}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Tabs */}
      <div className="bg-white dark:bg-gray-900  dark:border-gray-800 p-4">
        <div className="flex flex-row gap-2 justify-center sm:justify-start">
          {["Profile", "Calendar", "Laser"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "Profile" | "Calendar" | "Laser")}
              className={`
                px-4 py-2 rounded-lg
                border border-gray-300 dark:border-gray-700
               
                ${
                  activeTab === tab
                    ? "border-blue-500 dark:border-b-blue-400 text-blue-700 dark:text-blue-400 font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }
                transition-colors duration-200
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-6">
        {activeTab === "Profile" && (
          <>
            <PageMeta
              title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
              description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Profile" />

            {/* User Photo Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                <div className="flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt={`${employee.first_name} ${employee.last_name}`}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                      {employee.first_name} {employee.last_name}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">{employee.role}</p>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        employee.status === "active"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {employee.status}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={openModal}
                  variant="outline"
                  className="mt-4 lg:mt-0"
                >
                  Edit
                </Button>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Personal Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.first_name}</p>
                </div>
                <div>
                  <Label>Last Name</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.last_name}</p>
                </div>
                <div>
                  <Label>Bio</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.bio || "Not provided"}</p>
                </div>
                <div>
                  <Label>Mobile</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.mobile}</p>
                </div>
                <div>
                  <Label>City</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.city || "Not provided"}</p>
                </div>
                <div>
                  <Label>Country</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.country || "Not provided"}</p>
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.postal_code || "Not provided"}</p>
                </div>
                <div>
                  <Label>Tax ID</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.tax_id || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Salary Information Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Salary Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Base Salary</Label>
                  <p className="text-gray-700 dark:text-gray-300">${employee.base_salary}</p>
                </div>
                <div>
                  <Label>Overtime Rate</Label>
                  <p className="text-gray-700 dark:text-gray-300">${employee.overtime_rate}/hour</p>
                </div>
              </div>
            </div>

            {/* Access Control Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Access Control
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.role}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p
                    className={`font-medium ${
                      employee.status === "active"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {employee.status}
                  </p>
                </div>
                <div>
                  <Label>Password</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetPassword}
                    className="mt-1"
                  >
                    Reset Password
                  </Button>
                </div>
              </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
              <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                  <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Edit Employee Information
                  </h4>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                    Update employee details to keep the profile up-to-date.
                  </p>
                </div>
                <form className="flex flex-col">
                  {/* Image Upload */}
                  <div className="mb-4 flex flex-col items-center gap-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="border p-2 rounded"
                    />
                    {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                  </div>

                  <div className="custom-scrollbar h-[350px] overflow-y-auto px-2 pb-3">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          type="text"
                          value={employee.first_name}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({
                              ...prev,
                              first_name: e.target.value,
                            }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          type="text"
                          value={employee.last_name}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({
                              ...prev,
                              last_name: e.target.value,
                            }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={employee.email}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, email: e.target.value }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Mobile</Label>
                        <Input
                          type="text"
                          value={employee.mobile}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, mobile: e.target.value }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input
                          type="text"
                          value={employee.role}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, role: e.target.value }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <select
                          value={employee.status}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, status: e.target.value }) : null)
                          }
                          className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <Label>Bio</Label>
                        <Input
                          type="text"
                          value={employee.bio}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, bio: e.target.value }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          type="text"
                          value={employee.city}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, city: e.target.value }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input
                          type="text"
                          value={employee.country}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, country: e.target.value }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Postal Code</Label>
                        <Input
                          type="text"
                          value={employee.postal_code}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, postal_code: e.target.value }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Tax ID</Label>
                        <Input
                          type="text"
                          value={employee.tax_id}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, tax_id: e.target.value }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Base Salary</Label>
                        <Input
                          type="number"
                          value={employee.base_salary}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, base_salary: parseFloat(e.target.value) || 0 }) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Overtime Rate</Label>
                        <Input
                          type="number"
                          value={employee.overtime_rate}
                          onChange={(e) =>
                            setEmployee((prev) => prev ? ({ ...prev, overtime_rate: parseFloat(e.target.value) || 0 }) : null)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                    <Button size="sm" variant="outline" onClick={closeModal} disabled={saving}>
                      Close
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            </Modal>
          </>
        )}
        {activeTab === "Calendar" && <Calendar />}
        {activeTab === "Laser" && <Laser />}
      </div>
    </div>
  );
}