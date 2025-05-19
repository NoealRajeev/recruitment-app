"use client";
import { useState } from "react";

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
        languages: [],
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
      positionsNeeded: "Let's match the right talent to your roles.",
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
      companyName: "Company Name",
      companyNamePlaceholder: "Enter company name",
      registrationNumber: "Company Registration Number",
      registrationNumberPlaceholder: "Enter registration number",
      invalidRegistration: "Invalid registration number format",
      sector: "Sector",
      companySize: "Company Size",
      website: "Company Website (optional)",
      websitePlaceholder: "Website link",
      fullName: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      jobTitle: "Job Title",
      jobTitlePlaceholder: "Enter your job title",
      email: "Email Address",
      emailPlaceholder: "Enter your email address",
      invalidEmail: "Invalid email format",
      emailInUse: "Email is already in use",
      emailCheckError: "Error verifying email",
      phone: "Phone Number",
      phonePlaceholder: "Enter your phone number",
      invalidPhone: "Invalid phone number",
      altContact: "Alternative Contact (optional)",
      altContactPlaceholder: "Enter alternate contact",
      jobRoles: "Job Roles",
      jobRole: "Job role",
      quantity: "Quantity",
      experience: "Experience",
      languages: "Languages",
      actions: "Actions",
      selectOption: "Select",
      workingHours: "Working Hours / Day",
      projectLocation: "Project Location",
      projectLocationPlaceholder: "Enter project location",
      startDate: "Start Date",
      specialRequirements: "Special Requirements (optional)",
      specialRequirementsPlaceholder: "Special requirements if any",
      qualifications: "Qualifications",
      experienceLevel: "Experience Level",
      languageRequirements: "Language Requirements",
      certificationRequirements: "Certification Requirements",
      certificationPlaceholder: "e.g., OSHA, CPR, etc.",
      medicalRequirements: "Medical Requirements",
      medicalPlaceholder: "e.g., Drug-free, Vaccinations, etc.",
      additionalRequirements: "Additional Requirements",
      companyInformation: "Company Information",
      notProvided: "Not provided",
      benefits: "Benefits",
      noneSpecified: "None specified",
      languagesRequired: "Languages Required",
      certifications: "Certifications",
      sectionNoteCompany:
        "*This section collects essential information about the company requesting foreign labour.",
      sectionNoteJob:
        "*This section specifies about the job positions and worker qualifications needed.",
      sectionNoteRequirements:
        "*This section helps us match the best candidates to your needs.",
      jobPositions: [
        "Carpenter",
        "Electrician",
        "Plumber",
        "Welder",
        "Driver",
        "Cleaner",
        "Cook",
      ],
      experienceOptions: ["0-2 years", "2-5 years", "5+ years"],
      languageOptions: ["English", "Arabic", "Hindi", "Urdu", "Tagalog"],
      sectorOptions: [
        "Construction",
        "Manufacturing",
        "Hospitality",
        "Healthcare",
        "Other",
      ],
      companySizeOptions: [
        "1-50 employees",
        "51-200 employees",
        "201-500 employees",
        "500+ employees",
      ],
      experienceLevelOptions: [
        "Entry Level (0-2 years)",
        "Mid Level (2-5 years)",
        "Senior Level (5+ years)",
      ],
    },
    ar: {
      formTitle: "تقديم متطلباتك",
      steps: [
        { id: 1, label: "معلومات الشركة" },
        { id: 2, label: "تفاصيل الوظيفة" },
        { id: 3, label: "المتطلبات" },
        { id: 4, label: "مراجعة" },
      ],
      companyProfile: "ملف الشركة",
      knowMore: "أخبرنا المزيد عنك.",
      companyDetails: "تفاصيل الشركة",
      contactPerson: "الشخص المسؤول",
      jobDetails: "متطلبات الوظيفة",
      positionsNeeded: "لنطابق بين الوظيفة والمهارات المناسبة.",
      workerRequirements: "شروط التوظيف",
      specifySkills: "حدد شروط العمل",
      reviewTitle: "المراجعة والتقديم",
      verifyInfo: "يرجى التحقق من جميع المعلومات قبل الإرسال.",
      back: "رجوع",
      continue: "متابعة",
      submit: "إرسال",
      processing: "جارٍ المعالجة...",
      required: "مطلوب",
      addAnotherRole: "+ أضف دورًا آخر",
      accommodations: "الإقامة متوفرة",
      transportation: "المواصلات متوفرة",
      companyName: "اسم الشركة",
      companyNamePlaceholder: "أدخل اسم الشركة",
      registrationNumber: "رقم تسجيل الشركة",
      registrationNumberPlaceholder: "أدخل رقم التسجيل",
      invalidRegistration: "تنسيق رقم تسجيل غير صالح",
      sector: "القطاع",
      companySize: "حجم الشركة",
      website: "موقع الويب للشركة (اختياري)",
      websitePlaceholder: "رابط الموقع",
      fullName: "الاسم الكامل",
      fullNamePlaceholder: "أدخل اسمك الكامل",
      jobTitle: "المسمى الوظيفي",
      jobTitlePlaceholder: "أدخل المسمى الوظيفي",
      email: "عنوان البريد الإلكتروني",
      emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
      invalidEmail: "تنسيق بريد إلكتروني غير صالح",
      emailInUse: "البريد الإلكتروني مستخدم بالفعل",
      emailCheckError: "خطأ في التحقق من البريد الإلكتروني",
      phone: "رقم الهاتف",
      phonePlaceholder: "أدخل رقم هاتفك",
      invalidPhone: "رقم هاتف غير صالح",
      altContact: "جهة اتصال بديلة (اختياري)",
      altContactPlaceholder: "أدخل جهة اتصال بديلة",
      jobRoles: "الأدوار الوظيفية",
      jobRole: "الدور الوظيفي",
      quantity: "الكمية",
      experience: "الخبرة",
      languages: "اللغات",
      actions: "الإجراءات",
      selectOption: "اختر",
      workingHours: "ساعات العمل / اليوم",
      projectLocation: "موقع المشروع",
      projectLocationPlaceholder: "أدخل موقع المشروع",
      startDate: "تاريخ البدء",
      specialRequirements: "متطلبات خاصة (اختياري)",
      specialRequirementsPlaceholder: "أي متطلبات خاصة إن وجدت",
      qualifications: "المؤهلات",
      experienceLevel: "مستوى الخبرة",
      languageRequirements: "متطلبات اللغة",
      certificationRequirements: "متطلبات الشهادة",
      certificationPlaceholder: "مثل OSHA، CPR، إلخ.",
      medicalRequirements: "المتطلبات الطبية",
      medicalPlaceholder: "مثل خالي من المخدرات، التطعيمات، إلخ.",
      additionalRequirements: "متطلبات إضافية",
      companyInformation: "معلومات الشركة",
      notProvided: "غير متوفر",
      benefits: "المزايا",
      noneSpecified: "غير محدد",
      languagesRequired: "اللغات المطلوبة",
      certifications: "الشهادات",
      sectionNoteCompany:
        "*يجمع هذا القسم المعلومات الأساسية عن الشركة التي تطلب عمالة أجنبية.",
      sectionNoteJob: "*يحدد هذا القسم الوظائف والمؤهلات المطلوبة للعمال.",
      sectionNoteRequirements:
        "*يساعدنا هذا القسم في مطابقة أفضل المرشحين لاحتياجاتك.",
      jobPositions: [
        "نجار",
        "كهربائي",
        "سباك",
        "لحام",
        "سائق",
        "عامل نظافة",
        "طباخ",
      ],
      experienceOptions: ["0-2 سنوات", "2-5 سنوات", "5+ سنوات"],
      languageOptions: [
        "الإنجليزية",
        "العربية",
        "الهندية",
        "الأردية",
        "التاغالوغية",
      ],
      sectorOptions: ["البناء", "التصنيع", "الضيافة", "الرعاية الصحية", "أخرى"],
      companySizeOptions: [
        "1-50 موظف",
        "51-200 موظف",
        "201-500 موظف",
        "500+ موظف",
      ],
      experienceLevelOptions: [
        "مبتدئ (0-2 سنوات)",
        "متوسط (2-5 سنوات)",
        "خبير (5+ سنوات)",
      ],
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
    const regex = /^[A-Za-z0-9]{8,15}$/;
    return regex.test(value);
  };

  const checkEmailAvailability = async (email) => {
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

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.jobCategory) newErrors.jobCategory = t.required;
    if (formData.jobRoles.some((role) => !role.title))
      newErrors.jobRoles = t.required;
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
      newErrors.languageRequirements = t.required;

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
      case 1:
        return (
          <>
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
                <InputField
                  label={t.companyName}
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                  required
                  placeholder={t.companyNamePlaceholder}
                  id="companyName"
                  t={t}
                />
                <InputField
                  label={t.registrationNumber}
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  error={errors.registrationNumber}
                  required
                  placeholder={t.registrationNumberPlaceholder}
                  id="registrationNumber"
                  t={t}
                />
                <SelectField
                  label={t.sector}
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  error={errors.sector}
                  required
                  options={t.sectorOptions}
                  id="sector"
                  t={t}
                />
                <SelectField
                  label={t.companySize}
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  error={errors.companySize}
                  required
                  options={t.companySizeOptions}
                  id="companySize"
                  t={t}
                />
                <InputField
                  label={t.website}
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder={t.websitePlaceholder}
                  type="url"
                  id="website"
                  t={t}
                />
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[4px] h-2/3 bg-gray-300 rounded-full"></div>
              </div>

              <div className="col-span-5 space-y-4">
                <h2 className="text-lg font-semibold mb-2">
                  {t.contactPerson}
                </h2>
                <InputField
                  label={t.fullName}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                  placeholder={t.fullNamePlaceholder}
                  id="fullName"
                  t={t}
                />
                <InputField
                  label={t.jobTitle}
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  error={errors.jobTitle}
                  required
                  placeholder={t.jobTitlePlaceholder}
                  id="jobTitle"
                  t={t}
                />
                <InputField
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
                  t={t}
                />
                <InputField
                  label={t.phone}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  placeholder={t.phonePlaceholder}
                  type="tel"
                  id="phone"
                  t={t}
                />
                <InputField
                  label={t.altContact}
                  name="altContact"
                  value={formData.altContact}
                  onChange={handleChange}
                  placeholder={t.altContactPlaceholder}
                  type="tel"
                  id="altContact"
                  t={t}
                />
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
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
                <h2 className="text-lg font-semibold mb-4">{t.jobRoles}</h2>
                <div className="rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                          {t.jobRole}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          {t.quantity}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.experience}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.languages}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.actions}
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
                              <option value="">{t.selectOption}</option>
                              {t.jobPositions
                                .filter(
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
                              <option value="">{t.selectOption}</option>
                              {t.experienceOptions.map((exp) => (
                                <option key={exp} value={exp}>
                                  {exp}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              placeholder={t.languageRequirements}
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
                              {t.back}
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
                    {t.addAnotherRole}
                  </button>
                </div>
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[4px] h-2/3 bg-gray-300 rounded-full"></div>
              </div>

              <div className="col-span-4 space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    {t.workingHours}*
                  </h3>
                  <InputField
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    type="time"
                    required
                    className="w-full"
                    t={t}
                  />
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    {t.projectLocation}*
                  </h3>
                  <InputField
                    name="projectLocation"
                    value={formData.projectLocation}
                    onChange={handleChange}
                    placeholder={t.projectLocationPlaceholder}
                    required
                    className="w-full"
                    t={t}
                  />
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    {t.startDate}*
                  </h3>
                  <InputField
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    type="date"
                    required
                    className="w-full"
                    t={t}
                  />
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    {t.specialRequirements}
                  </h3>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder={t.specialRequirementsPlaceholder}
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
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
                <h2 className="text-lg font-semibold mb-2">
                  {t.qualifications}
                </h2>

                <SelectField
                  label={t.experienceLevel}
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  error={errors.experienceLevel}
                  required
                  options={t.experienceLevelOptions}
                  id="experienceLevel"
                  t={t}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.languageRequirements}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  {errors.languageRequirements && (
                    <p className="text-sm text-red-600 mb-2">
                      {errors.languageRequirements}
                    </p>
                  )}
                  <div className="space-y-2">
                    {t.languageOptions.map((language) => (
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
                    ))}
                  </div>
                </div>

                <InputField
                  label={t.certificationRequirements}
                  name="certificationRequirements"
                  value={formData.certificationRequirements}
                  onChange={handleChange}
                  placeholder={t.certificationPlaceholder}
                  id="certificationRequirements"
                  t={t}
                />

                <InputField
                  label={t.medicalRequirements}
                  name="medicalRequirements"
                  value={formData.medicalRequirements}
                  onChange={handleChange}
                  placeholder={t.medicalPlaceholder}
                  id="medicalRequirements"
                  t={t}
                />
              </div>

              <div className="col-span-2 flex justify-center items-center">
                <div className="w-[4px] h-2/3 bg-gray-300 rounded-full"></div>
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
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    placeholder={t.specialRequirementsPlaceholder}
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
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
                <div className="w-[4px] h-full bg-gray-300 rounded-full"></div>
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
          </>
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
            onChange={(e) => setLanguage(e.target.value)}
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
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? "calc(20% - 35px)"
                      : solidWidths[currentStep],
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

        <div className="flex-1 mx-16 rounded-lg py-8 flex flex-col justify-between">
          {renderStepContent()}
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
