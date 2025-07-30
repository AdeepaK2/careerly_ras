export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            File Storage API
          </h1>
          <p className="text-lg text-gray-600">
            Simple file upload and download API using R2 Storage
          </p>
        </div>

        {/* API Documentation */}
        <div className="grid gap-8">
          {/* Upload Endpoint */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📤 Upload File</h2>
            <div className="space-y-4">
              <div>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  POST
                </span>
                <code className="ml-2 bg-gray-100 px-3 py-1 rounded text-sm">
                  /api/file/upload
                </code>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Request Body (multipart/form-data):</h3>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• <code>file</code> - The file to upload (required)</li>
                  <li>• <code>folderPath</code> - Optional folder path (e.g., "documents/pdfs")</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Response:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://r2-endpoint/path/to/file.pdf",
    "fileName": "1722334800000-document.pdf",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 123456,
    "folderPath": "documents",
    "uploadedAt": "2025-07-30T10:30:00.000Z"
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Download Endpoint */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📥 Download File</h2>
            <div className="space-y-4">
              <div>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  GET
                </span>
                <code className="ml-2 bg-gray-100 px-3 py-1 rounded text-sm">
                  /api/file/download
                </code>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Query Parameters:</h3>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• <code>url</code> - The file URL returned from upload</li>
                  <li>• <code>path</code> - Or direct file path in storage</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Example:</h3>
                <code className="bg-gray-100 p-2 rounded text-xs block overflow-x-auto">
                  GET /api/file/download?url=https://r2-endpoint/path/to/file.pdf
                </code>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Response:</h3>
                <p className="text-sm text-gray-600">Direct file download with appropriate headers</p>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Usage Examples</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">JavaScript/Fetch:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Upload file
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folderPath', 'documents');

const response = await fetch('/api/file/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('File URL:', result.data.url);

// Download file
window.open('/api/file/download?url=' + encodeURIComponent(result.data.url));`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Store URL in your schema:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const userSchema = new mongoose.Schema({
  name: String,
  avatar: String,        // Store the file URL here
  resume: String,        // Store document URLs
  documents: [String]    // Array of file URLs
});`}
                </pre>
              </div>
            </div>
          </div>

          {/* Test Endpoints */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🧪 Test Endpoints</h2>
            <div className="space-y-4">
              <a
                href="/api/test"
                target="_blank"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Test MongoDB Connection
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
