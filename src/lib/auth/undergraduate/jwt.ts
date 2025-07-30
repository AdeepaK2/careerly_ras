import jwt from 'jsonwebtoken';
import { 
  UndergradJWTPayload, 
  UndergradAuthTokens, 
  UndergradTokenVerification,
  UndergradEmailVerificationPayload,
  UndergradPasswordResetPayload
} from './types';

// Environment variables with defaults for development
const JWT_SECRET = process.env.UNDERGRAD_JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.UNDERGRAD_JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET = process.env.UNDERGRAD_REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';
const REFRESH_EXPIRES_IN = process.env.UNDERGRAD_REFRESH_TOKEN_EXPIRES_IN || '30d';
const EMAIL_VERIFICATION_SECRET = process.env.UNDERGRAD_EMAIL_VERIFICATION_SECRET || 'fallback-email-secret';

/**
 * Generate access and refresh tokens for undergraduate
 */
export const generateUndergradTokens = (payload: UndergradJWTPayload): UndergradAuthTokens => {
  try {
    // Using any type to bypass type issues
    const accessToken = (jwt.sign as any)(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = (jwt.sign as any)(
      { 
        id: payload.id, 
        type: payload.type,
        tokenType: 'refresh' 
      }, 
      REFRESH_SECRET, 
      { expiresIn: REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Failed to generate tokens');
  }
};

/**
 * Verify undergraduate access token
 */
export const verifyUndergradAccessToken = (token: string): UndergradTokenVerification => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as UndergradJWTPayload;
    return { valid: true, payload };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' };
    }
    return { valid: false, error: 'Token verification failed' };
  }
};

/**
 * Verify undergraduate refresh token
 */
export const verifyUndergradRefreshToken = (token: string): UndergradTokenVerification => {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as any;

    if (payload.tokenType !== 'refresh') {
      return { valid: false, error: 'Invalid refresh token' };
    }

    return { 
      valid: true, 
      payload: { 
        id: payload.id, 
        type: payload.type 
      } as any 
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid refresh token' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Refresh token expired' };
    }
    return { valid: false, error: 'Refresh token verification failed' };
  }
};

/**
 * Generate email verification token
 */
export const generateEmailVerificationToken = (
  id: string, 
  universityEmail: string
): string => {
  try {
    const payload: UndergradEmailVerificationPayload = {
      id,
      universityEmail,
      type: 'email_verification'
    };

    return (jwt.sign as any)(payload, EMAIL_VERIFICATION_SECRET, { expiresIn: '24h' });
  } catch (error) {
    throw new Error('Failed to generate email verification token');
  }
};

/**
 * Verify email verification token
 */
export const verifyEmailVerificationToken = (token: string): {
  valid: boolean;
  payload?: UndergradEmailVerificationPayload;
  error?: string;
} => {
  try {
    const payload = jwt.verify(token, EMAIL_VERIFICATION_SECRET) as UndergradEmailVerificationPayload;

    if (payload.type !== 'email_verification') {
      return { valid: false, error: 'Invalid verification token type' };
    }

    return { valid: true, payload };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid verification token' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Verification token expired' };
    }
    return { valid: false, error: 'Verification token validation failed' };
  }
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = (
  id: string, 
  universityEmail: string
): string => {
  try {
    const payload: UndergradPasswordResetPayload = {
      id,
      universityEmail,
      type: 'password_reset'
    };

    return (jwt.sign as any)(payload, EMAIL_VERIFICATION_SECRET, { expiresIn: '1h' });
  } catch (error) {
    throw new Error('Failed to generate password reset token');
  }
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (token: string): {
  valid: boolean;
  payload?: UndergradPasswordResetPayload;
  error?: string;
} => {
  try {
    const payload = jwt.verify(token, EMAIL_VERIFICATION_SECRET) as UndergradPasswordResetPayload;

    if (payload.type !== 'password_reset') {
      return { valid: false, error: 'Invalid password reset token type' };
    }

    return { valid: true, payload };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid password reset token' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Password reset token expired' };
    }
    return { valid: false, error: 'Password reset token validation failed' };
  }
};
