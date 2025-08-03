export interface CompanyJWTPayload {
  id: string;
  registrationNumber: string;
  businessEmail: string;
  companyName: string;
  isVerified: boolean;
  type: 'company';
}

export interface CompanyAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CompanyAuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: CompanyJWTPayload;
    tokens: CompanyAuthTokens;
  };
  error?: string;
}

export interface CompanyLoginRequest {
  businessEmail: string;
  password: string;
}

export interface CompanyRegisterRequest {
  companyName: string;
  registrationNumber: string;
  businessEmail: string;
  password: string;
  phoneNumber: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  description?: string;
  website?: string;
  contactPerson: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  };
}

export interface CompanyProfileData {
  id: string;
  companyName: string;
  registrationNumber: string;
  businessEmail: string;
  phoneNumber: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  description?: string;
  website?: string;
  logoUrl?: string;
  contactPerson: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  };
  isVerified: boolean;
  isActive: boolean;
  verificationDocuments: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  lastLogin?: Date;
  jobPostingLimits: {
    maxActiveJobs: number;
    currentActiveJobs: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
