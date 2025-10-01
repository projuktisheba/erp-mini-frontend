import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const API_BASE = "https://api.erp.pssoft.xyz/api/v1";

interface ProductItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const AddOrder: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [salesmans, setSalesmans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Fix: Format date with time for backend
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().split(".")[0] + "Z"; // Format: "2025-01-30T10:30:00Z"
  };

  const [formData, setFormData] = useState({
    memo_no: "",
    order_date: getCurrentDateTime(), // Use datetime instead of just date
    sales_man_id: 0,
    customer_id: 0,
    total_payable_amount: 0,
    advance_payment_amount: 0,
    due_amount: 0,
    payment_account_id: 0,
    status: "",
    notes: "",
    items: [] as ProductItem[],
  });

  const [selectedProductId, setSelectedProductId] = useState<number>(0);

  // search states
  const [salesmanSearch, setSalesmanSearch] = useState("");
  const [filteredSalesmans, setFilteredSalesmans] = useState<any[]>([]);
  const [showSalesmanDropdown, setShowSalesmanDropdown] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Refs for detecting clicks outside
  const salesmanRef = useRef<HTMLDivElement>(null);
  const customerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        salesmanRef.current &&
        !salesmanRef.current.contains(event.target as Node)
      ) {
        setShowSalesmanDropdown(false);
      }
      if (
        customerRef.current &&
        !customerRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Recalculate due amount
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      due_amount: prev.total_payable_amount - prev.advance_payment_amount,
    }));
  }, [formData.total_payable_amount, formData.advance_payment_amount]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "order_date") {
      // Convert date input to datetime format for backend
      const dateTimeString = value + "T00:00:00Z"; // Add time portion
      setFormData((prev) => ({
        ...prev,
        [name]: dateTimeString,
      }));
    } else if (name === "payment_account_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "advance_payment_amount" ? Number(value) : value,
      }));
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(Number(e.target.value));
  };

  const addProduct = () => {
    if (!selectedProductId) {
      Swal.fire("Error", "Please select a product", "error");
      return;
    }

    const selectedProduct = products.find((p) => p.id === selectedProductId);
    if (!selectedProduct) {
      Swal.fire("Error", "Selected product not found", "error");
      return;
    }

    const newItem: ProductItem = {
      product_id: selectedProductId,
      product_name: selectedProduct.product_name,
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setSelectedProductId(0);
  };

  const removeProduct = (index: number) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items.splice(index, 1);
      const total_payable_amount = items.reduce(
        (sum, item) => sum + item.total_price,
        0
      );
      return { ...prev, items, total_payable_amount };
    });
  };

  const updateProductField = (
    index: number,
    field: keyof ProductItem,
    value: number
  ) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        [field]: value,
        total_price:
          (field === "quantity" ? value : items[index].quantity) *
          (field === "unit_price" ? value : items[index].unit_price),
      };
      const total_payable_amount = items.reduce(
        (sum, item) => sum + item.total_price,
        0
      );
      return { ...prev, items, total_payable_amount };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "order_date",
      "sales_man_id",
      "customer_id",
      "payment_account_id",
      "status",
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        Swal.fire("Error", `Please fill ${field.replace("_", " ")}`, "error");
        return;
      }
    }

    if (formData.items.length === 0) {
      Swal.fire("Error", "Please add at least one product", "error");
      return;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (item.quantity <= 0 || item.unit_price <= 0) {
        Swal.fire(
          "Error",
          `Product "${item.product_name}" must have quantity > 0 and unit price > 0`,
          "error"
        );
        return;
      }
    }

    try {
      // Prepare data for API - remove product_name from items
      const apiData = {
        ...formData,
        items: formData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      };

      const response = await axios.post(`${API_BASE}/orders`, apiData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(response);

      if (!response.data.error) {
        Swal.fire("Success", "Order created successfully", "success");
        // navigate("/orders");
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  const fetchProducts = async () => {
    const { data } = await axios.get(`${API_BASE}/products`);
    setProducts(data.products);
  };

  const fetchSalesman = async () => {
    const { data } = await axios.get(`${API_BASE}/hr/employees/names`);
    setSalesmans(data.employees);
  };

  const fetchCustomers = async () => {
    const { data } = await axios.get(`${API_BASE}/mis/customers/names`);
    setCustomers(data.customers);
  };

  useEffect(() => {
    fetchProducts();
    fetchSalesman();
    fetchCustomers();
  }, []);

  // 🔹 Salesman filter by ID or Name
  useEffect(() => {
    setFilteredSalesmans(
      salesmans.filter((s) => {
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        const idMatch = s.id.toString().includes(salesmanSearch.toLowerCase());
        const nameMatch = fullName.includes(salesmanSearch.toLowerCase());
        return idMatch || nameMatch;
      })
    );
  }, [salesmanSearch, salesmans]);

  // 🔹 Customer filter by Name or Mobile
  useEffect(() => {
    setFilteredCustomers(
      customers.filter((c) => {
        const nameMatch = c.name
          .toLowerCase()
          .includes(customerSearch.toLowerCase());
        const mobileMatch = c.mobile
          ?.toString()
          .includes(customerSearch.toLowerCase());
        return nameMatch || mobileMatch;
      })
    );
  }, [customerSearch, customers]);

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full p-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          New Order
        </h2>

        {/* Main Order Form */}
        <form
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          onSubmit={handleSubmit}
        >
          {/* Memo No */}
          <div>
            <label className="block text-sm font-medium mb-1">Memo No</label>
            <input
              type="text"
              name="memo_no"
              value={formData.memo_no}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              placeholder="INV-2001"
            />
          </div>

          {/* Order Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Order Date</label>
            <input
              type="date"
              name="order_date"
              value={formData.order_date.split("T")[0]} // Extract just the date part for input
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Salesman (Search by ID or Name) */}
          <div className="relative" ref={salesmanRef}>
            <label className="block text-sm font-medium mb-1">Salesman</label>
            <input
              type="text"
              placeholder="Search by ID or Name"
              value={salesmanSearch}
              onChange={(e) => {
                setSalesmanSearch(e.target.value);
                setShowSalesmanDropdown(true);
              }}
              onFocus={() => setShowSalesmanDropdown(true)}
              className="w-full p-2 border rounded-lg"
            />
            {showSalesmanDropdown && salesmanSearch && (
              <ul className="absolute bg-white border rounded w-full max-h-40 overflow-y-auto z-10 shadow-lg">
                {filteredSalesmans.length > 0 ? (
                  filteredSalesmans.map((s) => (
                    <li
                      key={s.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer border-b"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          sales_man_id: s.id,
                        }));
                        setSalesmanSearch(`${s.first_name} ${s.last_name}`);
                        setShowSalesmanDropdown(false);
                      }}
                    >
                      {s.id} — {s.first_name} {s.last_name}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No salesman found</li>
                )}
              </ul>
            )}
          </div>

          {/* Customer (Search by Name or Mobile + Add new) */}
          <div className="relative" ref={customerRef}>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <input
              type="text"
              placeholder="Search by Name or Mobile"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              className="w-full p-2 border rounded-lg"
            />
            {showCustomerDropdown && customerSearch && (
              <ul className="absolute bg-white border rounded w-full max-h-40 overflow-y-auto z-10 shadow-lg">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <li
                      key={c.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer border-b"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, customer_id: c.id }));
                        setCustomerSearch(c.name);
                        setShowCustomerDropdown(false);
                      }}
                    >
                      {c.name} {c.mobile ? `(${c.mobile})` : ""}
                    </li>
                  ))
                ) : (
                  <li
                    className="p-2 bg-green-100 hover:bg-green-200 cursor-pointer border-b"
                    onClick={async () => {
                      try {
                        const { data } = await axios.post(
                          `${API_BASE}/mis/customer`,
                          { name: customerSearch }
                        );

                        setCustomers((prev) => [...prev, data.customer]);
                        setFormData((prev) => ({
                          ...prev,
                          customer_id: data.customer.id,
                        }));
                        setCustomerSearch(data.customer.name);
                        setShowCustomerDropdown(false);
                        Swal.fire(
                          "Success",
                          "Customer created successfully",
                          "success"
                        );
                      } catch {
                        Swal.fire(
                          "Error",
                          "Failed to create customer",
                          "error"
                        );
                      }
                    }}
                  >
                    ➕ Add new customer "{customerSearch}"
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Total Payable */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Payable Amount
            </label>
            <input
              type="number"
              name="total_payable_amount"
              value={formData.total_payable_amount}
              readOnly
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          {/* Advance Payment */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Advance Payment
            </label>
            <input
              type="number"
              name="advance_payment_amount"
              value={formData.advance_payment_amount}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          {/* Due Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">Due Amount</label>
            <input
              type="number"
              name="due_amount"
              value={formData.due_amount}
              readOnly
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Payment Account */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Account
            </label>
            <select
              name="payment_account_id"
              value={formData.payment_account_id}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Account</option>
              <option value={1}>Bank Account</option>
              <option value={2}>Cash Account</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Notes */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
        </form>

        {/* Add Product Section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Add Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedProductId}
              onChange={handleProductChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value={0}>Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addProduct}
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Add
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Unit Price</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    No Product added yet
                  </td>
                </tr>
              ) : (
                formData.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="p-2 border">{item.product_name}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        className="w-full p-1 border rounded"
                        onChange={(e) =>
                          updateProductField(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        required
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={item.unit_price}
                        min={0}
                        className="w-full p-1 border rounded"
                        onChange={(e) =>
                          updateProductField(
                            index,
                            "unit_price",
                            Number(e.target.value)
                          )
                        }
                        required
                      />
                    </td>
                    <td className="p-2 border">{item.total_price}</td>
                    <td className="p-2 border">
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Order Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            Add Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;
