import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import EmployeeList from "./pages/HrManagement/EmployeeList/EmployeeList";
import AddEmployee from "./pages/HrManagement/AddEmployee/AddEmployee";
import Order from "./pages/Order/Order";
import AddOrder from "./pages/Order/AddOrder";
import CustomerList from "./pages/HrManagement/CustomerList";
import CustomerProfile from "./pages/HrManagement/CustomerProfile";
import AddCustomer from "./pages/HrManagement/AddCustomer";
import BranchReports from "./pages/Reports/BranchReports";
import WorkerProgress from "./pages/Reports/WorkerProgress";
import MaterialsPurchase from "./pages/Expenses/MaterialsPurchase";
import Unauthorized from "./pages/OtherPage/unauthorized";
import EmployeeSalary from "./pages/Expenses/EmployeeSalary";
import SalespersonList from "./pages/HrManagement/EmployeeList/SalespersonList";
import AddSupplier from "./pages/Expenses/AddSupplier";
import SupplierList from "./pages/Expenses/SupplierList";
import PurchaseReport from "./pages/Reports/PurchaseReport";
import SalesPersonProgress from "./pages/Reports/SalesPersonProgress";
import RestockProducts from "./pages/Stock/RestockProducts";
import SaleProducts from "./pages/Stock/SaleProducts";
import StockReport from "./pages/Reports/StockReport";
import SalesReport from "./pages/Reports/SalesReport";
import SaleProductsWithEdit from "./pages/Stock/EditSoldProducts";
import EditSoldProducts from "./pages/Stock/EditSoldProducts";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/unauthorized" element={<Unauthorized />} />

            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile/:id" element={<UserProfiles />} />

            <Route
              path="/salesperson-list"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <SalespersonList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/worker-list"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />

            <Route path="/customer/:id" element={<CustomerProfile />} />

            <Route
              path="/customer-list"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <CustomerList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-employee"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <AddEmployee />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-supplier"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <AddSupplier />
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-supplier"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <SupplierList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-customer"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <AddCustomer />
                </ProtectedRoute>
              }
            />

            <Route path="/blank" element={<Blank />} />

            {/* Orders */}
            <Route
              path="/add-order"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <AddOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <Order />
                </ProtectedRoute>
              }
            />
            {/* Restock and Sales */}
            <Route
              path="/restock"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <RestockProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sale"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <SaleProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sale/edit"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <EditSoldProducts />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/materials-purchase"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <MaterialsPurchase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-salary"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <EmployeeSalary />
                </ProtectedRoute>
              }
            />

            {/* Reports */}
            <Route
              path="/branch-report"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <BranchReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-report"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <StockReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-report"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <PurchaseReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-report"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <SalesReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-progress"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <SalesPersonProgress />
                </ProtectedRoute>
              }
            />

            <Route
              path="/worker-progress"
              element={
                <ProtectedRoute allowedRoles={["chairman"]}>
                  <WorkerProgress />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
