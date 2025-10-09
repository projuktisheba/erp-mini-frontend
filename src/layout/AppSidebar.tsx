import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
// Assume these icons are imported from an icon library
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  TableIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { AppContext } from "../context/AppContext";

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
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    // subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  },
  {
    icon: <CalenderIcon />,
    name: "HR Management",
    subItems: [
      { name: "Worker List", path: "/worker-list" },
      { name: "Salesperson List", path: "/salesperson-list" },
      { name: "Add Employee ", path: "/add-employee", roles: ["chairman"] },
    ],
  },
  {
    name: "Orders",
    icon: <ListIcon />,
    subItems: [
      { name: "New Order", path: "/add-order" },
      { name: "Order List", path: "/orders" },
      {
        name: "Add Customer",
        path: "/add-customer",
      },
      {
        name: "Customer List",
        path: "/customer-list",
      },
         
    ],
  },
  {
    name: "Expenses",
    icon: <ListIcon />,
    roles:["chairman"],
    subItems: [    
      { name: "Material Purchase", path: "/materials-purchase", roles:["chairman"] },
      { name: "Employee Salary", path: "/employee-salary", roles:["chairman"] },
    ],
  },
  {
    name: "Reports",
    icon: <TableIcon />,
    subItems: [
      { name: "Branch Report", path: "/branch-report", pro: false },
      { name: "Employee Progress", path: "/employee-progress", pro: false },
      { name: "Worker Progress", path: "/worker-progress", pro: false },
    ],
  },
  // {
  //   name: "Settings",
  //   icon: <PageIcon />,
  //   subItems: [
  //     { name: "System Settings", path: "/system-settings", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not provided");
  const { userRole } = context;
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ index });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) =>
      prevOpenSubmenu?.index === index ? null : { index }
    );
  };

const renderMenuItems = (items: NavItem[]) => (
  <ul className="flex flex-col gap-4">
    {items
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((nav, index) => {
        // Filter subItems by roles
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
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
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
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
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
      ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
          ? "w-[290px]"
          : "w-[90px]"
      }
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ERP MINI
            </span>
          ) : (
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              EM
            </span>
          )}
        </Link>
      </div>

      {/* 1. This container is now a flex column to control its direct children */}
      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        {/* 2. The nav element will now grow to fill available space */}
        <nav className="flex-1">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>

        {/* 3. This widget is now pushed to the bottom by the growing nav */}
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
