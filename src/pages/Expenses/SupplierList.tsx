import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { TableHeader, TableRow, TableCell, TableBody, Table } from "../../components/ui/table";

import { useNavigate } from "react-router";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { Search, Edit } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  mobile: string;
  status: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function SupplierList() {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/mis/suppliers", {
        headers: { "X-Branch-ID": branchId },
      });
      setSuppliers(res.data.suppliers || []);
      setFilteredSuppliers(res.data.suppliers || []);
      console.log(res.data.suppliers)
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [branchId]);

  // Filter suppliers
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredSuppliers(
      suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.mobile.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, suppliers]);

  // Handle modal input change
  const handleChange = (field: string, value: string) => {
    if (editingSupplier) {
      setEditingSupplier({ ...editingSupplier, [field]: value });
    }
  };

  // Save edited supplier
  const handleSave = async () => {
    if (!editingSupplier) return;

    setSaving(true);
    try {
      const res = await axiosInstance.put(
        `/mis/supplier`,
        editingSupplier,
        { headers: { "X-Branch-ID": branchId } }
      );

      if (res.data.error == false) {
        // Update local state
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === editingSupplier.id ? { ...editingSupplier } : s
          )
        );
        setFilteredSuppliers((prev) =>
          prev.map((s) =>
            s.id === editingSupplier.id ? { ...editingSupplier } : s
          )
        );
        setEditingSupplier(null);
      } else {
        alert("Failed to update supplier: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating supplier");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading suppliers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Supplier Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage supplier details
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 flex items-center gap-2">
        <Search className="text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search by name or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <TableRow>
                <TableCell className="py-2">ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    {searchQuery
                      ? "No suppliers match your search."
                      : "No suppliers found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" >
                    <TableCell>{supplier.id}</TableCell>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.mobile}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                          statusColors[supplier.status] ||
                          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {supplier.status
                          ? supplier.status.charAt(0).toUpperCase() +
                            supplier.status.slice(1)
                          : "Unknown"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Button
                        className="m-1 border border-blue-600"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSupplier(supplier)}
                      >
                        <Edit className="text-blue-600 w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSupplier && (
        <Modal
          isOpen={!!editingSupplier}
          onClose={() => setEditingSupplier(null)}
          className="max-w-md m-4"
        >
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Edit Supplier
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  type="text"
                  value={editingSupplier.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div>
                <Label>Mobile</Label>
                <Input
                  type="text"
                  value={editingSupplier.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                />
              </div>

              <div>
                <Label>Status</Label>
                <select
                  value={editingSupplier.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingSupplier(null)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
