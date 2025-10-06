import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { AppContext } from "../../context/AppContext";

const API_BASE = "https://api.erp.pssoft.xyz/api/v1";

interface ProductItem {
  product_id: number;
  product_name: string;
  quantity: number;
  total_price: number;
}

const AddOrder: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [products, setProducts] = useState<any[]>([]);
  const [salesmans, setSalesmans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const navigate = useNavigate();

  // current date helper
  const getCurrentDate = () => new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    order_date: getCurrentDate(),
    delivery_date: getCurrentDate(),
    salesperson_id: 0,
    customer_id: 0,
    total_payable_amount: 0,
    advance_payment_amount: 0,
    due_amount: 0,
    payment_account_id: 0,
    notes: "",
    items: [] as ProductItem[],
  });

  const [selectedProductId, setSelectedProductId] = useState<number>(0);

  const [salesmanSearch, setSalesmanSearch] = useState("");
  const [filteredSalesmans, setFilteredSalesmans] = useState<any[]>([]);
  const [showSalesmanDropdown, setShowSalesmanDropdown] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const salesmanRef = useRef<HTMLDivElement>(null);
  const customerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (salesmanRef.current && !salesmanRef.current.contains(e.target as Node))
        setShowSalesmanDropdown(false);
      if (customerRef.current && !customerRef.current.contains(e.target as Node))
        setShowCustomerDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate due amount dynamically
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      due_amount: prev.total_payable_amount - prev.advance_payment_amount,
    }));
  }, [formData.total_payable_amount, formData.advance_payment_amount]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "order_date" || name === "delivery_date") {
        return { ...prev, [name]: value };
      }
      if (["advance_payment_amount", "payment_account_id"].includes(name)) {
        return { ...prev, [name]: Number(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  // Product add/remove/update handlers
  const addProduct = () => {
    if (!selectedProductId) {
      Swal.fire("Error", "Please select a product", "error");
      return;
    }
    const selected = products.find((p) => p.id === selectedProductId);
    if (!selected) {
      Swal.fire("Error", "Invalid product", "error");
      return;
    }
    const newItem: ProductItem = {
      product_id: selected.id,
      product_name: selected.product_name,
      quantity: 1,
      total_price: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setSelectedProductId(0);
  };

  const removeProduct = (i: number) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items.splice(i, 1);
      const total = items.reduce((sum, item) => sum + item.total_price, 0);
      return { ...prev, items, total_payable_amount: total };
    });
  };

  const updateProductField = (i: number, field: keyof ProductItem, value: number) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[i] = { ...items[i], [field]: value };
      const total = items.reduce((sum, item) => sum + item.total_price, 0);
      return { ...prev, items, total_payable_amount: total };
    });
  };

  // Fetch data
  const fetchProducts = async () => {
    const { data } = await axios.get(`${API_BASE}/products`, {
      headers: { "X-Branch-ID": branchId },
    });
    setProducts(data.products || []);
  };

  const fetchSalesmans = async () => {
    const { data } = await axios.get(`${API_BASE}/hr/employees/names`, {
      headers: { "X-Branch-ID": branchId },
    });
    setSalesmans(data.employees || []);
  };

  const fetchCustomers = async () => {
    const { data } = await axios.get(`${API_BASE}/mis/customers/names`, {
      headers: { "X-Branch-ID": branchId },
    });
    setCustomers(data.customers || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchSalesmans();
    fetchCustomers();
  }, []);

  // Filter dropdown lists
  useEffect(() => {
    setFilteredSalesmans(
      salesmans.filter(
        (s) =>
          s.id.toString().includes(salesmanSearch.toLowerCase()) ||
          s.name.toLowerCase().includes(salesmanSearch.toLowerCase())
      )
    );
  }, [salesmanSearch, salesmans]);

  useEffect(() => {
    setFilteredCustomers(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.mobile?.toString().includes(customerSearch.toLowerCase())
      )
    );
  }, [customerSearch, customers]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.salesperson_id || !formData.customer_id) {
      Swal.fire("Error", "Please select salesman and customer", "error");
      return;
    }

    if (formData.items.length === 0) {
      Swal.fire("Error", "Please add at least one product", "error");
      return;
    }

    try {
      const apiData = {
        ...formData,
        order_date: formData.order_date + "T00:00:00Z",
        delivery_date: formData.delivery_date + "T00:00:00Z",
        items: formData.items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          total_price: i.total_price,
        })),
      };

      const res = await axios.post(`${API_BASE}/orders`, apiData, {
        headers: {
          "Content-Type": "application/json",
          "X-Branch-ID": branchId,
        },
      });

      if (!res.data.error) {
        Swal.fire("Success", "Order created successfully", "success");
        navigate("/orders");
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

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full p-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          New Order
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <label>Order Date</label>
            <input
              type="date"
              name="order_date"
              value={formData.order_date}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label>Delivery Date</label>
            <input
              type="date"
              name="delivery_date"
              value={formData.delivery_date}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Salesman search */}
          <div className="relative" ref={salesmanRef}>
            <label>Salesman</label>
            <input
              type="text"
              placeholder="Search by ID or Name"
              value={salesmanSearch}
              onChange={(e) => {
                setSalesmanSearch(e.target.value);
                setShowSalesmanDropdown(true);
              }}
              className="w-full p-2 border rounded-lg"
            />
            {showSalesmanDropdown && (
              <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
                {filteredSalesmans.length > 0 ? (
                  filteredSalesmans.map((s) => (
                    <li
                      key={s.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, salesperson_id: s.id }));
                        setSalesmanSearch(s.name);
                        setShowSalesmanDropdown(false);
                      }}
                    >
                      {s.id} — {s.name}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No salesman found</li>
                )}
              </ul>
            )}
          </div>

          {/* Customer search */}
          <div className="relative" ref={customerRef}>
            <label>Customer</label>
            <input
              type="text"
              placeholder="Search by Name or Mobile"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              className="w-full p-2 border rounded-lg"
            />
            {showCustomerDropdown && (
              <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <li
                      key={c.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
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
                    className="p-2 bg-green-100 hover:bg-green-200 cursor-pointer"
                    onClick={async () => {
                      try {
                        const { data } = await axios.post(
                          `${API_BASE}/mis/customer`,
                          { name: customerSearch },
                          { headers: { "X-Branch-ID": branchId } }
                        );
                        setCustomers((prev) => [...prev, data.customer]);
                        setFormData((prev) => ({
                          ...prev,
                          customer_id: data.customer.id,
                        }));
                        setCustomerSearch(data.customer.name);
                        setShowCustomerDropdown(false);
                        Swal.fire("Success", "Customer added", "success");
                      } catch {
                        Swal.fire("Error", "Failed to create customer", "error");
                      }
                    }}
                  >
                    ➕ Add new customer "{customerSearch}"
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Amounts */}
          <div>
            <label>Total Payable</label>
            <input
              type="number"
              value={formData.total_payable_amount}
              readOnly
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label>Advance Payment</label>
            <input
              type="number"
              name="advance_payment_amount"
              value={formData.advance_payment_amount}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label>Due Amount</label>
            <input
              type="number"
              value={formData.due_amount}
              readOnly
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label>Payment Account</label>
            <select
              name="payment_account_id"
              value={formData.payment_account_id}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Account</option>
              <option value={1}>Bank Account</option>
              <option value={2}>Cash Account</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </form>

        {/* Add Product Section */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Add Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="w-full p-2 border rounded-lg"
            >
              <option value={0}>Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addProduct}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Add
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    No Product added
                  </td>
                </tr>
              ) : (
                formData.items.map((item, i) => (
                  <tr key={i}>
                    <td className="border p-2">{item.product_name}</td>
                    <td className="border p-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        className="w-full p-1 border rounded"
                        onChange={(e) =>
                          updateProductField(i, "quantity", Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        min={0}
                        value={item.total_price}
                        className="w-full p-1 border rounded"
                        onChange={(e) =>
                          updateProductField(i, "total_price", Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="border p-2 text-red-500 cursor-pointer">
                      <button onClick={() => removeProduct(i)}>Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Add Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;
