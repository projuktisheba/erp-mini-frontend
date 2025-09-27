import { useState } from "react";
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



interface Employee {
  id: string;
  fullName: string;
  role: string;
  status: string;
  email: string;
  mobile: string;
  bio: string;
  address: string;
  avatar: string;
}

const dummyEmployee: Employee = {
  id: "EMP001",
  fullName: "John Doe",
  role: "Developer",
  status: "Active",
  email: "john@example.com",
  mobile: "0123456789",
  bio: "Team Manager",
  address: "123, Street Name, City, Country",
  avatar: "https://i.pravatar.cc/150?img=3",
};

export default function UserProfiles() {
  const { isOpen, openModal, closeModal } = useModal();
  const [employee, setEmployee] = useState<Employee>(dummyEmployee);
  const [imagePreview, setImagePreview] = useState<string>(dummyEmployee.avatar);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"Profile" | "Calendar" | "Laser">("Profile");

  const handleSave = () => {
    alert("Saved!");
    closeModal();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file)); // Local preview

      // Upload to imgbb
      const formData = new FormData();
      formData.append("image", file);

      try {
        setUploading(true);
        const res = await axios.post(
          `https://api.imgbb.com/1/upload?key=af5080f6264ea38c18a1cf186815b22f`,
          formData
        );
        const imageUrl = res.data.data.url;
        setEmployee((prev) => ({ ...prev, avatar: imageUrl }));
        setUploading(false);
      } catch (err) {
        console.error("Image upload failed", err);
        setUploading(false);
      }
    }
  };

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

            {/* Top Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                <div className="flex items-center gap-4">
                  <img
                    src={employee.avatar}
                    alt={employee.fullName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700"
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                      {employee.fullName}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">{employee.role}</p>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        employee.status === "Active"
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

            {/* Personal Info Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Personal Information
                </h3>
                <Button size="sm" variant="outline" onClick={openModal}>
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.fullName.split(" ")[0]}</p>
                </div>
                <div>
                  <Label>Last Name</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.fullName.split(" ")[1]}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.email}</p>
                </div>
                <div>
                  <Label>Mobile</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.mobile}</p>
                </div>
                <div className="md:col-span-2">
                  <Label>Bio</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.bio}</p>
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <p className="text-gray-700 dark:text-gray-300">{employee.address}</p>
                </div>
              </div>
            </div>

            {/* Edit Modal */}
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
                  {/* Image Upload */}
                  <div className="mb-4 flex flex-col items-center gap-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border border-gray-300 dark:border-gray-700"
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
                          value={employee.fullName.split(" ")[0]}
                          onChange={(e) =>
                            setEmployee((prev) => ({
                              ...prev,
                              fullName: e.target.value + " " + prev.fullName.split(" ")[1],
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          type="text"
                          value={employee.fullName.split(" ")[1]}
                          onChange={(e) =>
                            setEmployee((prev) => ({
                              ...prev,
                              fullName: prev.fullName.split(" ")[0] + " " + e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="text"
                          value={employee.email}
                          onChange={(e) =>
                            setEmployee((prev) => ({ ...prev, email: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Mobile</Label>
                        <Input
                          type="text"
                          value={employee.mobile}
                          onChange={(e) =>
                            setEmployee((prev) => ({ ...prev, mobile: e.target.value }))
                          }
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <Label>Bio</Label>
                        <Input
                          type="text"
                          value={employee.bio}
                          onChange={(e) =>
                            setEmployee((prev) => ({ ...prev, bio: e.target.value }))
                          }
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <Label>Address</Label>
                        <Input
                          type="text"
                          value={employee.address}
                          onChange={(e) =>
                            setEmployee((prev) => ({ ...prev, address: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                    <Button size="sm" variant="outline" onClick={closeModal}>
                      Close
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSave}>
                      Save Changes
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