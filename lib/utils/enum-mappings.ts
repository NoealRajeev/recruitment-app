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
  [translations[lang].sectorOptions[8]]: "OTHER",
});

// Update the getDisplaySectorMapping function in lib/utils/enum-mappings.ts
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
  OIL_GAS: translations[lang].sectorOptions[9], // Add this line
  TRANSPORTATION: translations[lang].sectorOptions[10], // Add this line
  OTHER: translations[lang].sectorOptions[11], // Update this line
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

// Contract duration mappings
export const getContractDurationEnumMapping = (lang: Language) => ({
  [translations[lang].contractDurationOptions[0]]: "ONE_YEAR",
  [translations[lang].contractDurationOptions[1]]: "TWO_YEARS",
  [translations[lang].contractDurationOptions[2]]: "UNLIMITED",
});

export const getDisplayContractDurationMapping = (lang: Language) => ({
  ONE_YEAR: translations[lang].contractDurationOptions[0],
  TWO_YEARS: translations[lang].contractDurationOptions[1],
  UNLIMITED: translations[lang].contractDurationOptions[2],
});

// Ticket details mappings
export const getTicketDetailsEnumMapping = (lang: Language) => ({
  [translations[lang].ticketDetailsOptions[0]]: "ONE_YEAR",
  [translations[lang].ticketDetailsOptions[1]]: "TWO_YEARS",
});

export const getDisplayTicketDetailsMapping = (lang: Language) => ({
  ONE_YEAR: translations[lang].ticketDetailsOptions[0],
  TWO_YEARS: translations[lang].ticketDetailsOptions[1],
});

// Previous experience mappings
export const getPreviousExperienceEnumMapping = (lang: Language) => ({
  [translations[lang].previousExperienceOptions[0]]: "FRESH",
  [translations[lang].previousExperienceOptions[1]]: "GCC_EXPERIENCE",
  [translations[lang].previousExperienceOptions[2]]: "LOCAL_EXPERIENCE",
  [translations[lang].previousExperienceOptions[3]]: "ANY",
});

export const getDisplayPreviousExperienceMapping = (lang: Language) => ({
  FRESH: translations[lang].previousExperienceOptions[0],
  GCC_EXPERIENCE: translations[lang].previousExperienceOptions[1],
  LOCAL_EXPERIENCE: translations[lang].previousExperienceOptions[2],
  ANY: translations[lang].previousExperienceOptions[3],
});
