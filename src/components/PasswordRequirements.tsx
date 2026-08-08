"use client";

import { getPasswordRequirements, validatePasswordStrength } from "@/lib/auth/passwordPolicy";

type PasswordRequirementsProps = {
  password: string;
  className?: string;
};

/**
 * Shows only remaining unmet rules while typing.
 * Hidden when empty; collapses to a short success note when strong.
 */
export default function PasswordRequirements({
  password,
  className = "",
}: PasswordRequirementsProps) {
  if (!password) return null;

  const { isValid } = validatePasswordStrength(password);
  if (isValid) {
    return (
      <p className={`mt-2 text-xs text-green-600 ${className}`} aria-live="polite">
        ✓ Password looks strong
      </p>
    );
  }

  const unmet = getPasswordRequirements(password).filter(
    (r) => r.id !== "maxLength" && !r.met
  );

  return (
    <ul className={`mt-2 space-y-1 text-xs text-gray-500 ${className}`} aria-live="polite">
      {unmet.map((req) => (
        <li key={req.id}>
          <span className="mr-1" aria-hidden>
            ○
          </span>
          {req.label}
        </li>
      ))}
    </ul>
  );
}
