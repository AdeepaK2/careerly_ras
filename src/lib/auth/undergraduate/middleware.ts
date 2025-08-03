import { NextRequest } from 'next/server';
import { verifyUndergradAccessToken } from './jwt';
import { UndergradJWTPayload } from './types';

export interface UndergradAuthRequest extends NextRequest {
  user?: UndergradJWTPayload;
}

export interface UndergradAuthResult {
  success: boolean;
  user?: UndergradJWTPayload;
  error?: string;
}

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader) return null;
  
  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Middleware to verify undergraduate authentication
 */
export const verifyUndergradAuth = (request: NextRequest): UndergradAuthResult => {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        success: false,
        error: 'Authorization token required'
      };
    }

    // Verify the token
    const verification = verifyUndergradAccessToken(token);

    if (!verification.valid || !verification.payload) {
      return {
        success: false,
        error: verification.error || 'Invalid token'
      };
    }

    // Ensure this is an undergraduate token
    if (verification.payload.type !== 'undergraduate') {
      return {
        success: false,
        error: 'Invalid user type'
      };
    }

    return {
      success: true,
      user: verification.payload
    };

  } catch (error) {
    return {
      success: false,
      error: 'Authentication verification failed'
    };
  }
};

/**
 * Helper function to get user from request in API routes
 */
export const getUndergradFromRequest = (request: NextRequest): UndergradJWTPayload | null => {
  const authResult = verifyUndergradAuth(request);
  return authResult.success ? authResult.user! : null;
};

/**
 * Check if user is verified (email verification)
 */
export const requireVerifiedUndergrad = (user: UndergradJWTPayload): boolean => {
  return user.isVerified;
};

/**
 * Middleware wrapper for protected routes
 */
export const withUndergradAuth = (
  handler: (request: NextRequest, user: UndergradJWTPayload) => Promise<Response>
) => {
  return async (request: NextRequest): Promise<Response> => {
    const authResult = verifyUndergradAuth(request);

    if (!authResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: authResult.error || 'Authentication required',
          error: 'UNAUTHORIZED'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, authResult.user!);
  };
};

/**
 * Middleware wrapper for routes that require verified users
 */
export const withVerifiedUndergradAuth = (
  handler: (request: NextRequest, user: UndergradJWTPayload) => Promise<Response>
) => {
  return withUndergradAuth(async (request: NextRequest, user: UndergradJWTPayload) => {
    if (!requireVerifiedUndergrad(user)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email verification required',
          error: 'EMAIL_NOT_VERIFIED'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, user);
  });
};
