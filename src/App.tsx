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
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <AddEmployee />
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
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <Order />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-order"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <AddOrder />
                </ProtectedRoute>
              }
            />

            {/* Reports */}
            <Route
              path="/branch-report"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <BranchReports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-progress"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
                  <EmployeeProgress />
                </ProtectedRoute>
              }
            />

            <Route
              path="/worker-progress"
              element={
                <ProtectedRoute allowedRoles={["chairman", "manager"]}>
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
