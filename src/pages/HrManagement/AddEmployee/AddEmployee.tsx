import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const API_BASE = "https://api.erp.pssoft.xyz/api/v1";

const AddEmployee: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    role: "",
    status: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
  });
  const navigate = useNavigate();

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

    try {
      const response = await axios.post(
        `${API_BASE}/hr/employee`,
        JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          status: formData.status,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Employee Added",
          text: "New employee has been added successfully!",
        });

        // Reset form
        setFormData({
          first_name: "",
          last_name: "",
          role: "",
          status: "",
          email: "",
          mobile: "",
          password: "",
          confirm_password: "",
        });
        navigate("/employee-list");
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
    }
  };

  const passwordsMatch =
    formData.password && formData.password === formData.confirm_password;

  return (
    <div className="flex items-center justify-center p-4 px-4  dark:bg-gray-900 transition-colors duration-300">
      <div className=" dark:bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-8xl transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100 transition-colors duration-300">
          Add Employee
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="John"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="Doe"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Role
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="Developer"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="">Select</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
              required
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="john@example.com"
            />
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
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="0123456789"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="Enter password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="Confirm password"
            />
            {!passwordsMatch && formData.confirm_password && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!passwordsMatch}
              className={`w-full py-2 rounded-lg text-white ${
                passwordsMatch
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
              } transition-colors duration-300`}
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
