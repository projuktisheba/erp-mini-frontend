import { useState, useEffect, useContext, useRef } from "react";
import { Store } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import { API_BASE_URL } from "../../config/apiConfig";

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

  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user data from localStorage
  useEffect(() => {
    const user = localStorage.getItem("userData");
    if (user) {
      const parsed = JSON.parse(user);
      setUserData({
        id: parsed.id?.toString() || "",
        name: `${parsed.name || ""}`.trim(),
        email: parsed.email || "",
        avatar_link: parsed.avatar_link || "",
      });
    }
  }, []);

  // Load saved branch from localStorage
  useEffect(() => {
    const savedBranch = localStorage.getItem("branchId");
    if (savedBranch) setBranchId(Number(savedBranch));
  }, [setBranchId]);

  const displayName = userData?.name || "User";
  const branchName = branchList[branchId-1] || ""
  const displayEmail = userData?.email || "user@example.com";
  const profileImage = userData?.avatar_link
    ? `${API_BASE_URL}${userData.avatar_link}`
    : "https://i.postimg.cc/kG1Byx5n/photo-1740252117044-2af197eea287.avif";

  const role = JSON.parse(localStorage.getItem("userData") || "{}")?.role || "";
  const userBranchId = JSON.parse(
    localStorage.getItem("userData") || "{}"
  )?.branch_id;

  const visibleBranches =
    role === "manager"
      ? branchList.filter((b) => b.id === userBranchId)
      : role === "chairman"
      ? branchList
      : [];

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering outside click
    setIsOpen(!isOpen);
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleBranchSelect = (id: number) => {
    setBranchId(id);
    localStorage.setItem("branchId", id.toString());
  };

  return (
    <div className="relative">
      {/* Dropdown toggle */}
      <button
        ref={toggleButtonRef}
        onClick={toggleDropdown}
        className={`flex items-center rounded-full p-1 transition-shadow duration-200 ${
          isOpen ? "shadow-lg ring-2 ring-blue-500" : "hover:shadow-md"
        }`}
      >
        <span className="mr-3 h-11 w-11 overflow-hidden rounded-full">
          <img
            src={profileImage}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </span>
        <span className="font-medium text-theme-sm text-gray-700 dark:text-gray-400">
          {branchName.name}
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
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-dark z-50"
        >
          {/* User info + Edit button */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {displayName}
              </span>
              <span className="text-gray-500 text-sm dark:text-gray-400">
                {displayEmail}
              </span>
            </div>
          </div>

          {/* Branch selector */}
          {visibleBranches.length > 0 && (
            <ul className="flex flex-col gap-1 p-2 border-b border-gray-200 dark:border-gray-800 mb-2">
              {visibleBranches.map((branch) => (
                <li
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    branchId === branch.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-50 dark:hover:bg-white/5"
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
          )}

          {/* Sign out button */}
          <button
            onClick={handleSignOut}
            className="w-full text-center text-sm font-medium px-3 py-1 mt-2 rounded-full border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-200"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
