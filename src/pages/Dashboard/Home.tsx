import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import axiosInstance from "../../hooks/AxiosIntence/AxiosIntence";

export default function Home() {
  const [orderOverview, setOrderOverview] = useState({
    total_orders: 0,
    total_orders_amount: 0,
    pending_orders: 0,
    pending_orders_amount: 0,
    checkout_orders: 0,
    checkout_orders_amount: 0,
    cancelled_orders: 0,
    cancelled_orders_amount: 0,
  });
  // const [reportType, setReportType] = useState("all");
  // const [date, setDate] = useState(() => {
  //   const today = new Date();
  //   return today.toISOString().split("T")[0];
  // });

  const reportType = "all";
  const date = new Date().toISOString().split("T")[0];

  const fetchOverview = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/reports/dashboard/orders/overview?type=${reportType}&date=${date}`
      );
      console.log(data.order_overview);

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
      <PageMeta title="ERP Management" description="ERP Management System" />
      <div className="flex flex-col gap-10">
        <EcommerceMetrics
          overview={{
            total_orders: orderOverview.total_orders,
            total_orders_amount: orderOverview.total_orders_amount,
            pending_orders: orderOverview.pending_orders,
            pending_orders_amount: orderOverview.pending_orders_amount,
            checkout_orders: orderOverview.checkout_orders,
            checkout_orders_amount: orderOverview.checkout_orders_amount,
            cancelled_orders: orderOverview.cancelled_orders,
            cancelled_orders_amount: orderOverview.cancelled_orders_amount,
          }}
        />

        {/* <MonthlySalesChart /> */}

        <RecentOrders />
      </div>
    </>
  );
}
