import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import {
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  Table,
} from "../../components/ui/table";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { Search, Edit } from "lucide-react";

interface Customer {
  id?: number;
  name: string;
  mobile: string;
  address: string;
  tax_id: string;
  due_amount: number;
  length: string;
  shoulder: string;
  bust: string;
  waist: string;
  hip: string;
  arm_hole: string;
  sleeve_length: string;
  sleeve_width: string;
  round_width: string;
}

// const statusColors: Record<string, string> = {
//   active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
//   inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
// };

export default function CustomerList() {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/mis/customers", {
        headers: { "X-Branch-ID": branchId },
      });
      setCustomers(res.data.customers || []);
      setFilteredCustomers(res.data.customers || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [branchId]);

  // Filter customers
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredCustomers(
      customers.filter(
        (s) => s.name.toLowerCase().includes(q) || s.mobile.includes(q)
      )
    );
  }, [searchQuery, customers]);

  // Handle modal input change
  const handleChange = (field: string, value: string) => {
    if (editingCustomer) {
      setEditingCustomer({ ...editingCustomer, [field]: value });
    }
  };

  // Save edited customer
  const handleSave = async () => {
    if (!editingCustomer) return;

    setSaving(true);
    try {
      const res = await axiosInstance.put(`/mis/customer`, editingCustomer, {
        headers: { "X-Branch-ID": branchId },
      });
      if (res.data.error == false) {
        // Update local state
        setCustomers((prev) =>
          prev.map((s) =>
            s.id === editingCustomer.id ? { ...editingCustomer } : s
          )
        );
        setFilteredCustomers((prev) =>
          prev.map((s) =>
            s.id === editingCustomer.id ? { ...editingCustomer } : s
          )
        );
        setEditingCustomer(null);
      } else {
        alert("Failed to update customer: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating customer");
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
            Loading customers...
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
            Customer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer details
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
                <TableCell>Due Amount</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    {searchQuery
                      ? "No customers match your search."
                      : "No customers found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>{customer.due_amount}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>
                      <Button
                        className="m-1 border border-blue-600"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCustomer(customer)}
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
      {editingCustomer && (
        <Modal
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          className="max-w-xl m-4"
        >
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Edit Customer
            </h3>

            <div className="flex flex-col gap-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mobile</Label>
                  <Input
                    type="text"
                    value={editingCustomer.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    type="text"
                    value={editingCustomer.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tax ID</Label>
                  <Input
                    type="text"
                    value={editingCustomer.tax_id || ""}
                    onChange={(e) => handleChange("tax_id", e.target.value)}
                  />
                </div>
              </div>

              {/* Measurements */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Measurements (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    "length",
                    "shoulder",
                    "bust",
                    "waist",
                    "hip",
                    "arm_hole",
                    "sleeve_length",
                    "sleeve_width",
                    "round_width",
                  ].map((field) => (
                    <div key={field}>
                      <Label className="capitalize">
                        {field.replace("_", " ")}
                      </Label>
                      <Input
                        type="number"
                        value={(editingCustomer as any)[field] ?? ""}
                        onChange={(e) =>
                          handleChange(field, e.target.value || "0")
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingCustomer(null)}
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
