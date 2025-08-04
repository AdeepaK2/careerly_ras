'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface DebugInfo {
  tokenExists: boolean;
  tokenType: 'company' | 'undergraduate' | null;
  apiConnectivity: boolean;
  authStatus: 'success' | 'failed' | 'untested';
  errorMessage?: string;
  apiResponse?: any;
}

interface VerificationDebugProps {
  userType: 'company' | 'undergraduate';
}

export default function VerificationDebug({ userType }: VerificationDebugProps) {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const info: DebugInfo = {
      tokenExists: false,
      tokenType: null,
      apiConnectivity: false,
      authStatus: 'untested'
    };

    try {
      // Check token existence
      const tokenKey = userType === 'company' ? 'company_accessToken' : 'accessToken';
      const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;
      
      info.tokenExists = !!token;
      info.tokenType = token ? userType : null;

      console.log(`Token check for ${userType}:`, { exists: info.tokenExists, token: token?.substring(0, 20) + '...' });

      if (!token) {
        info.errorMessage = 'No authentication token found. Please log in again.';
        setDebugInfo(info);
        setTesting(false);
        return;
      }

      // Test API connectivity and authentication
      const apiEndpoint = userType === 'company' ? '/api/company/verification' : '/api/undergraduate/verification';
      const testEndpoint = `/api/test?type=${userType}`;
      
      console.log(`Testing API endpoint: ${apiEndpoint}`);
      console.log(`Testing auth endpoint: ${testEndpoint}`);
      
      // First test basic auth
      const testResponse = await fetch(testEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const testData = await testResponse.json();
      console.log('Test API Response:', testData);

      // Then test verification endpoint
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      info.apiConnectivity = true;
      console.log(`API Response status: ${response.status}`);

      const responseData = await response.json();
      console.log('API Response data:', responseData);
      
      info.apiResponse = {
        testEndpoint: testData,
        verificationEndpoint: responseData
      };

      if (response.ok && responseData.success) {
        info.authStatus = 'success';
      } else {
        info.authStatus = 'failed';
        info.errorMessage = responseData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Add additional context from test endpoint
        if (testData.authTest) {
          info.errorMessage += ` | Auth Test: ${testData.authTest.authSuccess ? 'Passed' : 'Failed'}`;
          if (testData.authTest.authError) {
            info.errorMessage += ` (${testData.authTest.authError})`;
          }
        }
      }

    } catch (error: any) {
      console.error('Diagnostics error:', error);
      info.errorMessage = error.message || 'Network error occurred';
      info.authStatus = 'failed';
    }

    setDebugInfo(info);
    setTesting(false);
  };

  const clearTokens = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('company_accessToken');
      localStorage.removeItem('accessToken');
      alert('Tokens cleared. Please log in again.');
      window.location.href = userType === 'company' ? '/auth/company/login' : '/auth/undergrad/login';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-400">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
          Verification Debug Panel
        </h3>
        <div className="flex gap-2">
          <button
            onClick={runDiagnostics}
            disabled={testing}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Run Diagnostics
          </button>
          <button
            onClick={clearTokens}
            className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          >
            Clear Tokens
          </button>
        </div>
      </div>

      {debugInfo && (
        <div className="space-y-4">
          {/* Token Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Authentication Token</span>
            <div className="flex items-center">
              {debugInfo.tokenExists ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
              )}
              <span className={`text-sm ${debugInfo.tokenExists ? 'text-green-700' : 'text-red-700'}`}>
                {debugInfo.tokenExists ? 'Found' : 'Missing'}
              </span>
            </div>
          </div>

          {/* API Connectivity */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">API Connectivity</span>
            <div className="flex items-center">
              {debugInfo.apiConnectivity ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
              )}
              <span className={`text-sm ${debugInfo.apiConnectivity ? 'text-green-700' : 'text-red-700'}`}>
                {debugInfo.apiConnectivity ? 'Connected' : 'Failed'}
              </span>
            </div>
          </div>

          {/* Authentication Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Authentication Status</span>
            <div className="flex items-center">
              {debugInfo.authStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : debugInfo.authStatus === 'failed' ? (
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              <span className={`text-sm capitalize ${
                debugInfo.authStatus === 'success' ? 'text-green-700' : 
                debugInfo.authStatus === 'failed' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {debugInfo.authStatus}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {debugInfo.errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Error Details:</p>
              <p className="text-sm text-red-600 mt-1">{debugInfo.errorMessage}</p>
            </div>
          )}

          {/* API Response */}
          {debugInfo.apiResponse && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">API Response:</p>
              <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                {JSON.stringify(debugInfo.apiResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Troubleshooting Steps:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              {!debugInfo.tokenExists && (
                <li>• Please log out and log back in to refresh your session</li>
              )}
              {debugInfo.tokenExists && !debugInfo.apiConnectivity && (
                <li>• Check your internet connection and try again</li>
              )}
              {debugInfo.apiConnectivity && debugInfo.authStatus === 'failed' && (
                <li>• Your session may have expired, please log in again</li>
              )}
              {debugInfo.authStatus === 'success' && (
                <li>• ✅ Everything looks good! Try refreshing the verification page</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {!debugInfo && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-sm">Click "Run Diagnostics" to check verification connectivity</p>
        </div>
      )}
    </div>
  );
}
