import jwt from 'jsonwebtoken';
import { CompanyJWTPayload, CompanyAuthTokens } from './types';

// JWT Secrets from environment variables
const ACCESS_TOKEN_SECRET = process.env.COMPANY_JWT_SECRET || 'company_jwt_secret_fallback';
const REFRESH_TOKEN_SECRET = process.env.COMPANY_JWT_SECRET || 'company_jwt_secret_fallback';
const EMAIL_VERIFICATION_SECRET = process.env.COMPANY_EMAIL_VERIFICATION_SECRET || 'company_email_verification_secret_fallback';

// Token expiration times
const ACCESS_TOKEN_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';
const EMAIL_VERIFICATION_EXPIRES_IN = '24h';

/**
 * Generate access and refresh tokens for a company
 */
export function generateCompanyTokens(payload: CompanyJWTPayload): CompanyAuthTokens {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: 'careerly-company-auth',
    audience: 'careerly-platform'
  });

  const refreshToken = jwt.sign(
    { 
      id: payload.id, 
      type: payload.type,
      tokenType: 'refresh'
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'careerly-company-auth',
      audience: 'careerly-platform'
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify and decode access token
 */
export function verifyCompanyAccessToken(token: string): CompanyJWTPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'careerly-company-auth',
      audience: 'careerly-platform'
    }) as CompanyJWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('Access token verification failed:', error);
    return null;
  }
}

/**
 * Verify and decode refresh token
 */
export function verifyCompanyRefreshToken(token: string): { id: string; type: string; tokenType: string } | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'careerly-company-auth',
      audience: 'careerly-platform'
    }) as { id: string; type: string; tokenType: string };
    
    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Generate email verification token
 */
export function generateCompanyEmailVerificationToken(companyId: string, businessEmail: string): string {
  return jwt.sign(
    { 
      id: companyId, 
      email: businessEmail, 
      type: 'company_email_verification' 
    },
    EMAIL_VERIFICATION_SECRET,
    {
      expiresIn: EMAIL_VERIFICATION_EXPIRES_IN,
      issuer: 'careerly-company-auth',
      audience: 'careerly-platform'
    }
  );
}

/**
 * Verify email verification token
 */
export function verifyCompanyEmailVerificationToken(token: string): { id: string; email: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, EMAIL_VERIFICATION_SECRET, {
      issuer: 'careerly-company-auth',
      audience: 'careerly-platform'
    }) as { id: string; email: string; type: string };
    
    if (decoded.type !== 'company_email_verification') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    console.error('Email verification token verification failed:', error);
    return null;
  }
}

/**
 * Generate password reset token
 */
export function generateCompanyPasswordResetToken(companyId: string, businessEmail: string): string {
  return jwt.sign(
    { 
      id: companyId, 
      email: businessEmail, 
      type: 'company_password_reset',
      timestamp: Date.now()
    },
    EMAIL_VERIFICATION_SECRET, // Reuse email verification secret for password reset
    {
      expiresIn: '1h', // Password reset tokens expire in 1 hour
      issuer: 'careerly-company-auth',
      audience: 'careerly-platform'
    }
  );
}

/**
 * Verify password reset token
 */
export function verifyCompanyPasswordResetToken(token: string): { id: string; email: string; type: string; timestamp: number } | null {
  try {
    const decoded = jwt.verify(token, EMAIL_VERIFICATION_SECRET, {
      issuer: 'careerly-company-auth',
      audience: 'careerly-platform'
    }) as { id: string; email: string; type: string; timestamp: number };
    
    if (decoded.type !== 'company_password_reset') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    console.error('Password reset token verification failed:', error);
    return null;
  }
}
