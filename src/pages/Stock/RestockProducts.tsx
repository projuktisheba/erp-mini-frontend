import React, { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { Loader2, Trash2 } from "lucide-react";
import Alert from "../../components/ui/alert/Alert";

interface ProductItem {
  id: number;
  product_name: string;
  quantity: number;
}

const RestockProducts: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [products, setProducts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [canPrint, setCanPrint] = useState(false); // New state for Print button
  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null); // For highlighting

  const getCurrentDate = () => new Date().toISOString().slice(0, 10);

  const initialFormData = {
    order_date: getCurrentDate(),
    items: [] as ProductItem[],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]); // Refs to rows

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get(`/products`, {
        headers: { "X-Branch-ID": branchId },
      });
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [branchId]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (alert) setAlert(null);
  };

  // Add product
  const addProduct = () => {
    if (!selectedProductId) {
      setAlert({
        variant: "error",
        title: "No product selected",
        message: "Please select a product",
      });
      return;
    }

    const selected = products.find((p) => p.id === selectedProductId);
    if (!selected) {
      setAlert({
        variant: "error",
        title: "Product not found",
        message: "Unknown error! Please try again",
      });
      return;
    }

    // Check if product already exists
    const existingIndex = formData.items.findIndex(
      (item) => item.id === selected.id
    );
    if (existingIndex !== -1) {
      setHighlightedRow(existingIndex); // Highlight existing row
      rowRefs.current[existingIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setTimeout(() => setHighlightedRow(null), 2000); // Remove highlight after 2s
      setSelectedProductId(0);
      if (alert) setAlert(null);
      return;
    }

    const newItem: ProductItem = {
      id: selected.id,
      product_name: selected.product_name,
      quantity: 1,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setSelectedProductId(0);
    if (alert) setAlert(null);
  };

  const removeProduct = (i: number) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items.splice(i, 1);
      return { ...prev, items };
    });
    if (alert) setAlert(null);
  };

  const updateProductField = (
    i: number,
    field: keyof ProductItem,
    value: number
  ) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[i] = { ...items[i], [field]: value };
      return { ...prev, items };
    });
    if (alert) setAlert(null);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (formData.items.length === 0) {
      setAlert({
        variant: "error",
        title: "No product selected",
        message: "Please select at least one product",
      });
      return;
    }
    setIsSubmitting(true);
    setCanPrint(false)
    try {
      const apiData = {
        date: formData.order_date + "T00:00:00Z",
        products: formData.items
      };
      const res = await axiosInstance.post(`/products/restock`, apiData, {
        headers: { "X-Branch-ID": branchId },
      });
      if (!res.data.error) {
        setAlert({
          variant: "success",
          title: "Success",
          message: "Products added to the stock successfully",
        });
        setCanPrint(true); // Enable print button
      }
    } catch (error: any) {
      console.error(error);
      setAlert({
        variant: "error",
        title: "Failed",
        message: error.response?.data?.message || "Something went wrong",
      });
    }
    finally{
      setIsSubmitted(true);
    }
  };

  //reset form 
  const handleResetForm = async () =>{
    setAlert(null);
    setFormData(initialFormData); 
    setIsSubmitting(false);
    setIsSubmitted(false)
    setCanPrint(false);   
  }
  // Function to print memo
  const handlePrint = () => {
    const memoContent = document.getElementById("printable-memo")?.innerHTML;
    if (!memoContent) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Memo</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>${memoContent}</body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full p-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Restock Ready-Made Products
        </h2>

        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label>Restock Date</label>
            <input
              type="date"
              name="order_date"
              value={formData.order_date}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </form>

        {/* Add Product */}
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-gray-500">
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
                        onChange={(e) =>
                          updateProductField(
                            i,
                            "quantity",
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

        {/* Submit and Print Buttons */}
        <div className="mt-6 flex gap-4 justify-end">

          <button
            type="button"
            disabled={!canPrint}
            onClick={handleResetForm}
            className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 justify-center ${
              canPrint
                ? "bg-black-600 hover:bg-green-700"
                : "hidden"
            }`}
          >
            Reset
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || isSubmitted}
            className={
              isSubmitted ? "hidden":  "px-6 py-2 rounded-lg text-white flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700"
            }
          >
            {isSubmitting && !isSubmitted? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                Processing...
              </>
            ) : (
              "Confirm"
            )}
          </button>

          <button
            type="button"
            disabled={!canPrint}
            onClick={handlePrint}
            className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 justify-center ${
              canPrint
                ? "bg-green-600 hover:bg-green-700"
                : "hidden"
            }`}
          >
            Print Memo
          </button>
        </div>

        {/* Hidden printable memo */}
        <div id="printable-memo" className="hidden">
          <h2>Stock Restock Memo</h2>
          <p>Date: {formData.order_date}</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RestockProducts;
