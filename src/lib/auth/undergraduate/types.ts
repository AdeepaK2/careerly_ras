export interface UndergradJWTPayload {
  id: string;
  index: string;
  universityEmail: string;
  name: string;
  isVerified: boolean;
  type: 'undergraduate';
}

export interface UndergradAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UndergradAuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UndergradJWTPayload;
    tokens: UndergradAuthTokens;
  };
  error?: string;
}

export interface UndergradLoginRequest {
  universityEmail: string;
  password: string;
}

export interface UndergradRegisterRequest {
  index: string;
  name: string;
  nameWithInitials: string;
  universityEmail: string;
  password: string;
  batch: string;
  education: {
    faculty: string;
    department: string;
    degreeProgramme: string;
  };
  birthdate: string | Date;
  address: string;
  phoneNumber: string;
  profilePicUrl?: string;
  jobSearchingStatus?: 'active' | 'passive' | 'not_searching' | 'employed';
}

export interface UndergradTokenVerification {
  valid: boolean;
  payload?: UndergradJWTPayload;
  error?: string;
}

export interface UndergradEmailVerificationPayload {
  id: string;
  universityEmail: string;
  type: 'email_verification';
}

export interface UndergradPasswordResetPayload {
  id: string;
  universityEmail: string;
  type: 'password_reset';
}
