import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import Swal from "sweetalert2";
import { AppContext } from "../../context/AppContext";

type Tab = "profile";

interface Measurement {
  length?: number;
  shoulder?: number;
  bust?: number;
  waist?: number;
  hip?: number;
  arm_hole?: number;
  sleeve_length?: number;
  sleeve_width?: number;
  round_width?: number;
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  tax_id: string;
  due_amount: number;
  status: string;
  measurement?: Measurement;
}

export default function CustomerProfile() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext not provided");
  }
  const { branchId } = context;

  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/mis/customer?id=${id}`, {
          headers: {
            "X-Branch-ID": branchId,
          },
        });
        setCustomer(res.data?.customer || null);
        setFormData(res.data?.customer || {});
      } catch (err) {
        console.error("Error fetching customer:", err);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomer();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.put(`/mis/customer`, formData, {
        headers: {
          "X-Branch-ID": branchId,
        },
      });

      setCustomer(res.data?.customer || formData);
      setIsEditing(false);
      Swal.fire("Success", "Customer updated successfully!", "success");
    } catch (err) {
      console.error("Error updating customer:", err);
      Swal.fire("Error", "Failed to update customer.", "error");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!customer) return <p>No customer found</p>;

  return (
    <>
      <PageMeta
        title={`Customer | ${customer.name}`}
        description="Customer profile page"
      />
      <PageBreadcrumb
        pageTitle={activeTab === "profile" ? "Customer Profile" : "Ledger"}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-5 gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-full font-medium ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "profile" && (
            <div>
              {/* Edit Mode */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Tax ID</label>
                    <input
                      type="text"
                      name="tax_id"
                      value={formData.tax_id || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Due Amount</label>
                    <input
                      type="number"
                      name="due_amount"
                      value={formData.due_amount || 0}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {customer.name}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {customer.mobile}
                  </p>
                  <p>
                    <strong>Address:</strong> {customer.address}
                  </p>
                  <p>
                    <strong>Tax ID:</strong> {customer.tax_id}
                  </p>
                  <p>
                    <strong>Due Amount:</strong> {customer.due_amount}
                  </p>
                  <p>
                    <strong>Status:</strong> {customer.status}
                  </p>
                  {customer.measurement && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Measurements</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(customer.measurement).map(
                          ([key, value]) =>
                            value !== undefined && (
                              <p key={key}>
                                <strong>{key}:</strong> {value}
                              </p>
                            )
                        )}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
