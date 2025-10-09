export default function SidebarWidget() {
  return (
    <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 mb-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Text Content */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Developed by
        </p>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Projukti Sheba
        </h4>
      </div>
      
      {/* Button */}
      <a
        href="https://projuktisheba.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 flex-shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        Learn More
      </a>
    </div>
  );
}