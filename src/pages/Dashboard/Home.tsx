import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";

export default function Home() {
  const [orderOverview, setOrderOverview] = useState({
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
  });
  const [reportType, setReportType] = useState("all");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const fetchOverview = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/reports/dashboard/orders/overview?type=${reportType}&date=${date}`
      );
      setOrderOverview(data.order_overview);
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [reportType, date]);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="flex flex-col gap-10">
        <EcommerceMetrics
          overview={{
            total_orders: orderOverview.total_orders,
            pending_orders: orderOverview.pending_orders,
            completed_orders: orderOverview.completed_orders,
            cancelled_orders: orderOverview.cancelled_orders,
          }}
        />

        <MonthlySalesChart />

        <RecentOrders />
      </div>
    </>
  );
}
