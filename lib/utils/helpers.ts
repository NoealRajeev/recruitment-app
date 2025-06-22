import { Requirement } from "../generated/prisma";

// lip/utils/helpers.ts
export default function logSecurityEvent(
  event: string,
  metadata: Record<string, unknown>
) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...metadata,
    })
  );
}
export const getContractDurationEnumMapping = (language: string) => {
  const mappings: Record<string, Record<string, string>> = {
    en: {
      ONE_MONTH: "1 Month",
      THREE_MONTHS: "3 Months",
      SIX_MONTHS: "6 Months",
      ONE_YEAR: "1 Year",
      TWO_YEARS: "2 Years",
      THREE_YEARS: "3 Years",
      FIVE_PLUS_YEARS: "5+ Years",
    },
    ar: {
      ONE_MONTH: "شهر واحد",
      THREE_MONTHS: "3 أشهر",
      SIX_MONTHS: "6 أشهر",
      ONE_YEAR: "سنة واحدة",
      TWO_YEARS: "سنتين",
      THREE_YEARS: "3 سنوات",
      FIVE_PLUS_YEARS: "5+ سنوات",
    },
  };

  return mappings[language] || mappings.en;
};

export const formatRequirementForView = (requirement: any): Requirement => {
  return {
    ...requirement,
    jobRoles: requirement.jobRoles.map((role: any) => ({
      ...role,
      startDate: new Date(role.startDate), // Convert string to Date
      contractDuration: role.contractDuration || null,
      salaryCurrency: role.salaryCurrency || null,
      foodAllowance: role.foodAllowance || null,
      housingAllowance: role.housingAllowance || null,
      transportationAllowance: role.transportationAllowance || null,
      mobileAllowance: role.mobileAllowance || null,
      natureOfWorkAllowance: role.natureOfWorkAllowance || null,
      otherAllowance: role.otherAllowance || null,
      totalExperienceYears: role.totalExperienceYears || null,
      preferredAge: role.preferredAge || null,
      specialRequirements: role.specialRequirements || null,
      assignedAgencyId: role.assignedAgencyId || null,
    })),
  };
};

export const validateRequirementData = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.jobRoles || data.jobRoles.length === 0) {
    errors.jobRoles = "At least one job role is required";
  }

  data.jobRoles.forEach((role: any, index: number) => {
    if (!role.title) {
      errors[`jobRoles[${index}].title`] = "Job title is required";
    }
    if (!role.quantity || role.quantity < 1) {
      errors[`jobRoles[${index}].quantity`] = "Valid quantity is required";
    }
    if (!role.nationality) {
      errors[`jobRoles[${index}].nationality`] = "Nationality is required";
    }
    if (!role.startDate) {
      errors[`jobRoles[${index}].startDate`] = "Start date is required";
    }
    if (!role.basicSalary || role.basicSalary <= 0) {
      errors[`jobRoles[${index}].basicSalary`] = "Basic salary is required";
    }
    if (!role.languageRequirements || role.languageRequirements.length === 0) {
      errors[`jobRoles[${index}].languageRequirements`] =
        "At least one language is required";
    }
  });

  return errors;
};
