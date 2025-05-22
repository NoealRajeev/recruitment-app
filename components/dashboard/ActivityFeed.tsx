"use client";

const feed = [
  { time: "10:45 AM", message: "CV from XYZ Agency approved." },
  { time: "9:30 AM", message: "New request by Client ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "8:00 AM", message: "New agency partner XYZ onboarded." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "New agency partner XYZ onboarded." },
  { time: "10:45 AM", message: "CV from XYZ Agency approved." },
  { time: "9:30 AM", message: "New request by Client ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "8:00 AM", message: "New agency partner XYZ onboarded." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "New agency partner XYZ onboarded." },
  { time: "10:45 AM", message: "CV from XYZ Agency approved." },
  { time: "9:30 AM", message: "New request by Client ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "8:00 AM", message: "New agency partner XYZ onboarded." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "New agency partner XYZ onboarded." },
  { time: "10:45 AM", message: "CV from XYZ Agency approved." },
  { time: "9:30 AM", message: "New request by Client ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "8:00 AM", message: "New agency partner XYZ onboarded." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "Final documentation uploaded by agency ABC." },
  { time: "9:15 AM", message: "New agency partner XYZ onboarded." },
];

export default function ActivityFeed() {
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
          {feed.slice(0, 19).map((item, index) => (
            <div key={index} className="flex text-sm">
              <div className="w-24 text-gray-800 font-mono">{item.time}</div>
              <div className="flex items-center space-x-3">
                <div className="h-[1rem] w-[2px] bg-[#635372]/37 rounded-full" />
                <div className="text-gray-800">{item.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
