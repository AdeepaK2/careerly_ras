"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Send,
  X,
  ExternalLink,
  Building2,
  ChevronDown,
  Search,
} from "lucide-react";

interface Company {
  _id: string;
  companyName: string;
  businessEmail: string;
  verified: boolean;
}

export default function AdminJobPostTab() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [isOtherCompany, setIsOtherCompany] = useState(false);
  const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);
  const [degreeSearchTerm, setDegreeSearchTerm] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  // Form data structure matching job model + admin-specific fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobType: "",
    category: "",
    workPlaceType: "",
    location: "",
    deadline: "",
    qualifiedDegrees: [] as string[],
    skillsRequired: [] as string[],
    salaryRange: {
      min: 0,
      max: 0,
    },
    // Admin-specific fields
    companyId: "",
    customCompanyName: "",
    companyWebsite: "",
    originalAdLink: "",
  });

  const jobTypes = ["Full-time", "Part-time", "Internship"];
  const categories = [
    "Architecture",
    "Business",
    "Engineering",
    "Information Technology",
    "Medicine",
    "Design",
    "Management",
    "Other",
  ];
  const workPlaceTypes = ["On-site", "Remote", "Hybrid"];
  const degrees = [
    "Bachelor of Architecture Honours",
    "Bachelor of Landscape Architecture Honours",
    "Bachelor of Design Honours",
    "BSc (Hons) Town & Country Planning",
    "BSc (Hons) Quantity Surveying",
    "BSc (Hons) Facilities Management",
    "Bachelor of Business Science Honours",
    "BSc Engineering (Hons) Chemical & Process Engineering",
    "BSc Engineering (Hons) Civil Engineering",
    "BSc Engineering (Hons) Computer Science & Engineering",
    "BSc Engineering (Hons) Earth Resources Engineering",
    "BSc Engineering (Hons) Electrical Engineering",
    "BSc Engineering (Hons) Electronic & Telecommunication Engineering",
    "BSc Engineering (Hons) Biomedical Engineering",
    "BSc Engineering (Hons) Material Science & Engineering",
    "BSc Engineering (Hons) Mechanical Engineering",
    "BSc Engineering (Hons) Textile & Apparel Engineering",
    "BSc Engineering (Hons) Transport Management & Logistics Engineering",
    "Bachelor of Design Honours in Fashion Design & Product Development",
    "BSc (Hons) Transport and Logistics Management",
    "BSc (Hons) Information Technology",
    "BSc (Hons) Information Technology & Management",
    "BSc (Hons) Artificial Intelligence",
    "Bachelor of Information Technology External Degree",
    "Bachelor of Medicine and Bachelor of Surgery",
  ];

  // Fetch companies for dropdown
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        isDegreeDropdownOpen &&
        !target.closest(".degree-dropdown-container")
      ) {
        setIsDegreeDropdownOpen(false);
      }

      if (
        isCategoryDropdownOpen &&
        !target.closest(".category-dropdown-container")
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDegreeDropdownOpen, isCategoryDropdownOpen]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const token = localStorage.getItem("admin_access_token");
      const response = await fetch(
        "/api/admin/verified-accounts?type=company&verification=verified",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // The API returns companies in data.results array
        setCompanies(data.results || []);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "companyId") {
      setIsOtherCompany(value === "other");
      if (value !== "other") {
        setFormData((prev) => ({
          ...prev,
          companyId: value,
          customCompanyName: "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          companyId: "",
        }));
      }
      return;
    }

    if (name === "salaryMin" || name === "salaryMax") {
      setFormData((prev) => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          [name === "salaryMin" ? "min" : "max"]: parseInt(value) || 0,
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (
    value: string,
    field: "qualifiedDegrees" | "skillsRequired"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const filteredDegrees = degrees.filter((degree) =>
    degree.toLowerCase().includes(degreeSearchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category: category,
    }));
    setCategorySearchTerm("");
    setIsCategoryDropdownOpen(false);
  };

  const handleDegreeSelect = (degree: string) => {
    if (!formData.qualifiedDegrees.includes(degree)) {
      setFormData((prev) => ({
        ...prev,
        qualifiedDegrees: [...prev.qualifiedDegrees, degree],
      }));
    }
    setDegreeSearchTerm("");
  };

  const removeDegree = (degreeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifiedDegrees: prev.qualifiedDegrees.filter(
        (degree) => degree !== degreeToRemove
      ),
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skillsRequired.includes(skill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skill.trim()],
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    // Client-side validation
    if (formData.qualifiedDegrees.length === 0) {
      setMessage("Please select at least one qualified degree");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!isOtherCompany && !formData.companyId) {
      setMessage("Please select a company");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (isOtherCompany && !formData.customCompanyName.trim()) {
      setMessage("Please enter company name");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("admin_access_token");

      const response = await fetch("/api/admin/job/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Job posted successfully! Notification sent to company.");
        setMessageType("success");
        // Reset form
        setFormData({
          title: "",
          description: "",
          jobType: "",
          category: "",
          workPlaceType: "",
          location: "",
          deadline: "",
          qualifiedDegrees: [],
          skillsRequired: [],
          salaryRange: { min: 0, max: 0 },
          companyId: "",
          customCompanyName: "",
          companyWebsite: "",
          originalAdLink: "",
        });
        setIsOtherCompany(false);
      } else {
        setMessage(result.error || "Failed to post job");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error occurred");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Job Post</h2>
          <p className="text-gray-900 mt-1">
            Post job opportunities on behalf of companies
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-900">
          <Building2 className="w-4 h-4" />
          <span>Admin Panel</span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Selection */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Company Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Company *
                  </label>
                  <select
                    name="companyId"
                    value={isOtherCompany ? "other" : formData.companyId}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    required
                  >
                    <option value="">Select a company...</option>
                    {loadingCompanies ? (
                      <option value="">Loading companies...</option>
                    ) : (
                      companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.companyName} {company.verified ? "✓" : ""}
                        </option>
                      ))
                    )}
                    <option value="other">Other (Manual Entry)</option>
                  </select>
                </div>

                {isOtherCompany && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="customCompanyName"
                      value={formData.customCompanyName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Enter company name"
                      required={isOtherCompany}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://company-website.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Advertisement Link
                  </label>
                  <input
                    type="url"
                    name="originalAdLink"
                    value={formData.originalAdLink}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://original-job-ad-link.com"
                  />
                </div>
              </div>
            </div>

            {/* Basic Job Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    required
                  >
                    <option value="">Select job type</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>

                  {/* Searchable Category Dropdown */}
                  <div className="relative category-dropdown-container">
                    <div
                      className="w-full p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent bg-white cursor-pointer"
                      onClick={() =>
                        setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Search className="w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder={
                              formData.category ||
                              "Search and select category..."
                            }
                            value={categorySearchTerm}
                            onChange={(e) =>
                              setCategorySearchTerm(e.target.value)
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCategoryDropdownOpen(true);
                            }}
                            className="flex-1 border-0 outline-none bg-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            isCategoryDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Display Selected Category */}
                    {formData.category && !isCategoryDropdownOpen && (
                      <div className="absolute inset-0 p-3 flex items-center justify-between bg-white pointer-events-none">
                        <span className="text-gray-900">
                          {formData.category}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    )}

                    {/* Dropdown Options */}
                    {isCategoryDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <div
                              key={category}
                              onClick={() => handleCategorySelect(category)}
                              className={`p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                formData.category === category
                                  ? "bg-purple-50 text-purple-700"
                                  : "text-gray-900"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{category}</span>
                                {formData.category === category && (
                                  <span className="text-purple-600 text-xs">
                                    ✓ Selected
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-gray-500 text-sm">
                            No categories found matching "{categorySearchTerm}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Place Type *
                  </label>
                  <select
                    name="workPlaceType"
                    value={formData.workPlaceType}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    required
                  >
                    <option value="">Select work place type</option>
                    {workPlaceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Colombo, Sri Lanka"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Salary (Optional)
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryRange.min || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., 50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Salary (Optional)
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryRange.max || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., 80000"
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                placeholder="Provide detailed job description, requirements, responsibilities, etc."
                required
              />
              <p className="text-sm text-gray-900 mt-1">
                Company website and original advertisement links will be
                automatically appended to the description.
              </p>
            </div>

            {/* Qualified Degrees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualified Degrees * (Select at least one)
              </label>

              {/* Selected Degrees Display */}
              {formData.qualifiedDegrees.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.qualifiedDegrees.map((degree, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {degree}
                      <button
                        type="button"
                        onClick={() => removeDegree(degree)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Searchable Dropdown */}
              <div className="relative degree-dropdown-container">
                <div
                  className="w-full p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent bg-white cursor-pointer"
                  onClick={() => setIsDegreeDropdownOpen(!isDegreeDropdownOpen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search and select degrees..."
                        value={degreeSearchTerm}
                        onChange={(e) => setDegreeSearchTerm(e.target.value)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDegreeDropdownOpen(true);
                        }}
                        className="flex-1 border-0 outline-none bg-transparent text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isDegreeDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Dropdown Options */}
                {isDegreeDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredDegrees.length > 0 ? (
                      filteredDegrees.map((degree) => (
                        <div
                          key={degree}
                          onClick={() => {
                            handleDegreeSelect(degree);
                            setIsDegreeDropdownOpen(false);
                          }}
                          className={`p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            formData.qualifiedDegrees.includes(degree)
                              ? "bg-purple-50 text-purple-700"
                              : "text-gray-900"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{degree}</span>
                            {formData.qualifiedDegrees.includes(degree) && (
                              <span className="text-purple-600 text-xs">
                                ✓ Selected
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-500 text-sm">
                        No degrees found matching "{degreeSearchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-2 flex items-center space-x-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, qualifiedDegrees: [] }));
                  }}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Clear All
                </button>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {formData.qualifiedDegrees.length} selected
                </span>
              </div>
            </div>

            {/* Skills Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Required (Optional)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Type a skill and press Enter"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Job...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
