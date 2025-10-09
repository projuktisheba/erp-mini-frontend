import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import AccessControl from "../components/UserProfile/AccessControl/AccessControl";
import axiosInstance, { API_URL } from "../hooks/AxiosInstance/AxiosInstance";
import { AppContext } from "../context/AppContext";

// type Tab = "profile" | "calendar" | "ledger";

export default function UserProfiles() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext not provided");
  }
  const { branchId } = context;

  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // const [activeTab, setActiveTab] = useState<Tab>("profile");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);

        const localUserData = localStorage.getItem("userData");

        const parsedUserData = localUserData ? JSON.parse(localUserData) : null;
        const res = await axiosInstance.get(`/hr/employee?id=${id}`, {
          headers: {
            "X-Branch-ID": branchId,
          },
        });
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
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* Tabs (Title as first button) */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-5 gap-4"></div>

        {/* Tab Content */}
        <div className="space-y-6">
          <UserMetaCard
            id={employee.id}
            image={employee.avatar_link == "" ? "image/user/user.png" : `${API_URL}${employee.avatar_link}` }
            name={`${employee.name}`}
          />
          <UserInfoCard employee={employee} />
          <UserAddressCard employee={employee} />
          <AccessControl employee={employee} />
        </div>
      </div>
    </>
  );
}
