import React, { useContext, useState } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { AppContext } from "../../context/AppContext";

const AddCustomer: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("Branch ID not provided");
  }

  const { branchId } = context;

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    tax_id: "",
    due_amount: 0,
    // status: true,
    measurement: {
      length: "",
      shoulder: "",
      bust: "",
      waist: "",
      hip: "",
      arm_hole: "",
      sleeve_length: "",
      sleeve_width: "",
      round_width: "",
    },
  });

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested measurement fields separately
    if (name in formData.measurement) {
      setFormData((prev) => ({
        ...prev,
        measurement: {
          ...prev.measurement,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/mis/customer", formData, {
        headers: {
          "X-Branch-ID": branchId,
        },
      });

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Customer Added",
          text: "New customer has been added successfully!",
        });

        // Reset form
        setFormData({
          name: "",
          mobile: "",
          address: "",
          tax_id: "",
          due_amount: 0,
          // status: true,
          measurement: {
            length: "",
            shoulder: "",
            bust: "",
            waist: "",
            hip: "",
            arm_hole: "",
            sleeve_length: "",
            sleeve_width: "",
            round_width: "",
          },
        });

        navigate("/customer-list");
      }
    } catch (error: any) {
      console.error("Error adding customer:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong while adding customer.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center p-4 px-4 dark:bg-gray-900 transition-colors duration-300">
      <div className="dark:bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-3xl transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Add Customer
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

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="Customer Address"
            />
          </div>

          {/* Tax ID */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Tax ID
            </label>
            <input
              type="text"
              name="tax_id"
              value={formData.tax_id}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="Tax ID"
            />
          </div>

          {/* Due Amount */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Due Amount
            </label>
            <input
              type="number"
              name="due_amount"
              value={formData.due_amount}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              placeholder="0"
            />
          </div>

          {/* Status */}
          {/* <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div> */}

          {/* Measurements (optional) */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
              Measurements (Optional)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(formData.measurement).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace("_", " ")}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={(formData.measurement as any)[key]}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
            >
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
