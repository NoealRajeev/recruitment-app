"use client";

import { Select } from "../ui/select";

const projects = [
  {
    name: "Nelsa web developement",
    manager: "Om prakash sao",
    due: "May 25, 2023",
    status: "Completed",
    progress: 100,
    color: "green",
  },
  {
    name: "Datascale AI app",
    manager: "Neilsan mando",
    due: "Jun 20, 2023",
    status: "Delayed",
    progress: 35,
    color: "yellow",
  },
  {
    name: "Media channel branding",
    manager: "Tiruvelly priya",
    due: "July 13, 2023",
    status: "At risk",
    progress: 68,
    color: "red",
  },
  {
    name: "Corlax iOS app developement",
    manager: "Matte hannery",
    due: "Dec 20, 2023",
    status: "Completed",
    progress: 100,
    color: "green",
  },
  {
    name: "Nelsa web developement",
    manager: "Om prakash sao",
    due: "May 25, 2023",
    status: "Completed",
    progress: 100,
    color: "green",
  },
  {
    name: "Datascale AI app",
    manager: "Neilsan mando",
    due: "Jun 20, 2023",
    status: "Delayed",
    progress: 35,
    color: "yellow",
  },
  {
    name: "Media channel branding",
    manager: "Tiruvelly priya",
    due: "July 13, 2023",
    status: "At risk",
    progress: 68,
    color: "red",
  },
  {
    name: "Corlax iOS app developement",
    manager: "Matte hannery",
    due: "Dec 20, 2023",
    status: "Completed",
    progress: 100,
    color: "green",
  },
  {
    name: "Nelsa web developement",
    manager: "Om prakash sao",
    due: "May 25, 2023",
    status: "Completed",
    progress: 100,
    color: "green",
  },
  {
    name: "Datascale AI app",
    manager: "Neilsan mando",
    due: "Jun 20, 2023",
    status: "Delayed",
    progress: 35,
    color: "yellow",
  },
  {
    name: "Media channel branding",
    manager: "Tiruvelly priya",
    due: "July 13, 2023",
    status: "At risk",
    progress: 68,
    color: "red",
  },
  {
    name: "Corlax iOS app developement",
    manager: "Matte hannery",
    due: "Dec 20, 2023",
    status: "Completed",
    progress: 100,
    color: "green",
  },
  {
    name: "Nelsa web developement",
    manager: "Om prakash sao",
    due: "May 25, 2023",
    status: "Completed",
    progress: 100,
    color: "green",
  },
  {
    name: "Datascale AI app",
    manager: "Neilsan mando",
    due: "Jun 20, 2023",
    status: "Delayed",
    progress: 35,
    color: "yellow",
  },
  {
    name: "Media channel branding",
    manager: "Tiruvelly priya",
    due: "July 13, 2023",
    status: "At risk",
    progress: 68,
    color: "red",
  },
  {
    name: "Corlax iOS app developement",
    manager: "Matte hannery",
    due: "Dec 20, 2023",
    status: "Completed",
    progress: 100,
    color: "green",
  },
];

export default function ProjectSummary() {
  return (
    <div className="bg-purple-100 p-6 rounded-xl shadow mt-9">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Project summary</h2>
        <div className="flex gap-2">
          <Select
            label="Project"
            name="project"
            showLabelAsPlaceholder
            options={[
              { value: "project1", label: "Project 1" },
              { value: "project2", label: "Project 2" },
            ]}
            className="rounded-md p-1 text-sm border !h-8"
          />
          <Select
            label="Project Manager"
            name="projectManager"
            showLabelAsPlaceholder
            options={[
              { value: "manager1", label: "Manager 1" },
              { value: "manager2", label: "Manager 2" },
            ]}
            className="rounded-md p-1 text-sm border !h-8"
          />
          <Select
            label="Status"
            name="status"
            showLabelAsPlaceholder
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            className="rounded-md p-1 text-sm border !h-8"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">Name</th>
              <th>Project manager</th>
              <th>Due date</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {projects.slice(0, 9).map((p, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2">{p.name}</td>
                <td>{p.manager}</td>
                <td>{p.due}</td>
                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      p.color === "green"
                        ? "bg-green-100 text-green-700"
                        : p.color === "yellow"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="relative w-12 h-12">
                    <svg className="w-full h-full">
                      <circle
                        className="text-gray-300"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="transparent"
                        r="18"
                        cx="24"
                        cy="24"
                      />
                      <circle
                        className={`${
                          p.color === "green"
                            ? "text-green-500"
                            : p.color === "yellow"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                        strokeWidth="5"
                        strokeDasharray="113"
                        strokeDashoffset={(113 * (100 - p.progress)) / 100}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="18"
                        cx="24"
                        cy="24"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                      {p.progress}%
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
