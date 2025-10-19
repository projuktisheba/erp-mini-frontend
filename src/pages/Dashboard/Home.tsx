import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import {  useEffect, useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { printHTML } from "../../utils/printHtml";
interface ProductItem {
  id: number;
  product_name: string;
  current_stock_level: number;
}
const branchList = [
  { id: 1, name: "AL FANAR ABAYAT" },
  { id: 2, name: "DIVA ABAYAT" },
  { id: 3, name: "EID AL ABAYAT" },
];
export default function Home() {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { branchId } = context;
  const [products, setProducts] = useState<ProductItem[]>([]);
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
        `/reports/dashboard/orders/overview?type=${reportType}&date=${date}`,
        {
          headers: {
            "X-Branch-ID": branchId,
          },
        }
      );

      setOrderOverview(data.order_overview);
      console.log(data.order_overview);
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
    }
  };


    // Fetch data
  const fetchProducts = async () => {
    const { data } = await axiosInstance.get(`/products`, {
      headers: { "X-Branch-ID": branchId },
    });
    setProducts(data.products || []);
  };

  useEffect(() => {
    fetchOverview();
  }, [reportType, date, branchId]);

  useEffect(() => {
    fetchProducts();
  }, [branchId]);
// Print main stock table
  const handlePrintStockTable = () => {
    if (products.length === 0) {
      alert("No stock report data to print!");
      return;
    }

    const rows = products
      .map(
        (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.product_name}</td>
        <td>${item.current_stock_level}</td>
      </tr>`
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>Stock Report - ${reportType.toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; }
            .header .meta { margin-top: 5px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #f3f3f3; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Current Stock Report</h1>
            <div class="meta">
              <strong>Branch:</strong> ${
                branchList[branchId - 1]?.name || "N/A"
              }<br/>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Total Current Stock Level</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
  `;
    printHTML(html);
  };
  return (
    
      <>
      <PageMeta title="ERP Management" description="ERP Management System" />
      <div className="flex flex-col gap-10">
        <EcommerceMetrics
          overview={{
            total_orders: orderOverview.total_orders,
            pending_orders: orderOverview.pending_orders,
            checkout_orders: orderOverview.checkout_orders,
            cancelled_orders: orderOverview.cancelled_orders,
            completed_orders: orderOverview.total_orders
          }}
        />
        <div
          className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-start mb-2">
              <strong>Current Stock</strong>
            </div>
            <div className="flex justify-end mb-2">
              <button
                onClick={handlePrintStockTable}
                className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-400 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
              >
                Print Stock
              </button>
            </div>
          </div>
          <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 border-b text-center">ID</th>
                <th className="px-3 py-2 border-b text-center">Product</th>
                <th className="px-3 py-2 border-b text-center">Current Stock Level</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No product record found.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-3 py-2 border-b text-center">
                      {item.id}
                    </td>
                    <td className="px-3 py-2 border-b text-center">
                      {item.product_name}
                    </td>
                    <td className="px-3 py-2 border-b text-center">
                      {item.current_stock_level}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <RecentOrders />
        
      </div>
      </>
  
  );
}
