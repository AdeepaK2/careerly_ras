import bcrypt from 'bcryptjs';
export {
  validatePasswordStrength,
  getPasswordPolicyError,
  getPasswordRequirements,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '@/lib/auth/passwordPolicy';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (_error) {
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plain password with a hashed password
 */
export const comparePassword = async (
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (_error) {
    throw new Error('Failed to compare passwords');
  }
};
