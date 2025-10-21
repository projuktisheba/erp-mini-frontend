import React, { useState, useEffect, useContext, useRef } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { AppContext } from "../../context/AppContext";
import { printHTML } from "../../utils/printHtml";
import { Modal } from "../../components/ui/modal";

interface PurchaseReportItem {
  id: number;
  memo_no: string;
  purchase_date: string;
  supplier_name: string;
  supplier_id?: number;
  branch_name: string;
  branch_id?: number;
  total_amount: number;
  notes: string;
}

const branchList = [
  { id: 1, name: "AL FANAR ABAYAT" },
  { id: 2, name: "DIVA ABAYAT" },
  { id: 3, name: "EID AL ABAYAT" },
];

const PurchaseReport: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId, userRole } = context;

  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<PurchaseReportItem[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<
    PurchaseReportItem[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [searchSupplier, setSearchSupplier] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editData, setEditData] = useState<{
    id: number;
    memo_no: string;
    purchase_date: string; // YYYY-MM-DD
    supplier_name: string;
    supplier_id?: number;
    total_amount: number;
    notes: string;
  } | null>(null);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const updateDates = (type: "daily" | "weekly" | "monthly") => {
    const today = new Date();
    let start: Date;

    if (type === "daily") start = today;
    else if (type === "weekly") {
      start = new Date(today);
      start.setDate(today.getDate() - 6);
    } else {
      start = new Date(today);
      start.setMonth(today.getMonth() - 1);
    }

    setStartDate(formatDate(start));
    setEndDate(formatDate(today));
  };

  const fetchReports = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/purchase/list`, {
        headers: { "X-Branch-ID": branchId },
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: reportType,
        },
      });
      setData(res.data.report || []);
      setFilteredPurchases(res.data.report || []);
    } catch (err) {
      console.error("Failed to fetch purchase reports:", err);
      setData([]);
      setFilteredPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateDates(reportType);
  }, [reportType]);

  useEffect(() => {
    if (startDate && endDate) fetchReports();
  }, [branchId, startDate, endDate, reportType]);

  // --- Search handlers ---
  const handleSupplierInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setSearchSupplier(value);

    if (value === "") {
      setFilteredPurchases(data);
      setShowDropdown(false);
      return;
    }

    const filtered = data.filter(
      (p) =>
        p.supplier_name.toLowerCase().includes(value.toLowerCase()) ||
        p.memo_no.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPurchases(filtered);
    setShowDropdown(true);
  };

  const handleSupplierSelect = (purchase: PurchaseReportItem) => {
    setSearchSupplier(purchase.supplier_name);
    const allMatching = data.filter(
      (p) => p.supplier_name === purchase.supplier_name
    );
    setFilteredPurchases(allMatching);
    setShowDropdown(false);
  };

  // Open edit modal with current values
  const openEdit = (purchase: PurchaseReportItem) => {
    setEditData({
      id: purchase.id,
      memo_no: purchase.memo_no,
      purchase_date: purchase.purchase_date.slice(0, 10),
      supplier_name: purchase.supplier_name,
      supplier_id: purchase.supplier_id,
      total_amount: Number(purchase.total_amount) || 0,
      notes: purchase.notes || "",
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditData(null);
    setEditSaving(false);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editData) return;
    const { name, value } = e.target;
    if (name === "total_amount") {
      setEditData({ ...editData, total_amount: Number(value) || 0 });
    } else {
      setEditData({ ...editData, [name]: value } as any);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    setEditSaving(true);
    try {
      const payload = {
        id: editData.id,
        memo_no: editData.memo_no,
        // backend expects time.Time; send RFC3339 date start-of-day
        purchase_date: `${editData.purchase_date}T00:00:00Z`,
        supplier_id: editData.supplier_id,
        supplier_name: editData.supplier_name,
        branch_id: branchId,
        total_amount: editData.total_amount,
        notes: editData.notes,
      };
      await axiosInstance.patch(`/purchase`, payload, {
        headers: { "X-Branch-ID": branchId },
      });
      // Refresh list via fetch to ensure consistency with backend
      await fetchReports();
      closeEdit();
    } catch (err) {
      console.error("Failed to update purchase", err);
      alert("Failed to update purchase. Please try again.");
      setEditSaving(false);
    }
  };

  // --- Print handler ---
  const handlePrint = () => {
    if (filteredPurchases.length === 0) {
      alert("No report data to print!");
      return;
    }

    const rows = filteredPurchases
      .map(
        (item) => `
      <tr>
        <td>${item.purchase_date.slice(0, 10)}</td>
        <td>${item.memo_no}</td>
        <td>${item.supplier_name}</td>
        <td>${item.total_amount}</td>
        <td>${item.notes}</td>
      </tr>`
      )
      .join("");

    const totalAmount = filteredPurchases.reduce(
      (sum, item) => sum + item.total_amount,
      0
    );

    const totalsRow = `
      <tr style="font-weight:bold; background:#f3f3f3;">
        <td colspan="3" style="text-align:right">Total</td>
        <td>${totalAmount}</td>
        <td></td>
      </tr>
    `;

    const html = `
      <html>
        <head>
          <title>Purchase Report - ${reportType.toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; }
            .header .meta { margin-top: 5px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #f3f3f3; text-transform: uppercase; }
            tfoot tr { font-weight: bold; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Purchase Report</h1>
            <div class="meta">
              <strong>Branch:</strong> ${
                branchList[branchId-1]?.name || "N/A"
              }<br/>
              <strong>Date Range:</strong> ${startDate} to ${endDate}<br/>
              <strong>Report Type:</strong> ${
                reportType.charAt(0).toUpperCase() + reportType.slice(1)
              }
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Memo No</th>
                <th>Supplier</th>
                <th>Total Amount</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>${totalsRow}</tfoot>
          </table>
        </body>
      </html>
    `;
    printHTML(html)
  };

  const totalAmount = filteredPurchases.reduce(
    (sum, item) => sum + item.total_amount,
    0
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Purchase Reports
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-end print:hidden">
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700 dark:text-gray-200">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={fetchReports}
          className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
        >
          Fetch Report
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 text-sm font-medium text-green-800 border border-green-400 rounded-lg hover:bg-green-100 hover:text-green-800 transition-all duration-200 shadow-sm"
        >
          Print Report
        </button>
      </div>

      {/* Supplier / Memo Search */}
      <div className="mb-4 relative" ref={searchRef}>
        <input
          type="text"
          placeholder="Search supplier or memo..."
          value={searchSupplier}
          onChange={handleSupplierInputChange}
          onFocus={() => setShowDropdown(true)}
          className="px-3 py-2 border rounded-lg w-64 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {showDropdown && (
          <ul className="absolute z-10 bg-white border rounded-lg shadow-md mt-1 w-64 max-h-48 overflow-y-auto">
            {filteredPurchases.map((p) => (
              <li
                key={p.id}
                onClick={() => handleSupplierSelect(p)}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {p.supplier_name} - {p.memo_no}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Loading purchase reports...
        </div>
      ) : (
        <div
          ref={printRef}
          className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                  Date
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                  Memo No
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                  Supplier
                </th>
                <th className="px-3 py-2 border-b text-right">Total Amount</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                  Notes
                </th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No purchase found.
                  </td>
                </tr>
              ) : (
                <>
                  {filteredPurchases.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                        {item.purchase_date.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                        {item.memo_no}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                        {item.supplier_name}
                      </td>
                      <td className="px-3 py-2 border-b text-right">
                        {item.total_amount}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                        {item.notes}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                        {
                          userRole=="chairman"?
                          (<button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="px-3 py-1 text-xs font-medium border rounded-lg hover:bg-gray-100"
                        >
                          Edit
                        </button>):""
                        }
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                    <td className="px-3 py-2 border-b text-right" colSpan={3}>
                      Totals:
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      {totalAmount}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center"></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editData && (
        <Modal isOpen={isEditOpen} onClose={closeEdit} className="max-w-[640px] m-4">
          <div className="relative w-full bg-white rounded-3xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Edit Purchase — {editData.memo_no}
              </h4>
            </div>
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Memo No</label>
                  <input
                    name="memo_no"
                    type="text"
                    value={editData.memo_no}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    name="purchase_date"
                    type="date"
                    value={editData.purchase_date}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier</label>
                  <input
                    name="supplier_name"
                    type="text"
                    value={editData.supplier_name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Amount</label>
                  <input
                    name="total_amount"
                    type="number"
                    step="0.01"
                    value={editData.total_amount}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-right"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={editData.notes}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEdit} className="px-4 py-2 text-sm font-medium border rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Edit Modal markup below main component

// Inject edit modal after the component return JSX

export default PurchaseReport;
