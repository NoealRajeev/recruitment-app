// app/(protected)/dashboard/agency/requirements/page.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Clock, User, Calendar, Briefcase, MapPin, Flag } from "lucide-react";
import Link from "next/link";

interface JobRole {
  id: string;
  title: string;
  quantity: number;
  nationality: string;
  salary?: number;
  salaryCurrency: string;
  startDate: Date | null;
  contractDuration: string | null;
  location?: string;
  specialRequirements?: string;
}

interface Client {
  companyName: string;
  user: {
    name: string;
  };
}

interface Requirement {
  id: string;
  client: Client;
  status: string;
  generalNotes?: string;
  jobRoles: JobRole[];
}

const dummyRequirements: Requirement[] = [
  {
    id: "1",
    client: {
      companyName: "Qatar Construction Co.",
      user: {
        name: "Ahmed Al-Thani",
      },
    },
    status: "APPROVED",
    generalNotes:
      "All workers must pass safety certification before deployment",
    jobRoles: [
      {
        id: "101",
        title: "Mason",
        quantity: 5,
        nationality: "Nepal",
        salary: 1800,
        salaryCurrency: "QAR",
        startDate: new Date("2024-07-15"),
        contractDuration: "TWO_YEARS",
        location: "West Bay, Doha",
        specialRequirements: "Minimum 3 years high-rise experience",
      },
      {
        id: "102",
        title: "Electrician",
        quantity: 3,
        nationality: "India",
        salary: 2000,
        salaryCurrency: "QAR",
        startDate: new Date("2024-08-01"),
        contractDuration: "ONE_YEAR",
        location: "Lusail Site",
        specialRequirements: "Must have Qatar wiring certification",
      },
      {
        id: "103",
        title: "Crane Operator",
        quantity: 2,
        nationality: "Philippines",
        salary: 2500,
        salaryCurrency: "QAR",
        startDate: new Date("2024-07-20"),
        contractDuration: "THREE_YEARS",
        location: "West Bay, Doha",
        specialRequirements: "Certification for heavy machinery required",
      },
    ],
  },
  {
    id: "2",
    client: {
      companyName: "Gulf Hospitality Group",
      user: {
        name: "Fatima Al-Sulaiti",
      },
    },
    status: "APPROVED",
    jobRoles: [
      {
        id: "201",
        title: "Housekeeper",
        quantity: 10,
        nationality: "Philippines",
        salary: 1500,
        salaryCurrency: "QAR",
        startDate: new Date("2024-09-01"),
        contractDuration: "ONE_YEAR",
        location: "Lusail City Hotel",
      },
      {
        id: "202",
        title: "Waiter",
        quantity: 8,
        nationality: "Bangladesh",
        salary: 1600,
        salaryCurrency: "QAR",
        startDate: new Date("2024-08-15"),
        contractDuration: "TWO_YEARS",
        location: "Doha Marina Restaurant",
      },
    ],
  },
];

export default async function AssignedRequirements() {
  const requirements = dummyRequirements;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Under Review
          </Badge>
        );
      case "FULFILLED":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Fulfilled</Badge>
        );
      case "CLOSED":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Closed</Badge>;
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
        );
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Flexible";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (duration: string | null) => {
    switch (duration) {
      case "ONE_YEAR":
        return "1 Year";
      case "TWO_YEARS":
        return "2 Years";
      case "THREE_YEARS":
        return "3 Years";
      case "UNLIMITED":
        return "Open-ended";
      default:
        return "To be determined";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Assigned Requirements</h1>
        <div className="flex space-x-4">
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Sort</Button>
        </div>
      </div>

      {requirements.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-500">
            No requirements assigned to your agency yet
          </h2>
          <p className="mt-2 text-gray-400">
            Verified requirements from companies will appear here once assigned
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((requirement) => (
            <Card
              key={requirement.id}
              className="hover:shadow-lg transition-shadow border border-[#EDDDF3] bg-[#EDDDF3]/20"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{requirement.client.companyName}</CardTitle>
                  {getStatusBadge(requirement.status)}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <User className="h-4 w-4" />
                  <span>{requirement.client.user.name}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-t border-[#EDDDF3] pt-4">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Job Positions ({requirement.jobRoles.length})
                    </h3>
                    <div className="space-y-4">
                      {requirement.jobRoles.map((role) => (
                        <div
                          key={role.id}
                          className="pl-3 border-l-2 border-[#EDDDF3]"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{role.title}</h4>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Flag className="h-4 w-4 mr-1" />
                                {role.nationality}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium">
                                Qty: {role.quantity}
                              </span>
                              {role.salary && (
                                <div className="text-sm text-gray-500">
                                  {role.salary} {role.salaryCurrency}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-start space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium">Start: </span>
                                {formatDate(role.startDate)}
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium">Duration: </span>
                                {getDuration(role.contractDuration)}
                              </div>
                            </div>

                            {role.location && (
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium">Site: </span>
                                  {role.location}
                                </div>
                              </div>
                            )}

                            {role.specialRequirements && (
                              <div className="pt-2 text-xs text-gray-600">
                                <span className="font-medium">
                                  Requirements:{" "}
                                </span>
                                {role.specialRequirements}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {requirement.generalNotes && (
                    <div className="border-t border-[#EDDDF3] pt-4">
                      <h3 className="font-medium mb-2">General Notes</h3>
                      <p className="text-sm text-gray-600">
                        {requirement.generalNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Link
                      href={`/dashboard/agency/requirements/${requirement.id}`}
                    >
                      <Button size="sm">View Full Details</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
