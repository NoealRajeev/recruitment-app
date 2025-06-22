"use client";

import { format } from "date-fns";

interface ActivityFeedProps {
  activities: Array<{
    id: string;
    action: string;
    description: string;
    performedAt: Date;
    performedBy: {
      name: string;
    };
  }>;
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <>
      <div className="flex items-center space-x-3 pl-4 pb-5">
        <div className="h-[1.5rem] w-[3px] bg-[#635372]/37 rounded-full" />
        <h2 className="text-lg font-semibold text-[#2C0053]">
          Recent Activity Feed
        </h2>
      </div>
      <div className="bg-purple-100 p-4 rounded-xl shadow">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex text-sm">
              <div className="w-24 text-gray-800 font-mono">
                {format(new Date(activity.performedAt), "h:mm a")}
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-[1rem] w-[2px] bg-[#635372]/37 rounded-full" />
                <div className="text-gray-800">
                  {activity.description} (by {activity.performedBy.name})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ActivityFeed;
