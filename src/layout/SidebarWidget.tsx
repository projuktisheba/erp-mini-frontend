export default function SidebarWidget() {
  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-white shadow-md px-6 py-6 text-center dark:bg-gray-800">
      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        Developed By
      </h3>
      <p className="mb-4 text-gray-500 text-sm dark:text-gray-400">
        Projukti Sheba
      </p>
      <div className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-white text-sm font-medium hover:bg-blue-600 cursor-pointer">
        Learn More
      </div>
    </div>
  );
}
