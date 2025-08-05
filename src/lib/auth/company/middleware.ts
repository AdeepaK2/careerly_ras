import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAccessToken } from './jwt';
import { CompanyJWTPayload } from './types';

export interface CompanyAuthResult {
  success: boolean;
  user?: CompanyJWTPayload;
  error?: string;
}

/**
 * Verify company authentication from request headers
 */
export async function verifyCompanyAuth(request: NextRequest): Promise<CompanyAuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return {
        success: false,
        error: 'No authorization header provided'
      };
    }

    // Extract token from "Bearer <token>" format
    if (!authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Invalid authorization header format'
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (!token) {
      return {
        success: false,
        error: 'No token provided'
      };
    }

    // Verify and decode the token
    const payload = verifyCompanyAccessToken(token);
    if (!payload) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }

    // Ensure this is a company token
    if (payload.type !== 'company') {
      return {
        success: false,
        error: 'Invalid token type'
      };
    }

    return {
      success: true,
      user: payload
    };

  } catch (error) {
    console.error('Company auth verification error:', error);
    return {
      success: false,
      error: 'Authentication verification failed'
    };
  }
}

/**
 * Higher-order function to wrap API routes with company authentication
 */
export function withCompanyAuth(
  handler: (request: NextRequest, user: CompanyJWTPayload) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const authResult = await verifyCompanyAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: authResult.error || 'Authentication failed'
      }, { status: 401 });
    }

    try {
      return await handler(request, authResult.user);
    } catch (error) {
      console.error('API handler error:', error);
      return NextResponse.json({
        success: false,
        message: 'Internal server error'
      }, { status: 500 });
    }
  };
}

/**
 * Check if company email is verified (for login access)
 */
export function requireEmailVerified(user: CompanyJWTPayload): boolean {
  // This will be checked during login, so we assume email is verified if they can login
  return true;
}

/**
 * Check if company account is verified (for certain features)
 */
export function requireAccountVerified(user: CompanyJWTPayload): boolean {
  return user.isVerified === true;
}

/**
 * Higher-order function for routes that require verified companies (account verification)
 */
export function withVerifiedCompanyAuth(
  handler: (request: NextRequest, user: CompanyJWTPayload) => Promise<Response>
) {
  return withCompanyAuth(async (request: NextRequest, user: CompanyJWTPayload) => {
    if (!requireAccountVerified(user)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Company account verification required. Please complete your verification process.',
          error: 'ACCOUNT_NOT_VERIFIED'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, user);
  });
}
