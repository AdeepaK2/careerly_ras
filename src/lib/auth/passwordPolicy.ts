/**
 * Shared password policy for Careerly.
 * Enforced on register, reset, change-password, and admin user creation.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

/** Common weak passwords / patterns users should not be allowed to set */
const COMMON_PASSWORDS = new Set(
  [
    "password",
    "password1",
    "password123",
    "password123!",
    "12345678",
    "123456789",
    "1234567890",
    "qwerty123",
    "qwertyui",
    "iloveyou",
    "admin123",
    "welcome1",
    "letmein1",
    "changeme",
    "careerly",
    "careerly1",
    "careerly123",
  ].map((p) => p.toLowerCase())
);

export type PasswordRequirementId =
  | "minLength"
  | "maxLength"
  | "lowercase"
  | "uppercase"
  | "number"
  | "special"
  | "notCommon"
  | "noWhitespace";

export type PasswordRequirement = {
  id: PasswordRequirementId;
  label: string;
  met: boolean;
};

export type PasswordValidationResult = {
  isValid: boolean;
  errors: string[];
  requirements: PasswordRequirement[];
  score: number; // 0–5 for UI meters
};

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  const value = password ?? "";

  return [
    {
      id: "minLength",
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      met: value.length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: "lowercase",
      label: "One lowercase letter (a–z)",
      met: /[a-z]/.test(value),
    },
    {
      id: "uppercase",
      label: "One uppercase letter (A–Z)",
      met: /[A-Z]/.test(value),
    },
    {
      id: "number",
      label: "One number (0–9)",
      met: /\d/.test(value),
    },
    {
      id: "special",
      label: "One special character (!@#$%…)",
      met: SPECIAL_CHAR_REGEX.test(value),
    },
    {
      id: "noWhitespace",
      label: "No spaces",
      met: value.length === 0 ? false : !/\s/.test(value),
    },
    {
      id: "notCommon",
      label: "Not a commonly used password",
      met: value.length === 0 ? false : !COMMON_PASSWORDS.has(value.toLowerCase()),
    },
    {
      id: "maxLength",
      label: `No more than ${PASSWORD_MAX_LENGTH} characters`,
      met: value.length > 0 && value.length <= PASSWORD_MAX_LENGTH,
    },
  ];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const requirements = getPasswordRequirements(password);
  const errors: string[] = [];

  for (const req of requirements) {
    if (!req.met) {
      switch (req.id) {
        case "minLength":
          errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
          break;
        case "maxLength":
          errors.push(`Password must be no more than ${PASSWORD_MAX_LENGTH} characters long`);
          break;
        case "lowercase":
          errors.push("Password must contain at least one lowercase letter");
          break;
        case "uppercase":
          errors.push("Password must contain at least one uppercase letter");
          break;
        case "number":
          errors.push("Password must contain at least one number");
          break;
        case "special":
          errors.push("Password must contain at least one special character");
          break;
        case "noWhitespace":
          errors.push("Password must not contain spaces");
          break;
        case "notCommon":
          errors.push("This password is too common. Choose a stronger one");
          break;
      }
    }
  }

  // Score based on core complexity rules (exclude maxLength from score)
  const coreIds: PasswordRequirementId[] = [
    "minLength",
    "lowercase",
    "uppercase",
    "number",
    "special",
  ];
  const score = coreIds.filter((id) => requirements.find((r) => r.id === id)?.met).length;

  return {
    isValid: errors.length === 0,
    errors,
    requirements,
    score,
  };
}

/** First error message, or null if valid — handy for API responses */
export function getPasswordPolicyError(password: string): string | null {
  const result = validatePasswordStrength(password);
  return result.isValid ? null : result.errors[0];
}
