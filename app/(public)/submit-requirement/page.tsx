"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/shared/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { Trash2 } from "lucide-react";

interface JobRole {
  title: string;
  quantity: number;
  nationality: string;
  languages: string[];
}

interface FormData {
  companyName: string;
  registrationNumber: string;
  sector: string;
  companySize: string;
  website: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  altContact: string;
  jobCategory: string;
  jobRoles: JobRole[];
  projectLocation: string;
  contractType: string;
  startDate: string;
  duration: string;
  workingHours?: string;
  accommodationProvided: boolean;
  transportationProvided: boolean;
  experienceLevel: string;
  languageRequirements: string[];
  certificationRequirements: string;
  specialRequirements: string;
  medicalRequirements: string;
}

interface Errors {
  [key: string]: string;
}

export default function SubmitRequirement() {
  const { language, setLanguage, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckInProgress, setEmailCheckInProgress] = useState(false);
  const [languageOptions, setLanguageOptions] = useState<string[]>(
    t.languageOptions || []
  );
  const [newLanguage, setNewLanguage] = useState("");

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    registrationNumber: "",
    sector: "",
    companySize: "",
    website: "",
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    altContact: "",
    jobCategory: "",
    jobRoles: [
      {
        title: "",
        quantity: 1,
        nationality: "",
        languages: [],
      },
    ],
    projectLocation: "",
    contractType: "",
    startDate: "",
    duration: "",
    accommodationProvided: false,
    transportationProvided: false,
    experienceLevel: "",
    languageRequirements: [],
    certificationRequirements: "",
    specialRequirements: "",
    medicalRequirements: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  const steps = t.steps;

  const solidWidths: Record<number, string> = {
    2: "calc(33.33% + 220px)",
    3: "calc(66.66% + 260px)",
    4: "2800px",
  };

  const validateRegistrationNumber = (value: string): boolean => {
    const regex = /^[A-Za-z0-9]{8,15}$/;
    return regex.test(value);
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(!["taken@example.com", "used@example.com"].includes(email));
      }, 500);
    });
  };

  const validateStep1 = async (): Promise<boolean> => {
    const newErrors: Errors = {};

    if (!formData.companyName) newErrors.companyName = t.required;
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = t.required;
    } else if (!validateRegistrationNumber(formData.registrationNumber)) {
      newErrors.registrationNumber = t.invalidRegistration;
    }
    if (!formData.sector) newErrors.sector = t.required;
    if (!formData.companySize) newErrors.companySize = t.required;
    if (!formData.fullName) newErrors.fullName = t.required;
    if (!formData.jobTitle) newErrors.jobTitle = t.required;

    if (!formData.email) {
      newErrors.email = t.required;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    } else {
      try {
        setEmailCheckInProgress(true);
        const isAvailable = await checkEmailAvailability(formData.email);
        if (!isAvailable) newErrors.email = t.emailInUse;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        newErrors.email = t.emailCheckError;
      } finally {
        setEmailCheckInProgress(false);
      }
    }

    if (!formData.phone) {
      newErrors.phone = t.required;
    } else if (
      !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
        formData.phone
      )
    ) {
      newErrors.phone = t.invalidPhone;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.jobCategory) newErrors.jobCategory = t.required;
    if (formData.jobRoles.some((role) => !role.title))
      newErrors.jobRoles = t.required;
    if (!formData.projectLocation) newErrors.projectLocation = t.required;
    if (!formData.contractType) newErrors.contractType = t.required;
    if (!formData.startDate) newErrors.startDate = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.experienceLevel) newErrors.experienceLevel = t.required;
    if (formData.languageRequirements.length === 0)
      newErrors.languageRequirements = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    let isValid = true;

    if (currentStep === 1) isValid = await validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();

    if (!isValid) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      setIsSubmitting(false);
    }, 800);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleJobRoleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes("languages")) {
      setFormData((prev) => {
        const updatedJobRoles = [...prev.jobRoles];
        const currentLanguages = Array.isArray(updatedJobRoles[index].languages)
          ? updatedJobRoles[index].languages
          : [];

        if (value && !currentLanguages.includes(value)) {
          updatedJobRoles[index] = {
            ...updatedJobRoles[index],
            languages: [...currentLanguages, value],
          };
        } else if (Array.isArray(value)) {
          updatedJobRoles[index] = {
            ...updatedJobRoles[index],
            languages: value,
          };
        }

        return { ...prev, jobRoles: updatedJobRoles };
      });
    } else {
      setFormData((prev) => {
        const updatedJobRoles = [...prev.jobRoles];
        updatedJobRoles[index] = {
          ...updatedJobRoles[index],
          [name.replace(`jobRoles[${index}].`, "")]: value,
        };
        return { ...prev, jobRoles: updatedJobRoles };
      });
    }
  };

  const addJobRole = () => {
    setFormData((prev) => ({
      ...prev,
      jobRoles: [
        ...prev.jobRoles,
        {
          title: "",
          quantity: 1,
          nationality: "",
          languages: [],
        },
      ],
    }));
  };

  const removeJobRole = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      jobRoles: prev.jobRoles.filter((_, i) => i !== index),
    }));
  };

  const toggleLanguageRequirement = (language: string) => {
    setFormData((prev) => {
      const exists = prev.languageRequirements.includes(language);
      const updated = exists
        ? prev.languageRequirements.filter((l) => l !== language)
        : [...prev.languageRequirements, language];
      return { ...prev, languageRequirements: updated };
    });
  };

  const handleAddLanguage = () => {
    const trimmedLang = newLanguage.trim();
    if (!trimmedLang) return;

    setLanguageOptions((prev) => {
      if (!prev.includes(trimmedLang)) {
        return [...prev, trimmedLang];
      }
      return prev;
    });

    setFormData((prev) => {
      if (!prev.languageRequirements.includes(trimmedLang)) {
        return {
          ...prev,
          languageRequirements: [...prev.languageRequirements, trimmedLang],
        };
      }
      return prev;
    });

    setNewLanguage("");
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    setIsSubmitting(true);
    setTimeout(() => {
      setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
      setIsSubmitting(false);
    }, 1000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                {t.companyProfile}
              </h1>
              <p className="text-base text-gray-700 mb-2">{t.knowMore}</p>
              <p className="text-xs text-gray-500 italic text-left">
                {t.sectionNoteCompany}
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.companyDetails}
                </h2>
                <Input
                  label={t.companyName}
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                  required
                  placeholder={t.companyNamePlaceholder}
                  id="companyName"
                />
                <Input
                  label={t.registrationNumber}
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  error={errors.registrationNumber}
                  required
                  placeholder={t.registrationNumberPlaceholder}
                  id="registrationNumber"
                />
                <Select
                  label={t.sector}
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  error={errors.sector}
                  required
                  options={
                    t.sectorOptions?.map((opt) => ({
                      value: opt.toLowerCase().replace(/\s+/g, "-"),
                      label: opt,
                    })) || []
                  }
                  id="sector"
                />
                <Select
                  label={t.companySize}
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  error={errors.companySize}
                  required
                  options={
                    t.companySizeOptions?.map((opt) => ({
                      value: opt.toLowerCase().replace(/\s+/g, "-"),
                      label: opt,
                    })) || []
                  }
                  id="companySize"
                />
                <Input
                  label={t.website}
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder={t.websitePlaceholder}
                  type="url"
                  id="website"
                />
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.contactPerson}
                </h2>
                <Input
                  label={t.fullName}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                  placeholder={t.fullNamePlaceholder}
                  id="fullName"
                />
                <Input
                  label={t.jobTitle}
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  error={errors.jobTitle}
                  required
                  placeholder={t.jobTitlePlaceholder}
                  id="jobTitle"
                />
                <Input
                  label={t.email}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder={t.emailPlaceholder}
                  type="email"
                  id="email"
                  loading={emailCheckInProgress}
                />
                <Input
                  label={t.phone}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  placeholder={t.phonePlaceholder}
                  type="tel"
                  id="phone"
                />
                <Input
                  label={t.altContact}
                  name="altContact"
                  value={formData.altContact}
                  onChange={handleChange}
                  placeholder={t.altContactPlaceholder}
                  type="tel"
                  id="altContact"
                />
              </div>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">{t.jobDetails}</h1>
              <p className="text-base text-gray-700 mb-2">
                {t.positionsNeeded}
              </p>
              <p className="text-xs text-gray-500 italic text-left">
                {t.sectionNoteJob}
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              <div className="col-span-6">
                <h2 className="text-3xl font-semibold mb-4 text-center">
                  {t.jobRoles}
                </h2>
                <div className="rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#4C187A]/85">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-2/5">
                          {t.jobRole}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6">
                          {t.quantity}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {t.nationality}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {t.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#2C0053]/10 divide-y divide-gray-200">
                      {formData.jobRoles.map((role, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 w-2/5 whitespace-nowrap">
                            <select
                              name={`jobRoles[${index}].title`}
                              value={role.title}
                              onChange={(e) => handleJobRoleChange(index, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                            >
                              <option value="">{t.selectOption}</option>
                              {t.jobPositions
                                ?.filter(
                                  (job) =>
                                    !formData.jobRoles.some(
                                      (r, i) => r.title === job && i !== index
                                    )
                                )
                                .map((job) => (
                                  <option key={job} value={job}>
                                    {job}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 w-1/6 whitespace-nowrap">
                            <input
                              type="number"
                              min="1"
                              name={`jobRoles[${index}].quantity`}
                              value={role.quantity}
                              onChange={(e) => handleJobRoleChange(index, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2C0053] focus:border-[#2C0053] sm:text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <AutocompleteInput
                              name={`jobRoles[${index}].nationality`}
                              value={role.nationality || ""}
                              onChangeValue={(val: string) =>
                                handleJobRoleChange(index, {
                                  target: {
                                    name: `jobRoles[${index}].nationality`,
                                    value: val,
                                  },
                                } as React.ChangeEvent<HTMLInputElement>)
                              }
                              options={t.nationalityOptions || []}
                              placeholder="Type nationality..."
                              className="w-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => removeJobRole(index)}>
                              <Trash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 text-left">
                  <Button
                    type="button"
                    variant="default"
                    disabled={formData.jobRoles.length === 0}
                    onClick={addJobRole}
                    className={
                      formData.jobRoles.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    {t.addAnotherRole}
                  </Button>
                </div>
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-4 space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    {t.workingHours}*
                  </h3>
                  <Input
                    name="workingHours"
                    value={formData.workingHours || ""}
                    onChange={handleChange}
                    type="time"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    {t.projectLocation}*
                  </h3>
                  <Input
                    name="projectLocation"
                    value={formData.projectLocation}
                    onChange={handleChange}
                    placeholder={t.projectLocationPlaceholder}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    {t.startDate}*
                  </h3>
                  <Input
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    type="date"
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                {t.workerRequirements}
              </h1>
              <p className="text-base text-gray-700 mb-2">{t.specifySkills}</p>
              <p className="text-xs text-gray-500 italic text-left">
                {t.sectionNoteRequirements}
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              <div className="col-span-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.languageRequirements}
                    <span className="text-[#FF0404] ml-1">*</span>
                  </label>

                  {errors.languageRequirements && (
                    <p className="text-sm text-[#FF0404] mb-2">
                      {errors.languageRequirements}
                    </p>
                  )}

                  <div className="space-y-2 mb-3">
                    {languageOptions.map((language) => (
                      <div key={language} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`lang-${language}`}
                          checked={formData.languageRequirements.includes(
                            language
                          )}
                          onChange={() => toggleLanguageRequirement(language)}
                          className="h-4 w-4 text-[#2C0053] focus:ring-[#2C0053] border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`lang-${language}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddLanguage();
                        }
                      }}
                      placeholder="Add another language"
                      className="w-full"
                    />
                  </div>
                </div>

                <Input
                  label={t.certificationRequirements}
                  name="certificationRequirements"
                  value={formData.certificationRequirements}
                  onChange={handleChange}
                  placeholder={t.certificationPlaceholder}
                  id="certificationRequirements"
                />

                <Input
                  label={t.medicalRequirements}
                  name="medicalRequirements"
                  value={formData.medicalRequirements}
                  onChange={handleChange}
                  placeholder={t.medicalPlaceholder}
                  id="medicalRequirements"
                />
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.additionalRequirements}
                </h2>

                <div>
                  <label
                    htmlFor="specialRequirements"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t.specialRequirements}
                  </label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C0053] focus:border-[#2C0053] bg-white"
                    placeholder={t.specialRequirementsPlaceholder}
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <Card className="p-6">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">{t.reviewTitle}</h1>
              <p className="text-base text-gray-700 mb-2">{t.verifyInfo}</p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              <div className="col-span-6 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.companyInformation}
                  </h2>
                  <ReviewField
                    label={t.companyName}
                    value={formData.companyName}
                  />
                  <ReviewField
                    label={t.registrationNumber}
                    value={formData.registrationNumber}
                  />
                  <ReviewField label={t.sector} value={formData.sector} />
                  <ReviewField
                    label={t.companySize}
                    value={formData.companySize}
                  />
                  <ReviewField
                    label={t.website}
                    value={formData.website || t.notProvided}
                  />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.contactPerson}
                  </h2>
                  <ReviewField label={t.fullName} value={formData.fullName} />
                  <ReviewField label={t.jobTitle} value={formData.jobTitle} />
                  <ReviewField label={t.email} value={formData.email} />
                  <ReviewField label={t.phone} value={formData.phone} />
                  <ReviewField
                    label={t.altContact}
                    value={formData.altContact || t.notProvided}
                  />
                </div>
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[2px] h-2/3 bg-[#2C0053]/30 rounded-full"></div>
              </div>

              <div className="col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.jobDetails}
                  </h2>
                  <ReviewField
                    label={t.jobCategory}
                    value={formData.jobCategory}
                  />

                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      {t.jobRoles}:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {formData.jobRoles.map((role, index) => (
                        <li key={index}>
                          {role.title} ({t.quantity}: {role.quantity})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ReviewField
                    label={t.projectLocation}
                    value={formData.projectLocation}
                  />
                  <ReviewField
                    label={t.contractType}
                    value={formData.contractType}
                  />
                  <ReviewField label={t.startDate} value={formData.startDate} />
                  <ReviewField label={t.duration} value={formData.duration} />
                  <ReviewField
                    label={t.benefits}
                    value={
                      [
                        formData.accommodationProvided
                          ? t.accommodations
                          : null,
                        formData.transportationProvided
                          ? t.transportation
                          : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || t.noneSpecified
                    }
                  />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    {t.requirements}
                  </h2>
                  <ReviewField
                    label={t.experienceLevel}
                    value={formData.experienceLevel}
                  />
                  <ReviewField
                    label={t.languagesRequired}
                    value={formData.languageRequirements.join(", ")}
                  />
                  <ReviewField
                    label={t.certifications}
                    value={
                      formData.certificationRequirements || t.noneSpecified
                    }
                  />
                  <ReviewField
                    label={t.medicalRequirements}
                    value={formData.medicalRequirements || t.noneSpecified}
                  />
                  <ReviewField
                    label={t.specialRequirements}
                    value={formData.specialRequirements || t.noneSpecified}
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
      <div className="w-[1500px] h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
        <div className="absolute top-4 right-4 z-20">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <div className="relative px-16 pt-10 pb-6">
          <div className="absolute inset-x-0 top-1/2 h-0.5 z-0">
            <div className="absolute -left-44 right-0 h-full flex w-full max-w-[1380px] mx-auto">
              <div
                className="h-full bg-[#2C0053] transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? "calc(20% - 35px)"
                      : solidWidths[currentStep as keyof typeof solidWidths] ||
                        "100%",
                }}
              />

              <div
                className="h-full border-t-2 border-dotted border-gray-300 transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? `calc(100% - 60px)`
                      : `calc(${
                          100 - ((currentStep - 1) / (steps.length - 1)) * 100
                        }% + 60px)`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between relative z-10 mt-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="text-center flex-1 max-w-[200px] relative"
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-full text-lg font-bold mb-3 flex items-center justify-center ${
                    currentStep >= step.id
                      ? "bg-[#2C0053] text-white"
                      : "bg-gray-200 text-gray-600"
                  } ${currentStep > step.id ? "ring-2 ring-[#2C0053]" : ""}`}
                  aria-current={currentStep === step.id ? "step" : undefined}
                >
                  {step.id}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-[#2C0053]" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
          {renderStepContent()}
          <div className="col-span-12 mt-6 flex justify-start">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                variant="outline"
                className="px-8 py-2 mr-10"
              >
                {t.back}
              </Button>
            )}

            <Button
              type="button"
              onClick={currentStep === steps.length ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className="px-8 py-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t.processing}
                </>
              ) : (
                t.continue
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewFieldProps {
  label: string;
  value: string;
}

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-600 mt-1">{value}</p>
    </div>
  );
}
