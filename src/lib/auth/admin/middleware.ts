import { NextRequest } from "next/server";

// Simple admin authentication middleware
// In production, this should be replaced with proper admin authentication
export function withAdminAuth(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    try {
      // For now, we'll use a simple header-based authentication
      // In production, this should be replaced with JWT-based admin authentication
      const adminToken = request.headers.get('x-admin-token');
      
      // This is a placeholder - replace with proper admin authentication logic
      // You might want to check against a JWT token, session, or database
      if (!adminToken || adminToken !== process.env.ADMIN_SECRET_TOKEN) {
        // For development, we'll allow access without proper authentication
        // Remove this in production and implement proper authentication
        if (process.env.NODE_ENV === 'development') {
          console.warn('Admin authentication bypassed in development mode');
          return handler(request);
        }
        
        return new Response(JSON.stringify({
          success: false,
          message: "Admin authentication required"
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return handler(request);
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: "Authentication error"
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

// Helper function to check if user has admin privileges
export function isAdmin(userRole?: string): boolean {
  return userRole === 'admin' || userRole === 'super_admin';
}

// Types for admin authentication
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
}

export interface AdminAuthResult {
  success: boolean;
  user?: AdminUser;
  message?: string;
}
