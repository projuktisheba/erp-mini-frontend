import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const API_BASE = "https://api.erp.pssoft.xyz/api/v1";

interface ProductItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const AddOrder: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [salesmans, setSalesmans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    memo_no: "",
    order_date: new Date().toISOString().split("T")[0],
    sales_man_id: "",
    customer_id: "",
    total_payable_amount: 0,
    advance_payment_amount: 0,
    due_amount: 0,
    payment_account_id: "",
    status: "",
    notes: "",
    items: [] as ProductItem[],
  });

  const [productForm, setProductForm] = useState({
    product_id: "",
    product_name: "",
  });

  // search states
  const [salesmanSearch, setSalesmanSearch] = useState("");
  const [filteredSalesmans, setFilteredSalesmans] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);

  const navigate = useNavigate();

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
    setFormData((prev) => ({
      ...prev,
      [name]: name === "advance_payment_amount" ? Number(value) : value,
    }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    if (!productForm.product_name) {
      Swal.fire("Error", "Please select a product", "error");
      return;
    }
    const newItem: ProductItem = {
      product_id: productForm.product_id,
      product_name: productForm.product_name,
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setProductForm({ product_id: "", product_name: "" });
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
      "memo_no",
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
      const response = await axios.post(`${API_BASE}/orders`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200 || response.status === 201) {
        Swal.fire("Success", "Order created successfully", "success");
        navigate("/orders");
      }
    } catch (error: any) {
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

  // filter logic
  useEffect(() => {
    setFilteredSalesmans(
      salesmans.filter((s) =>
        `${s.first_name} ${s.last_name}`
          .toLowerCase()
          .includes(salesmanSearch.toLowerCase())
      )
    );
  }, [salesmanSearch, salesmans]);

  useEffect(() => {
    setFilteredCustomers(
      customers.filter((c) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase())
      )
    );
  }, [customerSearch, customers]);

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full p-6">
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
              required
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
              value={formData.order_date}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Salesman (Search) */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Salesman</label>
            <input
              type="text"
              placeholder="Search Salesman"
              value={salesmanSearch}
              onChange={(e) => setSalesmanSearch(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            {salesmanSearch && (
              <ul className="absolute bg-white border rounded w-full max-h-40 overflow-y-auto z-10">
                {filteredSalesmans.length > 0 ? (
                  filteredSalesmans.map((s) => (
                    <li
                      key={s.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          sales_man_id: s.id,
                        }));
                        setSalesmanSearch(`${s.first_name} ${s.last_name}`);
                      }}
                    >
                      {s.first_name} {s.last_name}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No salesman found</li>
                )}
              </ul>
            )}
          </div>

          {/* Customer (Search + Add new) */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Customer</label>
            <input
              type="text"
              placeholder="Search Customer"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            {customerSearch && (
              <ul className="absolute bg-white border rounded w-full max-h-40 overflow-y-auto z-10">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <li
                      key={c.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, customer_id: c.id }));
                        setCustomerSearch(c.name);
                      }}
                    >
                      {c.name}
                    </li>
                  ))
                ) : (
                  <li
                    className="p-2 bg-green-100 hover:bg-green-200 cursor-pointer"
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
              <option value="1">Bank Account</option>
              <option value="2">Cash Account</option>
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
              name="product_name"
              value={productForm.product_name}
              onChange={handleProductChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.product_id} value={product.product_id}>
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
