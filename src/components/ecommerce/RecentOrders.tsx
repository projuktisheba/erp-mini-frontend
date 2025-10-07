import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";
import { Link } from "react-router";

interface Order {
  id: number;
  order_date: string;
  memo_no: string;
  salesperson_name: string;
  status: string;
  total_payable_amount: number;
}

export default function RecentOrders() {
  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  const branch_id = userData.branch_id;

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        "/orders/list/paginated?pageNo=1&sort_by_date=desc",
        {
          headers: {
            "X-Branch-ID": branch_id,
          },
        }
      );
      setRecentOrders(res.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch recent orders:", error);
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, [branch_id]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Orders
        </h3>

        <div className="flex items-center gap-3">
          <Link
            to={"/orders"}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Order (Memo No)
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Salesperson
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total Payable
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No recent orders found.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-white/80">
                      {new Date(order.order_date).toISOString().split("T")[0]}
                    </TableCell>
                    <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-white/80">
                      {order.memo_no}
                    </TableCell>
                    <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-white/80">
                      {order.salesperson_name || "—"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-white/80">
                      {order.total_payable_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        size="sm"
                        color={
                          order.status === "Delivered"
                            ? "success"
                            : order.status === "Pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
