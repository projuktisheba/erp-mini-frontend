import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import SystemSettings from "./pages/Settings/SystemSettings/SystemSettings";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import EmployeeList from "./pages/HrManagement/EmployeeList/EmployeeList";
import AddEmployee from "./pages/HrManagement/AddEmployee/AddEmployee";
import Order from "./pages/Order/Order";
import AddOrder from "./pages/Order/AddOrder";
import CustomerList from "./pages/HrManagement/CustomerList";
import CustomerProfile from "./pages/HrManagement/CustomerProfile";
import AddCustomer from "./pages/HrManagement/AddCustomer";
import SalespersonList from "./pages/HrManagement/SalespersonList";
import BranchReports from "./pages/Reports/BranchReports";
import EmployeeProgress from "./pages/Reports/EmployeeProgress";
import WorkerProgress from "./pages/Reports/WorkerProgress";

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
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile/:id" element={<UserProfiles />} />

            <Route
              path="/salesperson-list"
              element={
                <ProtectedRoute>
                  <SalespersonList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/worker-list"
              element={
                <ProtectedRoute>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />

            <Route path="/customer/:id" element={<CustomerProfile />} />
            <Route
              path="/customer-list"
              element={
                <ProtectedRoute>
                  <CustomerList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-employee"
              element={
                <ProtectedRoute>
                  <AddEmployee></AddEmployee>
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-customer"
              element={
                <ProtectedRoute>
                  <AddCustomer />
                </ProtectedRoute>
              }
            />

            <Route path="/blank" element={<Blank />} />

            {/* Orders */}
            <Route path="/orders" element={<Order />} />
            <Route path="/add-order" element={<AddOrder />} />

            {/* Reports */}
            <Route path="/branch-report" element={<BranchReports />} />

            <Route path="/employee-progress" element={<EmployeeProgress />} />

            <Route path="/worker-progress" element={<WorkerProgress />} />

            {/* settings */}
            <Route
              path="/system-settings"
              element={<SystemSettings></SystemSettings>}
            />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
