import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";
export default function Unauthorized() {
  return (
    <>
    
      <div className="relative flex flex-col items-center justify-center min-h-screen p-3 overflow-hidden z-1">
        <GridShape />

        <div className="mx-auto w-full max-w-[260px] text-center sm:max-w-[520px]">
          <h1 className="mb-6 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
            Unauthorized
          </h1>
          <ShieldAlert className="mx-auto text-gray-400 dark:text-gray-500 w-24 h-24 sm:w-32 sm:h-32 mb-6" />

           <p className="mt-8 mb-4 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            You don't have permission to view this page.
          </p>

          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            If you believe this is an error, contact your administrator or try
            signing in with an account that has access.
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-4 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - ERP MINI
        </p>
      </div>
    </>
  );
}
