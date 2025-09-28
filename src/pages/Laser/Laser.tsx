import { ReactNode } from "react";

interface Employee {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  status?: string;
}

interface LaserProps {
  employee: Employee;
}

const Laser = ({ employee }: LaserProps): ReactNode => {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        Laser Component
      </h2>
      <p>
        Employee Name: {employee.first_name} {employee.last_name}
      </p>
      <p>Email: {employee.email}</p>
      <p>Role: {employee.role}</p>
      <p>Status: {employee.status}</p>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        This is a placeholder for Laser functionality.
      </div>
    </div>
  );
};

export default Laser;
