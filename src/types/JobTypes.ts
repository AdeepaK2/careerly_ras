// types/Application.ts
export interface Application {
  _id: string;
  applicantId: {
    _id: string;
    firstName: string;
    lastName: string;
    universityEmail: string;
    education: {
      degreeProgramme: string;
    };
  };
  cv: string;
  coverLetter: string;
  specialRequirements?: string;
  appliedAt: string;
  status: string;
}
