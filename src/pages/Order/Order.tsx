import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
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
  Loader2,
  Package,
  ShoppingCart,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";
import { formatDate } from "../../utils/dateFormatter";
import Badge from "../../components/ui/badge/Badge";

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  total_price: number;
}

interface Order {
  id: number;
  memo_no: string;
  order_date: string;
  delivery_date: string;
  exit_date: string;
  salesperson_id: number;
  salesperson_name: string;
  salesperson_mobile: string;
  customer_id: number;
  customer_name: string;
  customer_mobile: string;
  total_payable_amount: number;
  advance_payment_amount: number;
  due_amount: number;
  total_items: number;
  items_delivered: number;
  payment_account_id: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface Account {
  id: number;
  name: string;
}

type OrderStatus = "pending" | "checkout" | "delivery" | "cancelled";

const statusFlow: OrderStatus[] = [
  "pending",
  "checkout",
  "delivery",
  "cancelled",
];
const getNoOrdersMessage = (status: string) => {
  if (status === "all") {
    return `No orders found`;
  }
  const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
  return `No ${statusCapitalized} orders found.`;
};

type ConfirmationAction =
  | { type: "cancel"; order: Order }
  | { type: "nextStatus"; order: Order; nextStatus: OrderStatus }
  | null;

export default function Orders() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext not provided");
  }
  const { branchId, userRole } = context;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingButtons, setLoadingButtons] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);
  const [deliveryFormData, setDeliveryFormData] = useState({
    paid_amount: 0,
    total_items_delivered: 0,
    payment_account_id: "",
    exit_date: "",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/orders/list", {
        headers: {
          "X-Branch-ID": branchId,
        },
      });

      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    const res = await axiosInstance.get("/accounts/names", {
      headers: {
        "X-Branch-ID": branchId,
      },
    });
    setAccounts(res.data.accounts);
  };
  const fetchOrderItems = async (order: Order) => {
    const key = `${order.id}-view`;
    setLoadingButtons((prev) => ({ ...prev, [key]: true }));
    const res = await axiosInstance.get(
      "/orders/items?memo_no=" + order.memo_no,
      {
        headers: {
          "X-Branch-ID": branchId,
        },
      }
    );
    if (!res.data.error) {
      order.items = res.data.items;
      setSelectedOrder(order);
      console.log(selectedOrder);
    } else {
      setAlert({
        variant: "error",
        title: "Error",
        message: res.data.message || `Unable to fetch data`,
      });
    }
    setLoadingButtons((prev) => ({ ...prev, [key]: false }));
  };

  useEffect(() => {
    fetchOrders();
    fetchAccounts();
  }, [branchId]);

  // automatically hide alert after 2 second
  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => {
        setAlert(null); // Hide alert
        fetchOrders(); // Reload orders after alert disappears
      }, 4000); // 4 seconds

      return () => clearTimeout(timeout);
    }
  }, [alert]);

  const filteredOrders = orders.filter((order) => {
    const query = searchTerm.toLowerCase();

    // Check if search term matches
    const matchesSearch =
      order.memo_no.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.customer_mobile.includes(query);

    // Check status filter
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "partial") {
      // Partially delivered: some items delivered but not all
      matchesStatus =
        order.items_delivered > 0 && order.items_delivered < order.total_items;
    } else {
      matchesStatus = order.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      checkout:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      partial:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      delivery: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      returned:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return (
      colors[status as OrderStatus] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    );
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const index = statusFlow.indexOf(current);
    if (index >= 0 && index < statusFlow.length - 1) {
      return statusFlow[index + 1];
    }
    return null;
  };

  const openModal = (order: Order) => {
    fetchOrderItems(order).then(() => {
      setSelectedOrder(order);
      setIsModalOpen(true);
    });
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setConfirmationAction(null);
    setIsModalOpen(false);
    setDeliveryFormData({
      paid_amount: 0,
      total_items_delivered: 0,
      payment_account_id: "",
      exit_date: "",
    });
  };

  // const handleEdit = (order: Order) => {
  //   console.log("Edit", order.id);
  // };

  const handleCancelClick = (order: Order) => {
    setConfirmationAction({ type: "cancel", order });
    setIsModalOpen(true);
  };

  const handleNextStateClick = async (order: Order) => {
    let nextStatus = getNextStatus(order.status as OrderStatus);
    if (!nextStatus) return;

    if (
      nextStatus === "delivery" ||
      (nextStatus === "cancelled" && order.total_items > order.items_delivered)
    ) {
      //set the nextStatus
      nextStatus = "delivery";
      // Prepare delivery form and open modal
      const today = new Date().toISOString().split("T")[0];
      // const remainingItems = order.items.reduce(
      //   (sum, item) => sum + item.quantity,
      //   0
      // ) - order.items_delivered;

      setDeliveryFormData({
        paid_amount: order.total_payable_amount - order.advance_payment_amount,
        total_items_delivered: order.total_items - order.items_delivered,
        payment_account_id: "",
        exit_date: today,
      });

      setConfirmationAction({ type: "nextStatus", order, nextStatus });
      setIsModalOpen(true);
    } else if (nextStatus === "checkout") {
      // Directly update status without modal
      setIsSubmitting(true);
      // set per-row loading state for next action
      setLoadingButtons((prev) => ({ ...prev, [`${order.id}-next`]: true }));
      try {
        const { data } = await axiosInstance.patch(
          `/orders/checkout?order_id=${order.id}&branch_id=${branchId}`,
          {},
          {
            headers: { "X-Branch-ID": branchId },
          }
        );
        setAlert({
          variant: "success",
          title: "Success",
          message: data.message || `Order moved to ${nextStatus}`,
        });
        fetchOrders();
      } catch (err) {
        console.error(err);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to move order to checkout",
        });
      } finally {
        setIsSubmitting(false);
        setLoadingButtons((prev) => ({ ...prev, [`${order.id}-next`]: false }));
      }
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmationAction) return;
    const { type, order } = confirmationAction;
    setIsModalOpen(false);
    setIsSubmitting(true);
    // mark corresponding row action as loading
    if (type === "cancel") {
      setLoadingButtons((prev) => ({ ...prev, [`${order.id}-cancel`]: true }));
    } else if (type === "nextStatus") {
      setLoadingButtons((prev) => ({ ...prev, [`${order.id}-next`]: true }));
    }

    if (type === "cancel") {
      try {
        const { data } = await axiosInstance.delete(
          `/orders?order_id=${order.id}`,
          {
            headers: { "X-Branch-ID": branchId },
          }
        );
        closeModal();
        setAlert({
          variant: "success",
          title: "Success",
          message: data.message || "Order cancelled successfully",
        });
        fetchOrders();
      } catch (err) {
        console.error(err);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to cancel order",
        });
      } finally {
        setLoadingButtons((prev) => ({
          ...prev,
          [`${order.id}-cancel`]: false,
        }));
      }
    } else if (
      type === "nextStatus" &&
      confirmationAction.nextStatus === "delivery"
    ) {
      const {
        paid_amount,
        payment_account_id,
        exit_date,
        total_items_delivered,
      } = deliveryFormData;
      if (!payment_account_id || !exit_date) {
        setAlert({
          variant: "warning",
          title: "Incomplete",
          message: "Please fill all delivery information",
        });
        setIsSubmitting(false);
        setLoadingButtons((prev) => ({ ...prev, [`${order.id}-next`]: false }));
        return;
      }

      try {
        const { data } = await axiosInstance.patch(
          `/orders/delivery`,
          {
            order_id: order.id,
            exit_date,
            paid_amount: Number(paid_amount),
            total_items_delivered: total_items_delivered,
            payment_account_id: Number(payment_account_id),
          },
          { headers: { "X-Branch-ID": branchId } }
        );
        closeModal();
        setAlert({
          variant: "success",
          title: "Success",
          message: data.message || "Order marked as delivered",
        });
        fetchOrders();
      } catch (err) {
        console.error(err);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Failed to mark order as delivered",
        });
      } finally {
        setLoadingButtons((prev) => ({ ...prev, [`${order.id}-next`]: false }));
      }
    }

    setIsSubmitting(false);
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
      {alert && (
        <div
          className={`mb-4 p-2 rounded-lg ${
            alert.variant === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : alert.variant === "error"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              : alert.variant === "warning"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          }`}
        >
          <strong className="block font-medium">{alert.title}</strong>
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Orders Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and track all customer orders
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by memo no, order ID, customer ID, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="checkout">Checkout</option>
              <option value="partial">Partial Delivery</option>
              <option value="delivery">Delivery</option>
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
                <TableCell>Order Info</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Transactions</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      {getNoOrdersMessage(statusFilter) || "No order found"}
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
                          {order.memo_no}
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
                          {order.customer_name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            Payable:{" QR "}
                            {order.total_payable_amount}
                          </span>
                        </div>
                        {order.advance_payment_amount > 0 && (
                          <div className="text-xs font-medium text-green-600 dark:text-green-400">
                            Advance:{" QR "}
                            {order.advance_payment_amount}
                          </div>
                        )}
                        {order.due_amount > 0 && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            Due:{" QR "}
                            {order.due_amount}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        size="sm"
                        color={
                          order.status === "pending"
                            ? "warning"
                            : order.status === "checkout"
                            ? "info"
                            : order.status === "delivery" && order.total_items > order.items_delivered
                            ? "dark"
                            : order.status === "delivery"
                            ? "success"
                            : "error" // cancelled or unknown
                        }
                      >
                        {order.status === "delivery" &&
                        order.total_items > order.items_delivered
                          ? "Partial Delivery"
                          : order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex p-2 items-center gap-2">
                        {/* View Button */}
                        <Button
                          onClick={() => openModal(order)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                          disabled={loadingButtons[`${order.id}-view`]}
                        >
                          {loadingButtons[`${order.id}-view`] ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Conditional action buttons */}
                        {order.status === "pending" && (
                          <>
                            {/* Checkout */}
                            <Button
                              onClick={() => handleNextStateClick(order)}
                              size="sm"
                              variant="info"
                              className="flex items-center gap-2"
                              disabled={loadingButtons[`${order.id}-next`]}
                            >
                              {loadingButtons[`${order.id}-next`] ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4" />
                                  Checkout
                                </>
                              )}
                            </Button>
                          </>
                        )}

                        {(order.status === "checkout" ||
                          (order.status === "delivery" &&
                            order.total_items > order.items_delivered)) && (
                          <>
                            {/* Delivery */}
                            <Button
                              onClick={() => handleNextStateClick(order)}
                              size="sm"
                              variant="primary"
                              className="flex items-center gap-2"
                              disabled={loadingButtons[`${order.id}-next`]}
                            >
                              {loadingButtons[`${order.id}-next`] ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                              ) : (
                                <>
                                  <Package className="h-4 w-4" />
                                  Delivery &nbsp;
                                </>
                              )}
                            </Button>
                          </>
                        )}

                        {(order.status === "pending" ||
                          order.status === "checkout" ||
                          (order.status === "delivery" &&
                            order.total_items > order.items_delivered)) && (
                          <>
                            {/* Cancel */}
                            {userRole == "chairman" ? (
                              <Button
                                onClick={() => handleCancelClick(order)}
                                size="sm"
                                variant="warning"
                                className="flex items-center gap-2"
                                disabled={loadingButtons[`${order.id}-cancel`]}
                              >
                                {loadingButtons[`${order.id}-cancel`] ? (
                                  <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                  <>
                                    <CircleX className="h-4 w-4" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            ) : (
                              ""
                            )}
                          </>
                        )}
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
      {isModalOpen && (selectedOrder || confirmationAction) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-11/12 max-w-3xl relative animate-fadeIn scale-95 transform transition-all p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                {confirmationAction
                  ? confirmationAction.type === "cancel"
                    ? `Cancel Order #${confirmationAction.order.memo_no}?`
                    : `Move Order #${confirmationAction.order.memo_no} to ${confirmationAction.nextStatus}`
                  : `Order Details #${selectedOrder?.memo_no}`}
              </h2>
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4">
              {confirmationAction ? (
                <>
                  {confirmationAction.type === "nextStatus" &&
                  confirmationAction.nextStatus === "delivery" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Payment Account
                        </label>
                        <select
                          value={deliveryFormData.payment_account_id}
                          onChange={(e) =>
                            setDeliveryFormData((prev) => ({
                              ...prev,
                              payment_account_id: e.target.value,
                            }))
                          }
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select payment account</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Paid Amount
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder="Enter paid amount"
                          value={deliveryFormData.paid_amount}
                          onChange={(e) =>
                            setDeliveryFormData((prev) => ({
                              ...prev,
                              paid_amount: Number(e.target.value || 0),
                            }))
                          }
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Total Items
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder="Enter delivered items"
                          value={deliveryFormData.total_items_delivered}
                          onChange={(e) =>
                            setDeliveryFormData((prev) => ({
                              ...prev,
                              total_items_delivered: Number(
                                e.target.value || 0
                              ),
                            }))
                          }
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Exit Date
                        </label>
                        <input
                          type="date"
                          value={deliveryFormData.exit_date}
                          onChange={(e) =>
                            setDeliveryFormData((prev) => ({
                              ...prev,
                              exit_date: e.target.value,
                            }))
                          }
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-400">
                      Are you sure you want to{" "}
                      {confirmationAction.type === "cancel"
                        ? "cancel"
                        : `move to ${confirmationAction.nextStatus}`}{" "}
                      this order?
                    </p>
                  )}
                </>
              ) : (
                // Order details
                <div>
                  {/* Customer & Salesperson Table */}
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
                      <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <tr>
                          <th className="px-4 py-2 text-left">Customer Info</th>
                          <th className="px-4 py-2 text-left">
                            Salesperson Info
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t dark:border-gray-700">
                          <td className="px-4 py-2">
                            <strong>Name:</strong>{" "}
                            {selectedOrder?.customer_name || "-"} <br />
                            <strong>Mobile:</strong>{" "}
                            {selectedOrder?.customer_mobile || "-"}
                          </td>
                          <td className="px-4 py-2">
                            <strong>Name:</strong>{" "}
                            {selectedOrder?.salesperson_name || "-"} <br />
                            <strong>Mobile:</strong>{" "}
                            {selectedOrder?.salesperson_mobile || "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Order Dates & Status Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
                      <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <tr>
                          <th className="px-4 py-2 text-left">Order ID</th>
                          <th className="px-4 py-2 text-left"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t dark:border-gray-700">
                          <td className="px-4 py-2">
                            <strong>Memo: {selectedOrder?.memo_no}</strong>{" "}
                            <br />
                            <strong>Status: </strong>{" "}
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-sm ${getStatusColor(
                                selectedOrder?.status || ""
                              )}`}
                            >
                              {(selectedOrder?.status === "delivery" &&
                                selectedOrder?.total_items >
                                  selectedOrder?.items_delivered) === true
                                ? "partial delivery"
                                : selectedOrder?.status}
                            </span>{" "}
                            <br />
                            <strong>Paid Amount: </strong>{" "}
                            {selectedOrder?.advance_payment_amount}
                          </td>
                          <td className="px-4 py-2">
                            <strong>Order Date:</strong>{" "}
                            {selectedOrder?.order_date
                              ? formatDate(selectedOrder.order_date)
                              : "-"}{" "}
                            <br />
                            <strong>Delivery Date:</strong>{" "}
                            {selectedOrder?.delivery_date
                              ? formatDate(selectedOrder.delivery_date)
                              : "-"}{" "}
                            <br />
                            <strong>Exit Date:</strong>{" "}
                            {selectedOrder?.exit_date
                              ? formatDate(selectedOrder.exit_date)
                              : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <strong>Products:</strong>
                    <div className="overflow-x-auto border rounded-lg mt-2">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          <tr>
                            <th className="px-4 py-2 text-left">
                              Product Name
                            </th>
                            <th className="px-4 py-2 text-right">Quantity</th>
                            <th className="px-4 py-2 text-right">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedOrder?.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-t dark:border-gray-700"
                            >
                              <td className="px-4 py-2">{item.product_name}</td>
                              <td className="px-4 py-2 text-right ">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-2 font-medium text-right ">
                                {" QR " + item.total_price}
                              </td>
                            </tr>
                          ))}
                        </tbody>

                        <tfoot>
                          <tr className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <td
                              className="px-4 py-2 text-left text-gray-700 dark:text-gray-300"
                              colSpan={2}
                            >
                              <strong>Partial Delivery Items:</strong>
                            </td>
                            <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200 font-semibold">
                              {selectedOrder?.items_delivered || 0}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-start gap-3 mt-6">
              {confirmationAction ? (
                <button
                  onClick={handleConfirmAction}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              ) : (
                ""
                // <button
                //   onClick={() => handleEdit(selectedOrder!)}
                //   className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                // >
                //   Edit Order
                // </button>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
