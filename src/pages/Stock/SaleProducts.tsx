import React, { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { Loader2, Trash2 } from "lucide-react";
import { printHTML } from "../../utils/printHtml";
import Alert from "../../components/ui/alert/Alert";

interface ProductItem {
  product_id: number;
  product_name: string;
  quantity: number;
  current_stock_level: number;
  total_price: number;
}

const SaleProducts: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [products, setProducts] = useState<any[]>([]);
  const [salespersons, setSalespersons] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Add a per-row warning state
  const [rowWarnings, setRowWarnings] = useState<Record<number, string>>({});

  const [formData, setFormData] = useState({
    sale_date: new Date().toISOString().slice(0, 10),
    salesperson_id: 0,
    customer_id: 0,
    total_payable_amount: 0,
    paid_amount: 0,
    due_amount: 0,
    payment_account_id: 0,
    notes: "",
    items: [] as ProductItem[],
  });

  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [printEnabled, setPrintEnabled] = useState(false);

  const [salespersonSearch, setSalespersonSearch] = useState("");
  const [filteredSalespersons, setFilteredSalespersons] = useState<any[]>([]);
  const [showSalespersonDropdown, setShowSalespersonDropdown] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const salespersonRef = useRef<HTMLDivElement>(null);
  const customerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, salesRes, custRes, accRes] = await Promise.all([
          axiosInstance.get("/products", {
            headers: { "X-Branch-ID": branchId },
          }),
          axiosInstance.get("/hr/employees/names?role=salesperson", {
            headers: { "X-Branch-ID": branchId },
          }),
          axiosInstance.get("/mis/customers/names", {
            headers: { "X-Branch-ID": branchId },
          }),
          axiosInstance.get("/accounts/names", {
            headers: { "X-Branch-ID": branchId },
          }),
        ]);
        setProducts(prodRes.data.products || []);
        setSalespersons(salesRes.data.employees || []);
        setCustomers(custRes.data.customers || []);
        setAccounts(accRes.data.accounts || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, [branchId]);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        salespersonRef.current &&
        !salespersonRef.current.contains(e.target as Node)
      )
        setShowSalespersonDropdown(false);
      if (
        customerRef.current &&
        !customerRef.current.contains(e.target as Node)
      )
        setShowCustomerDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter salespersons/customers
  useEffect(() => {
    setFilteredSalespersons(
      salespersons.filter(
        (s) =>
          s.name.toLowerCase().includes(salespersonSearch.toLowerCase()) ||
          s.id.toString().includes(salespersonSearch)
      )
    );
    if (alert) setAlert(null);
  }, [salespersonSearch, salespersons]);

  useEffect(() => {
    setFilteredCustomers(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          (c.mobile && c.mobile.includes(customerSearch))
      )
    );
    if (alert) setAlert(null);
  }, [customerSearch, customers]);

  // Handle change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["paid_amount", "payment_account_id"].includes(name)
        ? Number(value)
        : value,
    }));
    if (alert) setAlert(null);
  };

  // Add/Remove/Update product
  const addProduct = () => {
    if (!selectedProductId)
      return setAlert({
        variant: "error",
        title: "No product selected",
        message: "Select a product",
      });
    const selected = products.find((p) => p.id === selectedProductId);
    if (!selected)
      return setAlert({
        variant: "error",
        title: "Invalid product",
        message: "Unknown product",
      });

    // Check if product already exists
    const existingIndex = formData.items.findIndex(
      (item) => item.product_id === selected.id
    );
    if (existingIndex !== -1) {
      setHighlightedRow(existingIndex);
      rowRefs.current[existingIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setTimeout(() => setHighlightedRow(null), 2000);
      setSelectedProductId(0);
      if (alert) setAlert(null);
      return;
    }
    // Quantity restriction
    if (selected.current_stock_level <= 0) {
      setAlert({
        variant: "error",
        title: "Out of stock",
        message: `Product "${selected.product_name}" is out of stock`,
      });
      return;
    }
    const newItem: ProductItem = {
      product_id: selected.id,
      product_name: selected.product_name,
      quantity: 1,
      current_stock_level: Number(selected.current_stock_level || 0),
      total_price: 0,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setSelectedProductId(0);
    if (alert) setAlert(null)
  };

  const removeProduct = (i: number) =>
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i),
    }));

  const updateProductField = (
    i: number,
    field: keyof ProductItem,
    value: number
  ) =>
    setFormData((prev) => {
      const items = [...prev.items];
      items[i] = { ...items[i], [field]: value };
      return { ...prev, items };
    });

  // Recompute total_payable_amount when items change (sum of total_price fields)
  useEffect(() => {
    const total = formData.items.reduce(
      (sum, it) => sum + (Number(it.total_price) || 0),
      0
    );
    setFormData((prev) => ({ ...prev, total_payable_amount: total }));
  }, [formData.items]);

  //calculating amounts
  useEffect(() => {
    const total = formData.total_payable_amount || 0;
    let paid = formData.paid_amount || 0;
    const due = Math.max(total - paid, 0); // prevents negative value
    paid = total - due;
    setFormData((prev) => ({ ...prev, paid_amount: paid, due_amount: due }));
  }, [formData.total_payable_amount, formData.paid_amount]);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.salesperson_id) {
      return setAlert({
        variant: "error",
        title: "",
        message: "Salesperson required",
      });
    }
    if (!formData.customer_id) {
      return setAlert({
        variant: "error",
        title: "",
        message: "Customer required",
      });
    }
    if (!formData.payment_account_id) {
      return setAlert({
        variant: "error",
        title: "",
        message: "Payment required",
      });
    }
    if (formData.items.length === 0)
      return setAlert({
        variant: "error",
        title: "No products",
        message: "Add at least one product",
      });

    setIsSubmitting(true);
    try {
      const apiData = {
        ...formData,
        sale_date: formData.sale_date + "T00:00:00Z",
        items: formData.items.map((i) => ({
          id: i.product_id,
          quantity: i.quantity,
          total_price: i.total_price,
        })),
      };

      const res = await axiosInstance.post(`/products/sale`, apiData, {
        headers: { "X-Branch-ID": branchId },
      });
      if (!res.data.error) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Sale Completed successfully",
        });
        setPrintEnabled(true);
      }
    } catch (err: any) {
      setAlert({
        variant: "error",
        title: "Failed",
        message: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const html = `
      <h1>Sale Memo</h1>
      <p>Date: ${formData.sale_date}</p>
      <table border="1" cellspacing="0" cellpadding="5">
        <thead><tr><th>Product</th><th>Quantity</th><th>Total</th></tr></thead>
        <tbody>
          ${formData.items
            .map(
              (i) =>
                `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>${i.total_price}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p>Total Payable: ${formData.total_payable_amount}</p>
    `;
    printHTML(html);
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full p-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Sale Ready-Made Products
        </h2>
        <div className="mb-3">
          {alert && (
            <Alert
              variant={alert.variant}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <label>Sale Date</label>
            <input
              type="date"
              name="sale_date"
              value={formData.sale_date}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Salesperson search */}
          <div className="relative" ref={salespersonRef}>
            <label>Salesperson</label>
            <input
              type="text"
              placeholder="Search by ID or Name"
              value={salespersonSearch}
              onChange={(e) => {
                setSalespersonSearch(e.target.value);
                setShowSalespersonDropdown(true);
              }}
              className="w-full p-2 border rounded-lg"
            />
            {showSalespersonDropdown && (
              <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
                {filteredSalespersons.length > 0 ? (
                  filteredSalespersons.map((s) => (
                    <li
                      key={s.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          salesperson_id: s.id,
                        }));
                        setSalespersonSearch(s.name);
                        setShowSalespersonDropdown(false);
                      }}
                    >
                      {s.id} — {s.name}
                    </li>
                  ))
                ) : (
                  <li className="p-2 bg-gray-100 rounded">
                    No salesperson found
                  </li>
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
                  <li className="p-2 bg-gray-100 rounded">No customer found</li>
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
            <label>Paid Payment</label>
            <input
              type="number"
              name="paid_amount"
              value={formData.paid_amount}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label>Due Amount</label>
            <input
              type="number"
              min={0}
              value={formData.due_amount}
              readOnly
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Payment Account Field */}
          <div>
            <label>Payment Account</label>
            <select
              name="payment_account_id"
              value={formData.payment_account_id}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Account</option>
              {accounts.length > 0 ? (
                accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))
              ) : (
                <option disabled>Loading accounts...</option>
              )}
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-2 lg:col-span-2">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={1}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </form>

        {/* Add Product */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Add Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Product</th>
                  <th className="p-2 border">Quantity</th>
                  <th className="p-2 border">Total Price</th>
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
                    <tr
                      key={i}
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }} // <-- just assign, don't return
                      className={
                        highlightedRow === i
                          ? "bg-yellow-50 transition-colors"
                          : ""
                      }
                    >
                      <td className="border p-2">{item.product_name}</td>

                      <td className="border p-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          className="w-full p-1 border rounded"
                          onChange={(e) => {
                            const val = Number(e.target.value);

                            if (val <= 0) {
                              // Don't update, show warning
                              setRowWarnings((prev) => ({
                                ...prev,
                                [i]: "Quantity must be at least 1",
                              }));
                              return;
                            }

                            if (val > item.current_stock_level) {
                              // Cap to max available
                              updateProductField(
                                i,
                                "quantity",
                                item.current_stock_level
                              );
                              setRowWarnings((prev) => ({
                                ...prev,
                                [i]: `Max available quantity is ${item.current_stock_level}`,
                              }));
                            } else {
                              // Valid input
                              updateProductField(i, "quantity", val);
                              setRowWarnings((prev) => ({ ...prev, [i]: "" }));
                            }
                          }}
                        />
                        {rowWarnings[i] && (
                          <p className="text-red-500 text-xs mt-1">
                            {rowWarnings[i]}
                          </p>
                        )}
                      </td>

                      <td className="border p-2">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.total_price}
                          className="w-full p-1 border rounded"
                          onChange={(e) =>
                            updateProductField(
                              i,
                              "total_price",
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="border p-2">
                        <button
                          type="button"
                          onClick={() => removeProduct(i)}
                          className="flex items-center justify-center gap-1 px-2 py-1 bg-black text-white rounded hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit and Print */}
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || printEnabled}
            className={
              printEnabled
                ? "hidden"
                : "px-6 py-2 rounded-lg text-white flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                Processing...
              </>
            ) : (
              "Confirm Sale"
            )}
          </button>

          {printEnabled && (
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              Print Memo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleProducts;
