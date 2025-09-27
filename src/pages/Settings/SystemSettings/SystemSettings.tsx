import React from "react";
import PageMeta from "../../../components/common/PageMeta";


interface SettingOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const dummySettings: SettingOption[] = [
  { id: "SYS001", title: "Enable Notifications", description: "Receive system notifications", enabled: true },
  { id: "SYS002", title: "Auto Backup", description: "Automatically backup system data daily", enabled: false },
  { id: "SYS003", title: "Dark Mode", description: "Toggle dark mode for the dashboard", enabled: true },
  { id: "SYS004", title: "Two-Factor Authentication", description: "Add extra security layer", enabled: false },
];

const SystemSettings: React.FC = () => {
  return (
    <>
      <PageMeta title="System Settings | ERP Mini" description="Manage system settings" />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold dark:text-white">System Settings</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummySettings.map((setting) => (
            <div
              key={setting.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold dark:text-white">{setting.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{setting.description}</p>
              </div>
              <div className="mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    readOnly
                    className="form-checkbox h-5 w-5 text-brand-500 dark:text-brand-400"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {setting.enabled ? "Enabled" : "Disabled"}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SystemSettings;
