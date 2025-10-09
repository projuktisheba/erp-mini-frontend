import React, { useContext, useState } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { AppContext } from "../../context/AppContext";
import { Loader2 } from "lucide-react";

const AddCustomer: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("Branch ID not provided");
  }

  const { branchId } = context;
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    setIsSubmitting(true)
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
    finally{
      setIsSubmitting(false)
    }
  };

return (
  <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full max-w-5xl">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        Add Customer
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-2text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-600 focus:outline-none bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-green-500 text-sm"
            placeholder="John Doe"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-xs font-medium mb-2text-gray-700 dark:text-gray-300">
            Mobile
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-600 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm"
            placeholder="0123456789"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium mb-2text-gray-700 dark:text-gray-300">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-600 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm"
            placeholder="Customer Address"
          />
        </div>

        {/* Tax ID */}
        <div>
          <label className="block text-xs font-medium mb-2text-gray-700 dark:text-gray-300">
            Tax ID
          </label>
          <input
            type="text"
            name="tax_id"
            value={formData.tax_id}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-600 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm"
            placeholder="Tax ID"
          />
        </div>

        {/* Due Amount */}
        <div>
          <label className="block text-xs font-medium mb-2text-gray-700 dark:text-gray-300">
            Due Amount
          </label>
          <input
            type="number"
            name="due_amount"
            value={formData.due_amount}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-600 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm"
            placeholder="0"
          />
        </div>

        {/* Measurements */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold mt-2 mb-2 text-gray-700 dark:text-gray-300">
            Measurements (Optional)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.keys(formData.measurement).map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-2text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace("_", " ")}
                </label>
                <input
                  type="number"
                  name={key}
                  value={(formData.measurement as any)[key]}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-600 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
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

export default AddCustomer;
