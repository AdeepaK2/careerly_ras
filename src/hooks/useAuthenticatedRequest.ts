'use client';

import { useAuth } from '@/contexts/AuthContext';

export const useAuthenticatedRequest = () => {
  const { refreshToken } = useAuth();

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Add authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    // Make the initial request
    let response = await fetch(url, {
      ...options,
      headers
    });

    // If unauthorized (401), try to refresh token and retry
    if (response.status === 401) {
      console.log('Token expired, attempting to refresh...');
      const refreshed = await refreshToken();
      
      if (refreshed) {
        const newToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (newToken) {
          // Retry with new token
          const newHeaders = {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`
          };
          
          response = await fetch(url, {
            ...options,
            headers: newHeaders
          });
        }
      }
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    return response;
  };

  return { makeAuthenticatedRequest };
};
