import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
// import { useNavigate } from "react-router";

const API_BASE = "https://api.erp.pssoft.xyz/api/v1";

const AddEmployee: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    mobile: "",
    email: "",
    passport_no: "",
    joining_date: new Date().toISOString().split("T")[0], // default today
  });

  // const navigate = useNavigate();

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
      const payload = {
        ...formData,
        joining_date: new Date(formData.joining_date).toISOString(), // full ISO format
      };

      const response = await axios.post(
        `${API_BASE}/hr/employee`,
        JSON.stringify(payload),
        {
          headers: { "Content-Type": "application/json", "X-Branch-ID": "1" },
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

        // navigate("/employee-list");
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

  return (
    <div className="flex items-center justify-center p-4 px-4 dark:bg-gray-900 transition-colors duration-300">
      <div className="dark:bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-3xl transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Add Employee
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
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
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
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
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
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
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
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
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
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
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
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
