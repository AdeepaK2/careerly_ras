export interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  pendingVerifications: number;
  new24h: number;
  dau: number;
  mau: number;
  jobs24h: number;
  applications24h: number;
  avgApplicationsPerJob: number;
  // Enhanced KPIs
  totalRegisteredStudents: number;
  totalVerifiedCompanies: number;
  activeJobPostings: number;
  applicationsToday: number;
  applicationsThisWeek: number;
  applicationsThisMonth: number;
  successfulPlacements: number;
  platformGrowthRate: number;
  verifiedStudents: number;
  unverifiedStudents: number;
  unverifiedCompanies: number;
  expiredJobs: number;
}

export interface Activity {
  id: string;
  type:
    | "user_registration"
    | "company_verification"
    | "job_posting"
    | "application_submitted"
    | "company_registration";
  message: string;
  timestamp: string;
  data?: {
    userId?: string;
    companyId?: string;
    jobId?: string;
    applicationId?: string;
    email?: string;
    isVerified?: boolean;
    status?: string;
    category?: string;
  };
}

export interface TrendData {
  userRegistrationTrends: Array<{ date: string; students: number }>;
  companyRegistrationTrends: Array<{ date: string; companies: number }>;
  jobPostingTrends: Array<{ date: string; jobs: number }>;
  applicationTrends: Array<{ date: string; applications: number }>;
  jobCategories: Array<{ category: string; count: number }>;
  applicationStatus: Array<{ status: string; count: number }>;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change: string;
  changeLabel: string;
  changeType: "positive" | "negative";
  subtitle?: string;
  isPercentage?: boolean;
}

export interface CombinedTrendPoint {
  date: string;
  students: number;
  companies: number;
  jobs: number;
  applications: number;
}

export interface ExportOptions {
  type: "summary" | "users" | "companies" | "jobs" | "applications";
  format: "json" | "csv";
  startDate?: string;
  endDate?: string;
}
