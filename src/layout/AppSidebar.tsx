import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { AppContext } from "../context/AppContext";

// Correct Lucide icons
import {
  Calendar,
  ChevronDown,
  LayoutGrid,
  MoreHorizontal,
  List,
  Table,
  Users,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    roles?: string[];
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <LayoutGrid />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <Calendar />,
    name: "HR Management",
    subItems: [
      { name: "Worker List", path: "/worker-list" },
      { name: "Salesperson List", path: "/salesperson-list" },
      { name: "Add Employee", path: "/add-employee", roles: ["chairman"] },
    ],
  },
  {
    name: "Customer & Supplier",
    icon: <Users />,
    subItems: [
      { name: "Add Customer", path: "/add-customer", roles: ["chairman", "manager"] },
      { name: "Customer List", path: "/customer-list", roles: ["chairman", "manager"] },
      { name: "Add Supplier", path: "/add-supplier", roles: ["chairman"] },
      { name: "List Supplier", path: "/list-supplier", roles: ["chairman"] },
    ],
  },
  {
    name: "Orders",
    icon: <List />,
    subItems: [
      { name: "New Order", path: "/add-order" },
      { name: "Order List", path: "/orders" },
    ],
  },
  {
    name: "Stock Management",
    icon: <List />,
    subItems: [
      { name: "Restock Products", path: "/restock" },
      { name: "Sale Products", path: "/sale" },
    ],
  },
  {
    name: "Expenses",
    icon: <List />,
    roles: ["chairman"],
    subItems: [
      { name: "Material Purchase", path: "/materials-purchase", roles: ["chairman"] },
      { name: "Employee Salary", path: "/employee-salary", roles: ["chairman"] },
    ],
  },
  {
    name: "Reports",
    icon: <Table />,
    subItems: [
      { name: "Branch Report", path: "/branch-report", pro: false , roles: ["chairman"] },
      { name: "Purchase Report", path: "/purchase-report", pro: false , roles: ["chairman"] },
      { name: "Sales Report", path: "/sales-report", pro: false , roles: ["chairman"] },
      { name: "Stock Report", path: "/stock-report", pro: false , roles: ["chairman"] },
      { name: "Salesperson Progress", path: "/salesperson-progress", pro: false, roles: ["chairman"] },
      { name: "Worker Progress", path: "/worker-progress", pro: false , roles: ["chairman","manager"] },
      { name: "Salary Reports", path: "/salary-report", pro: false , roles: ["chairman"] },
      { name: "Transaction Reports", path: "/transaction-report", pro: false , roles: ["chairman"] },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { userRole } = context;

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{ index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((subItem) => {
        if (isActive(subItem.path)) {
          setOpenSubmenu({ index });
          submenuMatched = true;
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) =>
      prev?.index === index ? null : { index }
    );
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items
        .filter((item) => !item.roles || item.roles.includes(userRole))
        .map((nav, index) => {
          const filteredSubItems = nav.subItems?.filter(
            (sub) => !sub.roles || sub.roles.includes(userRole)
          );

          return (
            <li key={nav.name}>
              {filteredSubItems && filteredSubItems.length > 0 ? (
                <button
                  onClick={() => handleSubmenuToggle(index)}
                  className={`menu-item group ${
                    openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size  ${
                      openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDown
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    className={`menu-item group ${
                      isActive(nav.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        isActive(nav.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                )
              )}

              {filteredSubItems && filteredSubItems.length > 0 && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.index === index
                        ? `${subMenuHeight[`${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {filteredSubItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">ERP MINI</span>
          ) : (
            <span className="text-xl font-bold text-gray-900 dark:text-white">EM</span>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <nav className="flex-1">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <MoreHorizontal className="size-6" />}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;
