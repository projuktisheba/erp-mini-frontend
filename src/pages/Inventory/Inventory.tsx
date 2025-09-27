import React from "react";
import PageMeta from "../../components/common/PageMeta";


interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: string;
}

const dummyItems: Item[] = [
  { id: "ITM001", name: "Laptop", category: "Electronics", quantity: 10, price: "$1200" },
  { id: "ITM002", name: "Chair", category: "Furniture", quantity: 25, price: "$45" },
  { id: "ITM003", name: "Notebook", category: "Stationery", quantity: 100, price: "$2" },
];

const Inventory: React.FC = () => {
  return (
    <>
      <PageMeta title="Inventory | ERP Mini" description="Inventory Management" />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold dark:text-white">Inventory</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyItems.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold dark:text-white">{item.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">Category: {item.category}</p>
              <p className="text-gray-600 dark:text-gray-300">Quantity: {item.quantity}</p>
              <p className="text-gray-600 dark:text-gray-300">Price: {item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Inventory;
