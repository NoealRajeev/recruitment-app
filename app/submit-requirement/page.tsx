"use client";
import { useState, useEffect } from "react";

export default function SubmitRequirement() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState("en");
  const [emailCheckInProgress, setEmailCheckInProgress] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1 - Company Info
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

    // Step 2 - Job Details
    jobCategory: "",
    jobRoles: [
      {
        title: "",
        quantity: 1,
        experience: "",
        languages: [], // Ensure this is initialized as empty array
      },
    ],
    projectLocation: "",
    contractType: "",
    startDate: "",
    duration: "",
    accommodationProvided: false,
    transportationProvided: false,

    // Step 3 - Requirements
    experienceLevel: "",
    languageRequirements: [],
    certificationRequirements: "",
    specialRequirements: "",
    medicalRequirements: "",
  });
  const [errors, setErrors] = useState({});

  // Translation dictionary
  const translations = {
    en: {
      formTitle: "Submit Your Requirement",
      steps: [
        { id: 1, label: "Company Info" },
        { id: 2, label: "Job Details" },
        { id: 3, label: "Requirements" },
        { id: 4, label: "Review" },
      ],
      companyProfile: "Company Profile",
      knowMore: "Let us know more about you.",
      companyDetails: "Company Details",
      contactPerson: "Contact Person",
      jobDetails: "Position Requirements",
      positionsNeeded: "Let’s match the right talent to your roles.",
      workerRequirements: "Employment Terms",
      specifySkills: "Define the working conditions",
      reviewTitle: "Submission & Review",
      verifyInfo: "Please verify all information before submitting.",
      back: "Back",
      continue: "Continue",
      submit: "Submit",
      processing: "Processing...",
      required: "Required",
      addAnotherRole: "+ Add Another Role",
      accommodations: "Accommodation provided",
      transportation: "Transportation provided",
      // Add more translations as needed
    },
    ar: {
      formTitle: "تقديم متطلباتك",
      steps: [
        { id: 1, label: "معلومات الشركة" },
        { id: 2, label: "تفاصيل الوظيفة" },
        { id: 3, label: "المتطلبات" },
        { id: 4, label: "مراجعة" },
      ],
      // Add more Arabic translations
    },
  };

  const t = translations[language];

  const steps = t.steps;

  const solidWidths = {
    2: "calc(33.33% + 220px)",
    3: "calc(66.66% + 260px)",
    4: "2800px",
  };

  // Enhanced validation functions
  const validateRegistrationNumber = (value) => {
    // Basic example - adjust based on your country's format
    const regex = /^[A-Za-z0-9]{8,15}$/;
    return regex.test(value);
  };

  const checkEmailAvailability = async (email) => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(!["taken@example.com", "used@example.com"].includes(email));
      }, 500);
    });
  };

  const validateStep1 = async () => {
    const newErrors = {};

    if (!formData.companyName) newErrors.companyName = t.required;
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = t.required;
    } else if (!validateRegistrationNumber(formData.registrationNumber)) {
      newErrors.registrationNumber = "Invalid registration number format";
    }
    if (!formData.sector) newErrors.sector = t.required;
    if (!formData.companySize) newErrors.companySize = t.required;
    if (!formData.fullName) newErrors.fullName = t.required;
    if (!formData.jobTitle) newErrors.jobTitle = t.required;

    if (!formData.email) {
      newErrors.email = t.required;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else {
      try {
        setEmailCheckInProgress(true);
        const isAvailable = await checkEmailAvailability(formData.email);
        if (!isAvailable) newErrors.email = "Email is already in use";
      } catch (error) {
        newErrors.email = "Error verifying email";
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
      newErrors.phone = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.jobCategory) newErrors.jobCategory = t.required;
    if (formData.jobRoles.some((role) => !role.title))
      newErrors.jobRoles = "All roles must have a title";
    if (!formData.projectLocation) newErrors.projectLocation = t.required;
    if (!formData.contractType) newErrors.contractType = t.required;
    if (!formData.startDate) newErrors.startDate = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.experienceLevel) newErrors.experienceLevel = t.required;
    if (formData.languageRequirements.length === 0)
      newErrors.languageRequirements = "At least one language required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
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

  // Form data handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleJobRoleChange = (index, e) => {
    const { name, value } = e.target;

    // Special handling for languages array
    if (name.includes("languages")) {
      setFormData((prev) => {
        const updatedJobRoles = [...prev.jobRoles];
        const currentLanguages = Array.isArray(updatedJobRoles[index].languages)
          ? updatedJobRoles[index].languages
          : [];

        // Handle adding new language
        if (value && !currentLanguages.includes(value)) {
          updatedJobRoles[index] = {
            ...updatedJobRoles[index],
            languages: [...currentLanguages, value],
          };
        }
        // Handle removing language (when value is an array from the remove action)
        else if (Array.isArray(value)) {
          updatedJobRoles[index] = {
            ...updatedJobRoles[index],
            languages: value,
          };
        }

        return { ...prev, jobRoles: updatedJobRoles };
      });
    } else {
      // Normal handling for other fields
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
          experience: "",
          languages: [],
        },
      ],
    }));
  };

  const removeJobRole = (index) => {
    setFormData((prev) => ({
      ...prev,
      jobRoles: prev.jobRoles.filter((_, i) => i !== index),
    }));
  };

  const toggleLanguageRequirement = (language) => {
    setFormData((prev) => {
      const updatedLanguages = prev.languageRequirements.includes(language)
        ? prev.languageRequirements.filter((lang) => lang !== language)
        : [...prev.languageRequirements, language];
      return { ...prev, languageRequirements: updatedLanguages };
    });
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    setIsSubmitting(true);
    setTimeout(() => {
      setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
      setIsSubmitting(false);
    }, 1000);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Company Info
        return (
          <>
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                {t.companyProfile}
              </h1>
              <p className="text-base text-gray-700 mb-2">{t.knowMore}</p>
              <p className="text-xs text-gray-500 italic text-left">
                *This section collects essential information about the company
                requesting foreign labour.
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              {/* Left Column */}
              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.companyDetails}
                </h2>
                <InputField
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                  required
                  placeholder="Enter company name"
                  id="companyName"
                  t={t}
                />
                <InputField
                  label="Company Registration Number"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  error={errors.registrationNumber}
                  required
                  placeholder="Enter registration number"
                  id="registrationNumber"
                  t={t}
                />
                <SelectField
                  label="Sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  error={errors.sector}
                  required
                  options={[
                    "Construction",
                    "Manufacturing",
                    "Hospitality",
                    "Healthcare",
                    "Other",
                  ]}
                  id="sector"
                  t={t}
                />
                <SelectField
                  label="Company Size"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  error={errors.companySize}
                  required
                  options={[
                    "1-50 employees",
                    "51-200 employees",
                    "201-500 employees",
                    "500+ employees",
                  ]}
                  id="companySize"
                  t={t}
                />
                <InputField
                  label="Company Website (optional)"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Website link"
                  type="url"
                  id="website"
                  t={t}
                />
              </div>

              {/* Divider */}
              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[4px] h-2/3 bg-gray-300 rounded-full"></div>
              </div>

              {/* Right Column */}
              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.contactPerson}
                </h2>
                <InputField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                  placeholder="Enter your full name"
                  id="fullName"
                  t={t}
                />
                <InputField
                  label="Job Title"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  error={errors.jobTitle}
                  required
                  placeholder="Enter your job title"
                  id="jobTitle"
                  t={t}
                />
                <InputField
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="Enter your email address"
                  type="email"
                  id="email"
                  loading={emailCheckInProgress}
                  t={t}
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  placeholder="Enter your phone number"
                  type="tel"
                  id="phone"
                  t={t}
                />
                <InputField
                  label="Alternative Contact (optional)"
                  name="altContact"
                  value={formData.altContact}
                  onChange={handleChange}
                  placeholder="Enter alternate contact"
                  type="tel"
                  id="altContact"
                  t={t}
                />
              </div>
            </div>
          </>
        );

      case 2: // Job Details
        return (
          <>
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">{t.jobDetails}</h1>
              <p className="text-base text-gray-700 mb-2">
                {t.positionsNeeded}
              </p>
              <p className="text-xs text-gray-500 italic text-left">
                *This section specifies about the job positions and worker
                qualifications needed.
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              {/* Left Column - Job Roles Table */}
              <div className="col-span-6">
                <h2 className="text-lg font-semibold mb-4">Job Roles</h2>
                <div className="rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                          {" "}
                          {/* Increased width */}
                          Job role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          {" "}
                          {/* Reduced width */}
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Experience
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Languages
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.jobRoles.map((role, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 w-2/5 whitespace-nowrap">
                            <select
                              name={`jobRoles[${index}].title`}
                              value={role.title}
                              onChange={(e) => handleJobRoleChange(index, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            >
                              <option value="">Select</option>
                              {[
                                "Carpenter",
                                "Electrician",
                                "Plumber",
                                "Welder",
                                "Driver",
                                "Cleaner",
                                "Cook",
                              ]
                                .filter(
                                  (job) =>
                                    !formData.jobRoles.some(
                                      (r, i) => r.title === job && i !== index // Fixed filtering to exclude current role
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              name={`jobRoles[${index}].experience`}
                              value={role.experience || ""}
                              onChange={(e) => handleJobRoleChange(index, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            >
                              <option value="">Select</option>
                              <option value="0-2 years">0-2 years</option>
                              <option value="2-5 years">2-5 years</option>
                              <option value="5+ years">5+ years</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              placeholder="Type language and press Enter"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const newLanguage = e.target.value.trim();
                                  if (newLanguage) {
                                    handleJobRoleChange(index, {
                                      target: {
                                        name: `jobRoles[${index}].languages`,
                                        value: newLanguage,
                                      },
                                    });
                                    e.target.value = "";
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Array.isArray(role.languages) &&
                                role.languages.map((lang, langIndex) => (
                                  <span
                                    key={langIndex}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                  >
                                    {lang}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedLanguages =
                                          role.languages.filter(
                                            (_, i) => i !== langIndex
                                          );
                                        handleJobRoleChange(index, {
                                          target: {
                                            name: `jobRoles[${index}].languages`,
                                            value: updatedLanguages,
                                          },
                                        });
                                      }}
                                      className="ml-1.5 inline-flex text-purple-600 hover:text-purple-900"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => removeJobRole(index)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 text-left">
                  <button
                    type="button"
                    onClick={addJobRole}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    + Add Role
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[4px] h-2/3 bg-gray-300 rounded-full"></div>
              </div>

              {/* Right Column - Job Details */}
              <div className="col-span-4 space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    Working Hours / Day*
                  </h3>
                  <InputField
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    type="time"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    Project Location*
                  </h3>
                  <InputField
                    name="projectLocation"
                    value={formData.projectLocation}
                    onChange={handleChange}
                    placeholder="Enter project location"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    Start Date*
                  </h3>
                  <InputField
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    type="date"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    Special Requirements (optional)
                  </h3>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Special requirements if any"
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 3: // Requirements
        return (
          <>
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">
                {t.workerRequirements}
              </h1>
              <p className="text-base text-gray-700 mb-2">{t.specifySkills}</p>
              <p className="text-xs text-gray-500 italic text-left">
                *This section helps us match the best candidates to your needs.
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              {/* Left Column */}
              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">Qualifications</h2>

                <SelectField
                  label="Experience Level"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  error={errors.experienceLevel}
                  required
                  options={[
                    "Entry Level (0-2 years)",
                    "Mid Level (2-5 years)",
                    "Senior Level (5+ years)",
                  ]}
                  id="experienceLevel"
                  t={t}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language Requirements
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  {errors.languageRequirements && (
                    <p className="text-sm text-red-600 mb-2">
                      {errors.languageRequirements}
                    </p>
                  )}
                  <div className="space-y-2">
                    {["English", "Arabic", "Hindi", "Urdu", "Tagalog"].map(
                      (language) => (
                        <div key={language} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`lang-${language}`}
                            checked={formData.languageRequirements.includes(
                              language
                            )}
                            onChange={() => toggleLanguageRequirement(language)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`lang-${language}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {language}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <InputField
                  label="Certification Requirements"
                  name="certificationRequirements"
                  value={formData.certificationRequirements}
                  onChange={handleChange}
                  placeholder="e.g., OSHA, CPR, etc."
                  id="certificationRequirements"
                  t={t}
                />

                <InputField
                  label="Medical Requirements"
                  name="medicalRequirements"
                  value={formData.medicalRequirements}
                  onChange={handleChange}
                  placeholder="e.g., Drug-free, Vaccinations, etc."
                  id="medicalRequirements"
                  t={t}
                />
              </div>

              {/* Divider */}
              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[4px] h-2/3 bg-gray-300 rounded-full"></div>
              </div>

              {/* Right Column */}
              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  Additional Requirements
                </h2>

                <div>
                  <label
                    htmlFor="specialRequirements"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Special Requirements
                  </label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    placeholder="Any specific skills, tools knowledge, or other special requirements"
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 4: // Review
        return (
          <>
            <div className="text-center mb-2">
              <h1 className="text-2xl font-semibold mb-1">{t.reviewTitle}</h1>
              <p className="text-base text-gray-700 mb-2">{t.verifyInfo}</p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-6">
              {/* Left Column */}
              <div className="col-span-6 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    Company Information
                  </h2>
                  <ReviewField
                    label="Company Name"
                    value={formData.companyName}
                  />
                  <ReviewField
                    label="Registration Number"
                    value={formData.registrationNumber}
                  />
                  <ReviewField label="Sector" value={formData.sector} />
                  <ReviewField
                    label="Company Size"
                    value={formData.companySize}
                  />
                  <ReviewField
                    label="Website"
                    value={formData.website || "Not provided"}
                  />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    Contact Person
                  </h2>
                  <ReviewField label="Full Name" value={formData.fullName} />
                  <ReviewField label="Job Title" value={formData.jobTitle} />
                  <ReviewField label="Email" value={formData.email} />
                  <ReviewField label="Phone" value={formData.phone} />
                  <ReviewField
                    label="Alternative Contact"
                    value={formData.altContact || "Not provided"}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[4px] h-full bg-gray-300 rounded-full"></div>
              </div>

              {/* Right Column */}
              <div className="col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    Job Details
                  </h2>
                  <ReviewField
                    label="Job Category"
                    value={formData.jobCategory}
                  />

                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Job Roles:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {formData.jobRoles.map((role, index) => (
                        <li key={index}>
                          {role.title} (Qty: {role.quantity})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ReviewField
                    label="Project Location"
                    value={formData.projectLocation}
                  />
                  <ReviewField
                    label="Contract Type"
                    value={formData.contractType}
                  />
                  <ReviewField label="Start Date" value={formData.startDate} />
                  <ReviewField label="Duration" value={formData.duration} />
                  <ReviewField
                    label="Benefits"
                    value={
                      [
                        formData.accommodationProvided ? "Accommodation" : null,
                        formData.transportationProvided
                          ? "Transportation"
                          : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || "None specified"
                    }
                  />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                    Requirements
                  </h2>
                  <ReviewField
                    label="Experience Level"
                    value={formData.experienceLevel}
                  />
                  <ReviewField
                    label="Languages Required"
                    value={formData.languageRequirements.join(", ")}
                  />
                  <ReviewField
                    label="Certifications"
                    value={
                      formData.certificationRequirements || "None specified"
                    }
                  />
                  <ReviewField
                    label="Medical Requirements"
                    value={formData.medicalRequirements || "None specified"}
                  />
                  <ReviewField
                    label="Special Requirements"
                    value={formData.specialRequirements || "None specified"}
                  />
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-10 pb-6 px-6 text-[#2C0053] bg-gray-100">
      <div className="w-[1500px] h-fit bg-[#EFEBF2] rounded-xl shadow-lg overflow-hidden flex flex-col relative">
        {/* Language Selector */}
        <div className="absolute top-4 right-4 z-20">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        {/* Progress Steps with Connecting Line */}
        <div className="relative px-16 pt-10 pb-6">
          {/* Full width container for the line */}
          <div className="absolute inset-x-0 top-1/2 h-0.5 z-0">
            {/* Main progress line with extended start */}
            <div className="absolute -left-44 right-0 h-full flex w-full max-w-[1380px] mx-auto">
              {/* Solid portion */}
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? "calc(20% - 35px)"
                      : solidWidths[currentStep],
                }}
              />

              {/* Dotted portion */}
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

          {/* Step Circles */}
          <div className="flex justify-between relative z-10 mt-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="text-center flex-1 max-w-[200px] relative"
              >
                {/* Step circle */}
                <div
                  className={`w-12 h-12 mx-auto rounded-full text-lg font-bold mb-3 flex items-center justify-center ${
                    currentStep >= step.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  } ${currentStep > step.id ? "ring-2 ring-purple-400" : ""}`}
                  aria-current={currentStep === step.id ? "step" : undefined}
                >
                  {step.id}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-purple-600" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
          {renderStepContent()}
          {/* Navigation Buttons - Moved inside the grid */}
          <div className="col-span-12 mt-6 flex justify-start">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-8 py-2 mr-10 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition duration-200 shadow-md flex items-center justify-center min-w-[120px]"
              tabIndex="0"
              onKeyDown={(e) => e.key === "Enter" && handleBack()}
            >
              {t.back}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200 shadow-md flex items-center justify-center min-w-[120px]"
              tabIndex="0"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
                t.submit
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function InputField({
  label,
  required = false,
  placeholder,
  type = "text",
  name,
  value,
  onChange,
  error,
  className = "",
  id,
  t,
  loading = false,
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2 text-sm border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white`}
          placeholder={placeholder}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  required = false,
  options,
  name,
  value,
  onChange,
  error,
  placeholder = "Select an option",
  id,
  t,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 text-sm border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white`}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            key={option}
            value={option.toLowerCase().replace(/\s+/g, "-")}
          >
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewField({ label, value }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-600 mt-1">{value}</p>
    </div>
  );
}
