import { useEffect, useState } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  CircleX,
  ArrowRightFromLine,
} from "lucide-react";
import Swal from "sweetalert2";

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

type OrderStatus =
  | "pending"
  | "checkout"
  | "delivery"
  | "cancelled"
  | "returned";

const statusFlow: OrderStatus[] = [
  "pending",
  "checkout",
  "delivery",
  "cancelled",
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      checkout:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      delivery: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      returned:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
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

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const index = statusFlow.indexOf(current);
    if (index >= 0 && index < statusFlow.length - 1) {
      return statusFlow[index + 1];
    }
    return null;
  };

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const handleEdit = (order: Order) => {
    console.log("Edit", order.id);
  };

  const handleCancel = async (order: Order) => {
    try {
      const { data } = await axiosInstance.delete(
        `/orders?order_id=${order.id}`
      );
      Swal.fire({
        icon: "success",
        title: data.message,
      });
      fetchOrders();
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleNextState = async (order: Order) => {
    const nextStatus = getNextStatus(order.status as OrderStatus);

    if (!nextStatus) {
      Swal.fire({
        icon: "info",
        title: "No further state",
        text: `Order #${order.memo_no} is already in its final state.`,
      });
      return;
    }

    try {
      const { data } = await axiosInstance.patch(
        `/orders/${nextStatus}?order_id=${order.id}`
      );
      Swal.fire({
        icon: "success",
        title: "Status updated",
        text: data.message,
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update order status. Please try again.",
      });
    }
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
      {/* {filteredOrders.length > 0 && (
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
      )} */}

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
              <option value="checkout">Checkout</option>
              <option value="delivery">Delivery</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
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
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            Payable:{" "}
                            {formatCurrency(order.total_payable_amount)}
                          </span>
                        </div>
                        {order.advance_payment_amount > 0 && (
                          <div className="text-xs font-medium text-green-600 dark:text-green-400">
                            Advance:{" "}
                            {formatCurrency(order.advance_payment_amount)}
                          </div>
                        )}
                        {order.due_amount > 0 && (
                          <div className="text-xs  text-red-600 dark:text-red-400">
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
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => openModal(order)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          disabled={order.status === "cancelled"}
                          onClick={() => handleNextState(order)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <ArrowRightFromLine className="h-4 w-4" />
                        </Button>

                        <Button
                          disabled={order.status === "cancelled"}
                          onClick={() => handleCancel(order)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <CircleX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-11/12 max-w-3xl relative animate-fadeIn scale-95 transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Order Details{" "}
                <span className="text-blue-600">#{selectedOrder.memo_no}</span>
              </h2>
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <strong className="block text-gray-600 dark:text-gray-400">
                    Customer ID
                  </strong>
                  <span className="text-gray-900 dark:text-gray-200">
                    {selectedOrder.customer_id}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <strong className="block text-gray-600 dark:text-gray-400">
                    Salesman ID
                  </strong>
                  <span className="text-gray-900 dark:text-gray-200">
                    {selectedOrder.sales_man_id}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <strong className="block text-gray-600 dark:text-gray-400">
                    Order Date
                  </strong>
                  <span className="text-gray-900 dark:text-gray-200">
                    {new Date(selectedOrder.order_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <strong className="block text-gray-600 dark:text-gray-400">
                    Status
                  </strong>
                  <span
                    className="inline-block px-2 py-1 text-xs font-medium rounded-full
              ${getStatusColor(selectedOrder.status)}"
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-400">
                  {selectedOrder.notes || "—"}
                </p>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Products
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-2 text-left">Product ID</th>
                        <th className="px-4 py-2 text-left">Quantity</th>
                        <th className="px-4 py-2 text-left">Unit Price</th>
                        <th className="px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t dark:border-gray-700"
                        >
                          <td className="px-4 py-2">{item.product_id}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-4 py-2 font-medium">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                Edit Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
