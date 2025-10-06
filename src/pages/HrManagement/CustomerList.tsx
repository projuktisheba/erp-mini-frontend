import { useState, useEffect, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { AppContext } from "../../context/AppContext";

interface Measurement {
  length?: number;
  shoulder?: number;
  bust?: number;
  waist?: number;
  hip?: number;
  arm_hole?: number;
  sleeve_length?: number;
  sleeve_width?: number;
  round_width?: number;
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  tax_id?: string;
  due_amount?: number;
  measurement?: Measurement;
}

export default function CustomerList() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext not provided");
  }
  const { branchId } = context;

  const [tableData, setTableData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("mis/customers", {
        headers: {
          "X-Branch-ID": branchId,
        },
      });
      setTableData(res.data.customers || []);
    } catch (err) {
      console.log("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers by name or mobile
  const filteredData = tableData.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading Customers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Customers
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all customers and their measurements
        </p>
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search by name or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <TableRow>
                <TableCell className="font-semibold text-gray-900 dark:text-white p-2">
                  ID
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Name
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Mobile
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Address
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Tax ID
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Due Amount
                </TableCell>
                {/* <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Status
                </TableCell> */}
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Measurements
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Profile
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? "No customers match your search."
                        : "No customers found."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <TableCell className="px-5 py-4">{customer.id}</TableCell>
                    <TableCell className="px-5 py-4">{customer.name}</TableCell>
                    <TableCell className="px-5 py-4">
                      {customer.mobile}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {customer.address}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {customer.tax_id || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {customer.due_amount ?? 0}
                    </TableCell>
                    {/* <TableCell className="px-5 py-4">
                      {customer.status || "N/A"}
                    </TableCell> */}
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {customer.measurement ? (
                        <div className="space-y-1">
                          {customer.measurement.length && (
                            <p>Length: {customer.measurement.length}</p>
                          )}
                          {customer.measurement.shoulder && (
                            <p>Shoulder: {customer.measurement.shoulder}</p>
                          )}
                          {customer.measurement.bust && (
                            <p>Bust: {customer.measurement.bust}</p>
                          )}
                          {customer.measurement.waist && (
                            <p>Waist: {customer.measurement.waist}</p>
                          )}
                          {customer.measurement.hip && (
                            <p>Hip: {customer.measurement.hip}</p>
                          )}
                          {customer.measurement.arm_hole && (
                            <p>Arm Hole: {customer.measurement.arm_hole}</p>
                          )}
                          {customer.measurement.sleeve_length && (
                            <p>
                              Sleeve Length:{" "}
                              {customer.measurement.sleeve_length}
                            </p>
                          )}
                          {customer.measurement.sleeve_width && (
                            <p>
                              Sleeve Width: {customer.measurement.sleeve_width}
                            </p>
                          )}
                          {customer.measurement.round_width && (
                            <p>
                              Round Width: {customer.measurement.round_width}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No measurements</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Button
                        onClick={() => navigate(`/customer/${customer.id}`)}
                        size="sm"
                        variant="outline"
                      >
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
