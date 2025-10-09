import React, { useState, useEffect, useRef, useContext } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";

interface Supplier {
  id: number;
  name: string;
}

const MaterialsPurchase: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const navigate = useNavigate();

  const getCurrentDate = () => new Date().toISOString().slice(0, 10);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    supplier_id: 0,
    total_amount: 0,
    purchase_date: getCurrentDate(),
    memo_no: "",
    note: "",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        supplierRef.current &&
        !supplierRef.current.contains(e.target as Node)
      ) {
        setShowSupplierDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const { data } = await axiosInstance.get("/mis/suppliers", {
        headers: { "X-Branch-ID": branchId },
      });
      setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch suppliers", "error");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [branchId]);

  // Filter suppliers based on input
  useEffect(() => {
    setFilteredSuppliers(
      suppliers.filter((s) =>
        s.name.toLowerCase().includes(supplierSearch.toLowerCase())
      )
    );
  }, [supplierSearch, suppliers]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!formData.supplier_id) {
      Swal.fire("Error", "Please select a supplier", "error");
      return;
    }
    if (!formData.total_amount || formData.total_amount <= 0) {
      Swal.fire("Error", "Total amount must be greater than 0", "error");
      return;
    }
    if (!formData.purchase_date) {
      Swal.fire("Error", "Purchase date is required", "error");
      return;
    }
    if (!formData.memo_no) {
      Swal.fire("Error", "Memo is required", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axiosInstance.post(
        "/purchase",
        {
          ...formData,
          purchase_date: formData.purchase_date + "T00:00:00Z",
        },
        {
          headers: { "X-Branch-ID": branchId },
        }
      );

      if (!res.data.error) {
        Swal.fire("Success", "Purchase added successfully", "success");
        navigate("/materials-purchase");
      }
    } catch (error: any) {
      console.error("Purchase creation error:", error);
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
    <div className="min-h-screen flex justify-center">
      <div className="w-full p-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          New Purchase
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Supplier */}
          <div className="relative" ref={supplierRef}>
            <label>Supplier *</label>
            <input
              type="text"
              placeholder="Search supplier"
              value={supplierSearch}
              onChange={(e) => {
                setSupplierSearch(e.target.value);
                setShowSupplierDropdown(true);
              }}
              className="w-full p-2 border rounded-lg"
            />
            {showSupplierDropdown && (
              <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((s) => (
                    <li
                      key={s.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          supplier_id: s.id,
                        }));
                        setSupplierSearch(s.name);
                        setShowSupplierDropdown(false);
                      }}
                    >
                      {s.name}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No supplier found</li>
                )}
              </ul>
            )}
          </div>

          {/* Total Amount */}
          <div>
            <label>Total Amount *</label>
            <input
              type="number"
              name="total_amount"
              min={0}
              value={formData.total_amount}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label>Purchase Date *</label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Memo No. */}
          <div>
            <label>Memo No *</label>
            <input
              type="text"
              name="memo_no"
              value={formData.memo_no}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Note */}
          <div className="md:col-span-2">
            <label>Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end">
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
              {isSubmitting ? "Submitting..." : "Add Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialsPurchase;
