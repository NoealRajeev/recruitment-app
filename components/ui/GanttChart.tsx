// components/ui/GanttChart.tsx
import React from "react";
import { LabourStage, StageStatus } from "@/lib/generated/prisma";

interface GanttChartProps {
  stages: {
    id: string;
    stage: LabourStage;
    status: StageStatus; // Use StageStatus enum type
    notes?: string | null;
    createdAt: Date;
    completedAt?: Date | null;
  }[];
}

const STAGE_ORDER: LabourStage[] = [
  LabourStage.DOCUMENTS,
  LabourStage.MEDICAL,
  LabourStage.QVC,
  LabourStage.POLICE_CLEARANCE,
  LabourStage.VISA,
  LabourStage.FLIGHT,
  LabourStage.ARRIVAL,
  LabourStage.WORK_PERMIT,
  LabourStage.CONTRACT,
  LabourStage.DEPLOYMENT,
];

const getStatusColor = (status: StageStatus) => {
  switch (status) {
    case StageStatus.COMPLETED:
      return "bg-green-500";
    case StageStatus.FAILED:
    case StageStatus.REJECTED:
      return "bg-red-500";
    case StageStatus.IN_PROGRESS:
      return "bg-yellow-500";
    case StageStatus.PENDING:
    default:
      return "bg-gray-300";
  }
};

const GanttChart: React.FC<GanttChartProps> = ({ stages }) => {
  // Sort stages according to predefined order and get the latest record for each stage
  const stageRecords = STAGE_ORDER.map((stage) => {
    const records = stages
      .filter((s) => s.stage === stage)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return records[0] || null;
  }).filter((stage): stage is NonNullable<typeof stage> => stage !== null);

  // Calculate progress percentage
  const completedStages = stageRecords.filter(
    (stage) => stage.status === StageStatus.COMPLETED
  ).length;
  const totalStages = STAGE_ORDER.length;
  const progressPercentage = Math.round((completedStages / totalStages) * 100);

  // Calculate timeline duration
  const firstDate = stageRecords[0]?.createdAt || new Date();
  const lastDate =
    stageRecords[stageRecords.length - 1]?.completedAt || new Date();
  const totalDuration =
    new Date(lastDate).getTime() - new Date(firstDate).getTime();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span>Overall Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 rounded-full bg-[#3D1673]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      {/* Timeline visualization */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{new Date(firstDate).toLocaleDateString()}</span>
            <span>{new Date(lastDate).toLocaleDateString()}</span>
          </div>

          <div className="h-4 rounded-full relative">
            {stageRecords.map((record) => {
              if (!record.completedAt) return null;

              const startPos =
                ((new Date(record.createdAt).getTime() -
                  new Date(firstDate).getTime()) /
                  totalDuration) *
                100;
              const width =
                ((new Date(record.completedAt).getTime() -
                  new Date(record.createdAt).getTime()) /
                  totalDuration) *
                100;

              return (
                <div
                  key={record.id}
                  className={`absolute h-4 rounded-full ${getStatusColor(record.status)}`}
                  style={{
                    left: `${startPos}%`,
                    width: `${width}%`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage details */}
      <div className="space-y-4">
        {STAGE_ORDER.map((stage) => {
          const records = stages
            .filter((s) => s.stage === stage)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
          const latestRecord = records[0];

          if (!latestRecord) return null;

          return (
            <div key={stage} className="flex items-start gap-4">
              <div
                className={`w-6 h-6 rounded-full mt-1 ${getStatusColor(latestRecord.status)}`}
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{stage.replace(/_/g, " ")}</h4>
                  <span className="text-xs text-gray-500">
                    {latestRecord.completedAt
                      ? `Completed: ${new Date(latestRecord.completedAt).toLocaleDateString()}`
                      : `Started: ${new Date(latestRecord.createdAt).toLocaleDateString()}`}
                  </span>
                </div>
                {latestRecord.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    {latestRecord.notes}
                  </p>
                )}
                {records.length > 1 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {records.length - 1} previous updates
                  </div>
                )}
                <div className=" border-b-[1px]"> </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GanttChart;
