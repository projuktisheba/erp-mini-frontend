import { useState, useEffect, useContext } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import axios from "axios";
import { useNavigate } from "react-router";
import { useUser } from "../UserContext/UserContext";
import { Store } from "lucide-react";
import { AppContext } from "../../context/AppContext";

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar_link?: string;
}

const branchList = [
  { id: 1, name: "AL FANAR ABAYAT" },
  { id: 2, name: "DIVA ABAYAT" },
  { id: 3, name: "EID AL ABAYAT" },
];

export default function UserDropdown() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("AppContext must be used within AppContextProvider");

  const { branchId, setBranchId } = context;
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { avatar } = useUser();

  const displayName =
    userData?.name || localStorage.getItem("username") || "User";
  const displayEmail =
    userData?.email || localStorage.getItem("username") || "user@example.com";
  const profileImage =
    avatar || `https://api.erp.pssoft.xyz/api/v1${userData?.avatar_link}`;

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleProfile = () => {
    if (userData?.id) navigate(`/profile/${userData.id}`);
    closeDropdown();
  };

  const handleSignOut = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const username = localStorage.getItem("username");
        if (!username) return;

        const response = await axios.get(
          "https://api.erp.pssoft.xyz/api/v1/hr/employees",
          {
            headers: {
              "X-Branch-ID": branchId,
            },
          }
        );
        const employees = response.data.employees || [];

        const matchedUser = employees.find(
          (emp: any) => emp.email === username
        );
        if (matchedUser) {
          setUserData({
            id: matchedUser.id?.toString() || "",
            name: `${matchedUser.first_name || ""} ${
              matchedUser.last_name || ""
            }`.trim(),
            email: matchedUser.email || "",
            avatar_link: matchedUser.avatar_link || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="relative">
      {/* Dropdown toggle button */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center rounded-full p-1 transition-shadow duration-200 ${
          isOpen ? "shadow-lg ring-2 ring-blue-500" : "hover:shadow-md"
        }`}
        disabled={loading}
      >
        <span className="mr-3 h-11 w-11 overflow-hidden rounded-full">
          <img
            src={profileImage}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://i.postimg.cc/kG1Byx5n/photo-1740252117044-2af197eea287.avif";
            }}
          />
        </span>
        <span className="font-medium text-theme-sm text-gray-700 dark:text-gray-400">
          {loading ? "Loading..." : displayName}
        </span>
        <svg
          className={`ml-1 stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        {/* User info */}
        <div className="flex flex-col gap-0.5 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {displayName}
          </span>
          <span className="text-gray-500 text-sm dark:text-gray-400">
            {displayEmail}
          </span>
        </div>

        {/* Profile link */}
        <ul className="flex flex-col gap-1 pt-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={handleProfile}
              tag="button"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5Z"
                  fill=""
                />
              </svg>
              Edit profile
            </DropdownItem>
          </li>
        </ul>

        {/* Branch selector */}
        <ul className="flex flex-col gap-1 pt-3 border-b border-gray-200 dark:border-gray-800">
          {branchList.map((branch) => (
            <li
              key={branch.id}
              onClick={() => setBranchId(branch.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                branchId === branch.id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              <Store
                className={`${
                  branchId === branch.id
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              />
              {branch.name}
            </li>
          ))}
        </ul>

        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 w-full text-left font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg
            className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497V14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497V5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501H14.3507V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609H18.5007C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609V18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007Z"
              fill=""
            />
          </svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
