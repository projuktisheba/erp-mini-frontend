import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Inventory from "./pages/Inventory/Inventory";
import Reports from "./pages/Reports/Reports";
import SystemSettings from "./pages/Settings/SystemSettings/SystemSettings";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import EmployeeList from "./pages/HrManagement/EmployeeList/EmployeeList";
import AddEmployee from "./pages/HrManagement/AddEmployee/AddEmployee";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/employee-list" element={<ProtectedRoute><EmployeeList></EmployeeList></ProtectedRoute>} />
            <Route path="/add-employee" element={<ProtectedRoute><AddEmployee></AddEmployee></ProtectedRoute>} />
            <Route path="/blank" element={<Blank />} />

            {/* Inventory */}
            <Route path="/demo-inventory" element={<Inventory />} />

            {/* Reports */}
            <Route path="/basic-reports" element={<Reports />} />

            {/* settings */}
            <Route path="/system-settings" element={<SystemSettings></SystemSettings>} />



          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
