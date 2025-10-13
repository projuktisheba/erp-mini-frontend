import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Loader, Search } from "lucide-react";
import Swal from "sweetalert2";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { useModal } from "../../hooks/useModal";
import { useNavigate } from "react-router";

interface Product {
  id: number;
  product_name: string;
  quantity: number;
  total_price: number;
}

interface Sale {
  memo_no: string;
  sale_date: string;
  salesperson_name: string;
  customer_name: string;
  total_payable_amount: number;
  paid_amount: number;
  due_amount: number;
  notes: string;
  items: Product[];
}

export default function SalesHistory() {
  const context = useContext(AppContext);
  if (!context) throw new Error("Branch Id is not provided");
  const { branchId } = context;

  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loadingRows, setLoadingRows] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch sales list
  const fetchSales = async () => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`products/sales/history`, {
        headers: { "X-Branch-ID": branchId },
        params: { start_date: startDate, end_date: endDate },
      });
      setSales(res.data.report || []);
      setFilteredSales(res.data.report || []);
    } catch (err) {
      console.error("Error fetching sales:", err);
      Swal.fire("Error", "Failed to load sales history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (startDate && endDate) fetchSales();
  }, [startDate, endDate, branchId]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = sales.filter(
      (s) =>
        s.memo_no.toLowerCase().includes(query) ||
        s.customer_name.toLowerCase().includes(query)
    );
    setFilteredSales(filtered);
  }, [searchQuery, sales]);

  // Totals for current filtered list
  const totals = filteredSales.reduce(
    (acc, s) => {
      acc.total += Number(s.total_payable_amount || 0);
      acc.paid += Number(s.paid_amount || 0);
      acc.due += Number(s.due_amount || 0);
      return acc;
    },
    { total: 0, paid: 0, due: 0 }
  );

  // Fetch sale details on Details button click
  const handleViewDetails = async (sale: Sale) => {
    try {
      setLoadingRows((prev) => ({ ...prev, [sale.memo_no]: true }));

      const res = await axiosInstance.get(`/products/sales/details`, {
        headers: { "X-Branch-ID": branchId },
        params: { memo_no: sale.memo_no },
      });

      const soldItems: Product[] = res.data.sold_items || [];
      setSelectedSale({ ...sale, items: soldItems });
      openModal();
    } catch (err) {
      console.error("Error fetching sale details:", err);
      Swal.fire("Error", "Failed to fetch sale details", "error");
    } finally {
      setLoadingRows((prev) => ({ ...prev, [sale.memo_no]: false }));
    }
  };

  const handleEditSale = (sale: Sale) => {
    closeModal()
    // From sales_history page
    sale.sale_date = sale.sale_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    navigate("/sale/edit", { state: { initialData: sale } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sales History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage historical sales records
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <Label>Search (Memo / Customer)</Label>
          <div className="flex items-center gap-2">
            <Search className="text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div
        // ref={printRef}
        className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-start mb-2">
            <strong>Sales History</strong>
          </div>
          <div className="flex justify-end mb-2">
            <button
              // onClick={handlePrintStockTable} // you can rename to handlePrintSalesTable
              className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
            >
              Print Sales
            </button>
          </div>
        </div>

        <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 border-b text-center">Date</th>
              <th className="px-3 py-2 border-b text-center">Memo No</th>
              <th className="px-3 py-2 border-b text-center">Customer</th>
              <th className="px-3 py-2 border-b text-center">Salesperson</th>
              <th className="px-3 py-2 border-b text-center">Total</th>
              <th className="px-3 py-2 border-b text-center">Paid</th>
              <th className="px-3 py-2 border-b text-center">Due</th>
              <th className="px-3 py-2 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-4 text-gray-500 dark:text-gray-400"
                >
                  {searchQuery
                    ? "No sales match your search."
                    : "No sales records found."}
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr
                  key={sale.memo_no}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-3 py-2 border-b text-center">
                    {sale.sale_date.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    {sale.memo_no}
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    {sale.customer_name}
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    {sale.salesperson_name}
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    {sale.total_payable_amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    {sale.paid_amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    {sale.due_amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 border-b text-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(sale)}
                    >
                      {loadingRows[sale.memo_no] ? (
                        <>
                          <Loader className="animate-spin w-4 h-4 mr-2" />
                          Processing...
                        </>
                      ) : (
                        "View Details"
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            {filteredSales.length > 0 && (
              <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                <td colSpan={4} className="px-3 py-2 border-b text-right">
                  Totals:
                </td>
                <td className="px-3 py-2 border-b text-center">
                  {totals.total?.toFixed(2)}
                </td>
                <td className="px-3 py-2 border-b text-center">
                  {totals.paid?.toFixed(2)}
                </td>
                <td className="px-3 py-2 border-b text-center">
                  {totals.due?.toFixed(2)}
                </td>
                <td className="px-3 py-2 border-b text-center">{""}</td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* Details Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        {modalLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : selectedSale ? (
          <div className="relative w-full bg-white rounded-3xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Sale Details — Memo #{selectedSale.memo_no}
              </h4>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Customer:</strong> {selectedSale.customer_name}
                  </p>
                  <p>
                    <strong>Salesperson:</strong>{" "}
                    {selectedSale.salesperson_name}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Date:</strong> {selectedSale.sale_date.slice(0, 10)}
                  </p>
                  <p>
                    <strong>Note:</strong> {selectedSale.notes || "—"}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 border-b text-center">
                          Product
                        </th>
                        <th className="px-3 py-2 border-b text-center">
                          Quantity
                        </th>
                        <th className="px-3 py-2 border-b text-center">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-4 text-gray-500 dark:text-gray-400"
                          >
                            No items found for this sale.
                          </td>
                        </tr>
                      ) : (
                        selectedSale.items.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-3 py-2 border-b text-center">
                              {item.product_name}
                            </td>
                            <td className="px-3 py-2 border-b text-center">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 border-b text-center">
                              {item.total_price.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      {selectedSale.items.length > 0 && (
                        <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                          <td
                            className="px-3 py-2 border-b text-right"
                            colSpan={1}
                          >
                            Total
                          </td>
                          <td className="px-3 py-2 border-b text-center">
                            {selectedSale.items.reduce(
                              (totalQuantity, i) => totalQuantity + i.quantity,
                              0
                            )}
                          </td>
                          <td className="px-3 py-2 border-b text-center">
                            {selectedSale.items
                              .reduce(
                                (totalPrice, i) => totalPrice + i.total_price,
                                0
                              )
                              .toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end text-sm text-gray-700 dark:text-gray-300">
                <div className="space-y-1 text-right">
                  <p>
                    Total Payable:{" "}
                    {selectedSale.total_payable_amount.toFixed(2)}
                  </p>
                  <p>Paid: {selectedSale.paid_amount.toFixed(2)}</p>
                  <p>Due: {selectedSale.due_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleEditSale(selectedSale)}
              >
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <p className="p-6 text-center text-gray-500">
            No sale details available
          </p>
        )}
      </Modal>
    </div>
  );
}
