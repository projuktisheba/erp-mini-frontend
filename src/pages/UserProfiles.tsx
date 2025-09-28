import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import AccessControll from "../components/UserProfile/AccessControll/AccessControll";
import axiosInstance from "../hooks/AxiosIntence/AxiosIntence";
import Calendar from "./Calendar/Calendar";
import Laser from "./Laser/Laser";

type Tab = "profile" | "calendar" | "ledger";

export default function UserProfiles() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);

        const localUserData = localStorage.getItem("userData");
        const parsedUserData = localUserData ? JSON.parse(localUserData) : null;

        const res = await axiosInstance.get(`/hr/employee?id=${id}`);
        const apiEmployee = res.data?.employee || null;

        if (parsedUserData && parsedUserData.email === apiEmployee?.email) {
          setEmployee(parsedUserData);
        } else {
          setEmployee(apiEmployee);
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEmployee();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!employee) return <p>No employee found</p>;

  return (
    <>
      <PageMeta
        title={`Profile | ${employee.first_name} ${employee.last_name}`}
        description="User profile page"
      />
     <PageBreadcrumb 
  pageTitle={
    activeTab === "profile"
      ? "Profile"
      : activeTab === "calendar"
      ? "Calendar"
      : "Ledger"
  } 
/>


      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* Tabs (Title as first button) */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-5 gap-4">
          <div className="flex gap-2 flex-wrap">
            {/* Profile Tab as Button */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-full font-medium ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Profile
            </button>
            {/* Calendar Tab */}
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-full font-medium ${
                activeTab === "calendar"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Calendar
            </button>
            {/* Ledger Tab */}
            <button
              onClick={() => setActiveTab("ledger")}
              className={`px-4 py-2 rounded-full font-medium ${
                activeTab === "ledger"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ledger
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "profile" && (
            <>
              <UserMetaCard
                id={employee.id}
                image={`https://api.erp.pssoft.xyz/api/v1${employee.avatar_link}`}
                name={`${employee.first_name} ${employee.last_name}`}
              />
              <UserInfoCard employee={employee} />
              <UserAddressCard employee={employee} />
              <AccessControll
                email={employee.email}
                role={employee.role}
                status={employee.status}
              />
            </>
          )}
          {activeTab === "calendar" && <Calendar employee={employee} />}
          {activeTab === "ledger" && <Laser employee={employee} />}
        </div>
      </div>
    </>
  );
}
