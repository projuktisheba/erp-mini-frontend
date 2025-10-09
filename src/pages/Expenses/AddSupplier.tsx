import React, { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { AppContext } from "../../context/AppContext";
import { useContext } from "react";

const AddSupplier: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!formData.name.trim()) {
      Swal.fire("Error", "Supplier name is required", "error");
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await axiosInstance.post(
        "/mis/supplier",
        formData,
        {
          headers: { "X-Branch-ID": branchId },
        }
      );

      if (!res.data.error) {
        Swal.fire("Success", "Supplier added successfully", "success");
        setFormData({ name: "", mobile: "" });
      }
    } catch (error: any) {
      console.error("Error adding supplier:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full p-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Add New Supplier
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Supplier Name */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Supplier Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter supplier name"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Mobile Number */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Mobile Number </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 justify-center ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isSubmitting ? "Saving..." : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplier;
