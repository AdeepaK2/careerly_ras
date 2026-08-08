import bcryptjs from 'bcryptjs';
export {
  validatePasswordStrength,
  getPasswordPolicyError,
  getPasswordRequirements,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '@/lib/auth/passwordPolicy';

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcryptjs.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcryptjs.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isMatch = await bcryptjs.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Password comparison failed:', error);
    throw new Error('Password comparison failed');
  }
}

/**
 * Alias for comparePassword to maintain backward compatibility
 */
export const verifyPassword = comparePassword;

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*(),.?":{}|<>';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
