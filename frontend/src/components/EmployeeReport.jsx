import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function EmployeeReport() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api("/employees")
      .then((data) => {
        console.log("Fetched employees:", data);
        setEmployees(data);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="card overflow-x-auto">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="h1">Employee Salary Report</h2>
        <span className="text-xs text-neutral-400">
          {employees.length} total
        </span>
      </div>

      <table className="min-w-full text-left text-sm">
        <thead className="text-neutral-400">
          <tr className="border-b border-neutral-800/80">
            <th className="py-2 pr-4">ID</th>
            <th className="py-2 pr-4">First Name</th>
            <th className="py-2 pr-4">Last Name</th>
            <th className="py-2 pr-4">Department</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2 pr-4">Hire Date</th>
            <th className="py-2 pr-4">Salary</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.employee_id} className="border-b border-neutral-900/40">
              <td className="py-3 pr-4 font-medium">{e.employee_id}</td>
              <td className="py-3 pr-4">{e.first_name}</td>
              <td className="py-3 pr-4">{e.last_name}</td>
              <td className="py-3 pr-4">{e.department_id ?? "-"}</td>
              <td className="py-3 pr-4">{e.role ?? "-"}</td>
              <td className="py-3 pr-4">
                {new Date(e.hire_date).toLocaleDateString()}
              </td>
              <td className="py-3 pr-4">${e.salary?.toLocaleString()}</td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td className="py-6 text-neutral-400" colSpan="7">
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
