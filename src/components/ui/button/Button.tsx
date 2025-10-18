import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  size?: "xs" | "sm" | "md";
  variant?: "primary" | "secondary" | "dark" | "warning" | "info" | "outline" | "danger";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  disabled = false,
  className = "",
}) => {
  const sizeClasses = {
    xs: "px-3 py-2 text-xs",
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-xs hover:bg-brand-600 disabled:bg-brand-300 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-500",
    secondary:
      "bg-gray-500 text-white shadow-sm hover:bg-gray-600 disabled:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500",
    dark:
      "bg-gray-600 text-white shadow-sm hover:bg-gray-700 disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
    warning:
      "bg-yellow-400 text-gray-900 shadow-sm hover:bg-yellow-500 disabled:bg-yellow-200 dark:bg-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-600",
    info:
      "bg-[#65558F] text-white shadow-sm hover:bg-[#524374] disabled:bg-[#524374]/50 dark:bg-[#524374] dark:text-white dark:hover:bg-[#443363]",
    danger:
      "bg-red-500 text-white shadow-sm hover:bg-red-600 disabled:bg-red-300 dark:bg-red-600 dark:text-white dark:hover:bg-red-700",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${sizeClasses[size]} ${
        variantClasses[variant]
      } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
