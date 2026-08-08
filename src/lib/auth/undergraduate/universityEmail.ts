/**
 * University email validation for undergraduate accounts.
 * Rejects personal providers (Gmail, Yahoo, …) and requires an institutional domain.
 */

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Personal / free email providers that must not be used as university email */
const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "yandex.com",
  "yandex.ru",
  "qq.com",
  "163.com",
  "126.com",
]);

/**
 * Explicit institutional domains that do not match .edu / .ac. patterns
 * (e.g. University of Moratuwa).
 */
const ALLOWED_UNIVERSITY_DOMAINS = new Set([
  "uom.lk",
  "mrt.ac.lk",
]);

function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

function isInstitutionalDomain(domain: string): boolean {
  if (ALLOWED_UNIVERSITY_DOMAINS.has(domain)) return true;

  // *.edu, *.edu.xx
  if (domain.endsWith(".edu") || domain.includes(".edu.")) return true;

  // *.ac.xx (common for UK / South Asia universities)
  if (domain.includes(".ac.")) return true;

  // Other Sri Lankan university-style hosts ending in .lk that aren't personal
  // e.g. something.uom.lk already covered; keep conservative for plain .lk
  return false;
}

export function isUniversityEmail(email: string): boolean {
  if (!EMAIL_FORMAT.test(email.trim())) return false;

  const domain = getEmailDomain(email);
  if (!domain) return false;

  if (PERSONAL_EMAIL_DOMAINS.has(domain)) return false;

  return isInstitutionalDomain(domain);
}

/** User-facing error, or null if valid */
export function getUniversityEmailError(email: string): string | null {
  const value = (email ?? "").trim();

  if (!value) {
    return "University email is required";
  }

  if (!EMAIL_FORMAT.test(value)) {
    return "Invalid email format";
  }

  const domain = getEmailDomain(value);
  if (!domain) {
    return "Invalid email format";
  }

  if (PERSONAL_EMAIL_DOMAINS.has(domain)) {
    return "Please use your university email address. Personal emails (Gmail, Yahoo, Outlook, etc.) are not allowed";
  }

  if (!isInstitutionalDomain(domain)) {
    return "Please use a valid university email address (e.g. name@uom.lk)";
  }

  return null;
}
