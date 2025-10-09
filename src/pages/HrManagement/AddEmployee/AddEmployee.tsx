import React, { useContext, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AppContext } from "../../../context/AppContext";
import { Loader2 } from "lucide-react";
import { API_URL } from "../../../hooks/AxiosInstance/AxiosInstance";

const AddEmployee: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext not provided");
  }
  const { branchId } = context;

  const[isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    mobile: "",
    email: "",
    passport_no: "",
    joining_date: new Date().toISOString().split("T")[0], // default today
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        joining_date: new Date(formData.joining_date).toISOString(), // full ISO format
      };

      const response = await axios.post(
        `${API_URL}/hr/employee`,
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "application/json",
            "X-Branch-ID": branchId,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Employee Added",
          text: "New employee has been added successfully!",
        });

        setFormData({
          name: "",
          role: "",
          mobile: "",
          email: "",
          passport_no: "",
          joining_date: new Date().toISOString().split("T")[0],
        });

      }
    } catch (error: any) {
      console.error("Error adding employee:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong while adding employee.",
      });
    } finally{
      setIsSubmitting(false)
    }
  };

  return (
    <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-2xl transition-colors duration-300">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
          Add New Employee
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="John Doe"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Role</option>
              <option value="salesperson">Salesperson</option>
              <option value="worker">Worker</option>
            </select>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Mobile
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="0123456789"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="john@example.com"
            />
          </div>

          {/* Passport No */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Passport No
            </label>
            <input
              type="text"
              name="passport_no"
              value={formData.passport_no}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Passport Number"
            />
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Joining Date
            </label>
            <input
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Submit */}
<div className="md:col-span-2 mt-3">
  <button
    type="submit"
    disabled={isSubmitting}
    className={`w-full py-3 rounded-md text-white font-medium text-sm transition-colors duration-300 flex items-center justify-center
      ${
        isSubmitting
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
  >
    {isSubmitting ? (
      <>
        <Loader2 className="animate-spin w-4 h-4 mr-2" />
        Processing...
      </>
    ) : (
      "Add Customer"
    )}
  </button>
</div>

          
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
