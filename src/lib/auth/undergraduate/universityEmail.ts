/**
 * University email validation for undergraduate accounts.
 * Rejects personal providers (Gmail, Yahoo, …) and requires an institutional domain.
 * Supports many universities — not only University of Moratuwa.
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
 * Known university / HEI domains (including those without .edu / .ac.).
 * Subdomains are accepted automatically (e.g. stu.uom.lk, mail.sliit.lk).
 */
const ALLOWED_UNIVERSITY_DOMAINS = [
  // University of Moratuwa
  "uom.lk",
  "mrt.ac.lk",
  // Other Sri Lankan state universities
  "cmb.ac.lk",
  "pdn.ac.lk",
  "sjp.ac.lk",
  "kln.ac.lk",
  "jfn.ac.lk",
  "ruh.ac.lk",
  "ou.ac.lk",
  "sab.ac.lk",
  "rjt.ac.lk",
  "uwu.ac.lk",
  "seu.ac.lk",
  "esn.ac.lk",
  "wyb.ac.lk",
  "kdu.ac.lk",
  "vau.ac.lk",
  "uwu.ac.lk",
  // Private / other HEIs in Sri Lanka
  "sliit.lk",
  "sliit.ac.lk",
  "nsbm.lk",
  "nsbm.ac.lk",
  "iit.ac.lk",
  "nibm.lk",
  "apiit.lk",
  "cinec.edu",
  "kdu.ac.lk",
];

function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

function matchesAllowedDomain(domain: string): boolean {
  return ALLOWED_UNIVERSITY_DOMAINS.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
  );
}

function isInstitutionalDomain(domain: string): boolean {
  if (matchesAllowedDomain(domain)) return true;

  // Global academic patterns: university.edu, college.edu.au, ox.ac.uk, …
  if (domain.endsWith(".edu") || domain.includes(".edu.")) return true;
  if (domain.includes(".ac.")) return true;

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
    return "Please use a valid university email address (not a personal email)";
  }

  return null;
}
