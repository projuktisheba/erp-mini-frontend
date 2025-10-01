import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { Search, Filter, Eye, Calendar, User } from "lucide-react";

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: number;
  memo_no: string;
  order_date: string;
  sales_man_id: number;
  customer_id: number;
  total_payable_amount: number;
  advance_payment_amount: number;
  due_amount: number;
  payment_account_id: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

type OrderStatus = "pending" | "completed" | "cancelled" | "processing";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/orders/list");
      setOrders(res.data.orders);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.memo_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.customer_id.toString().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      processing:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };
    return (
      colors[status as OrderStatus] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Orders Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and track all customer orders
        </p>
      </div>

      {/* Summary Stats */}
      {filteredOrders.length > 0 && (
        <div className="my-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total Orders
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {filteredOrders.length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400">
              Total Value
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-300">
              {formatCurrency(
                filteredOrders.reduce(
                  (sum, order) => sum + order.total_payable_amount,
                  0
                )
              )}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="text-sm text-yellow-600 dark:text-yellow-400">
              Pending
            </div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
              {
                filteredOrders.filter((order) => order.status === "pending")
                  .length
              }
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400">
              Due Amount
            </div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-300">
              {formatCurrency(
                filteredOrders.reduce((sum, order) => sum + order.due_amount, 0)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by memo no, order ID, or customer ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <TableRow>
                <TableCell className="font-semibold text-gray-900 dark:text-white p-2">
                  Order Info
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Purchase Date
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Customer ID
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Transactions
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Status
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Details
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Notes
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm || statusFilter !== "all"
                        ? "No orders match your filters."
                        : "No orders found."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <TableCell>
                      <div className="p-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          #{order.memo_no}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Salesman: {order.sales_man_id}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {new Date(order.order_date).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {order.customer_id}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Payable:{" "}
                            {formatCurrency(order.total_payable_amount)}
                          </span>
                        </div>
                        {order.advance_payment_amount > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Advance:{" "}
                            {formatCurrency(order.advance_payment_amount)}
                          </div>
                        )}
                        {order.due_amount > 0 && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            Due: {formatCurrency(order.due_amount)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={item.id}>
                              {item.quantity}x Product {item.product_id}
                              {index < Math.min(order.items.length - 1, 1) &&
                                ", "}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-blue-600 dark:text-blue-400">
                              +{order.items.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>{order.notes}</div>
                    </TableCell>

                    <TableCell>
                      <Button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
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
