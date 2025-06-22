// lib/utils/enum-mappings.ts
import { translations } from "./translations";

type Language = keyof typeof translations;

// Sector mappings
export const getSectorEnumMapping = (lang: Language) => ({
  [translations[lang].sectorOptions[0]]: "IT",
  [translations[lang].sectorOptions[1]]: "REAL_ESTATE",
  [translations[lang].sectorOptions[2]]: "HEALTHCARE",
  [translations[lang].sectorOptions[3]]: "FINANCE",
  [translations[lang].sectorOptions[4]]: "MANUFACTURING",
  [translations[lang].sectorOptions[5]]: "RETAIL",
  [translations[lang].sectorOptions[6]]: "CONSTRUCTION",
  [translations[lang].sectorOptions[7]]: "EDUCATION",
  [translations[lang].sectorOptions[8]]: "HOSPITALITY",
  [translations[lang].sectorOptions[9]]: "OIL_GAS",
  [translations[lang].sectorOptions[10]]: "TRANSPORTATION",
  [translations[lang].sectorOptions[11]]: "OTHER",
});

export const getDisplaySectorMapping = (lang: Language) => ({
  IT: translations[lang].sectorOptions[0],
  REAL_ESTATE: translations[lang].sectorOptions[1],
  HEALTHCARE: translations[lang].sectorOptions[2],
  FINANCE: translations[lang].sectorOptions[3],
  MANUFACTURING: translations[lang].sectorOptions[4],
  RETAIL: translations[lang].sectorOptions[5],
  CONSTRUCTION: translations[lang].sectorOptions[6],
  EDUCATION: translations[lang].sectorOptions[7],
  HOSPITALITY: translations[lang].sectorOptions[8],
  OIL_GAS: translations[lang].sectorOptions[9],
  TRANSPORTATION: translations[lang].sectorOptions[10],
  OTHER: translations[lang].sectorOptions[11],
});

// Company size mappings
export const getCompanySizeEnumMapping = (lang: Language) => ({
  [translations[lang].companySizeOptions[0]]: "SMALL",
  [translations[lang].companySizeOptions[1]]: "MEDIUM",
  [translations[lang].companySizeOptions[2]]: "LARGE",
  [translations[lang].companySizeOptions[3]]: "ENTERPRISE",
});

export const getDisplayCompanySizeMapping = (lang: Language) => ({
  SMALL: translations[lang].companySizeOptions[0],
  MEDIUM: translations[lang].companySizeOptions[1],
  LARGE: translations[lang].companySizeOptions[2],
  ENTERPRISE: translations[lang].companySizeOptions[3],
});

// Contract duration mappings - Updated to match Prisma enum
export const getContractDurationEnumMapping = (lang: Language) => ({
  [translations[lang].contractDurationOptions[0]]: "ONE_MONTH",
  [translations[lang].contractDurationOptions[1]]: "THREE_MONTHS",
  [translations[lang].contractDurationOptions[2]]: "SIX_MONTHS",
  [translations[lang].contractDurationOptions[3]]: "ONE_YEAR",
  [translations[lang].contractDurationOptions[4]]: "TWO_YEARS",
  [translations[lang].contractDurationOptions[5]]: "THREE_YEARS",
  [translations[lang].contractDurationOptions[6]]: "FIVE_PLUS_YEARS",
});

export const getDisplayContractDurationMapping = (lang: Language) => ({
  ONE_MONTH: translations[lang].contractDurationOptions[0],
  THREE_MONTHS: translations[lang].contractDurationOptions[1],
  SIX_MONTHS: translations[lang].contractDurationOptions[2],
  ONE_YEAR: translations[lang].contractDurationOptions[3],
  TWO_YEARS: translations[lang].contractDurationOptions[4],
  THREE_YEARS: translations[lang].contractDurationOptions[5],
  FIVE_PLUS_YEARS: translations[lang].contractDurationOptions[6],
});

// Requirement status mappings
export const getRequirementStatusEnumMapping = (lang: Language) => ({
  [translations[lang].requirementStatusOptions[0]]: "SUBMITTED",
  [translations[lang].requirementStatusOptions[1]]: "UNDER_REVIEW",
  [translations[lang].requirementStatusOptions[2]]: "FORWARDED",
  [translations[lang].requirementStatusOptions[3]]: "ACCEPTED",
  [translations[lang].requirementStatusOptions[4]]: "REJECTED",
  [translations[lang].requirementStatusOptions[5]]: "COMPLETED",
});

export const getDisplayRequirementStatusMapping = (lang: Language) => ({
  SUBMITTED: translations[lang].requirementStatusOptions[0],
  UNDER_REVIEW: translations[lang].requirementStatusOptions[1],
  FORWARDED: translations[lang].requirementStatusOptions[2],
  ACCEPTED: translations[lang].requirementStatusOptions[3],
  REJECTED: translations[lang].requirementStatusOptions[4],
  COMPLETED: translations[lang].requirementStatusOptions[5],
});

// Previous experience mappings - Updated to match Prisma schema
export const getPreviousExperienceEnumMapping = (lang: Language) => ({
  [translations[lang].previousExperienceOptions[0]]: "GCC",
  [translations[lang].previousExperienceOptions[1]]: "QATAR",
  [translations[lang].previousExperienceOptions[2]]: "OVERSEAS",
});

export const getDisplayPreviousExperienceMapping = (lang: Language) => ({
  GCC: translations[lang].previousExperienceOptions[0],
  QATAR: translations[lang].previousExperienceOptions[1],
  OVERSEAS: translations[lang].previousExperienceOptions[2],
});

// User role mappings
export const getUserRoleEnumMapping = (lang: Language) => ({
  [translations[lang].userRoleOptions[0]]: "RECRUITMENT_ADMIN",
  [translations[lang].userRoleOptions[1]]: "CLIENT_ADMIN",
  [translations[lang].userRoleOptions[2]]: "RECRUITMENT_AGENCY",
});

export const getDisplayUserRoleMapping = (lang: Language) => ({
  RECRUITMENT_ADMIN: translations[lang].userRoleOptions[0],
  CLIENT_ADMIN: translations[lang].userRoleOptions[1],
  RECRUITMENT_AGENCY: translations[lang].userRoleOptions[2],
});

// Account status mappings
export const getAccountStatusEnumMapping = (lang: Language) => ({
  [translations[lang].accountStatusOptions[0]]: "SUBMITTED",
  [translations[lang].accountStatusOptions[1]]: "VERIFIED",
  [translations[lang].accountStatusOptions[2]]: "REJECTED",
  [translations[lang].accountStatusOptions[3]]: "NOT_VERIFIED",
  [translations[lang].accountStatusOptions[4]]: "SUSPENDED",
});

export const getDisplayAccountStatusMapping = (lang: Language) => ({
  SUBMITTED: translations[lang].accountStatusOptions[0],
  VERIFIED: translations[lang].accountStatusOptions[1],
  REJECTED: translations[lang].accountStatusOptions[2],
  NOT_VERIFIED: translations[lang].accountStatusOptions[3],
  SUSPENDED: translations[lang].accountStatusOptions[4],
});
