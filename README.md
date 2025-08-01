# Careerly - Career Connecting Platform

A Next.js career platform connecting undergraduates with employers featuring JWT-based authentication, email verification, and role-based access control.

## 🚀 Quick Setup

1. Clone repo and install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/...
   
   # JWT Secrets for Undergraduate Authentication
   UNDERGRAD_JWT_SECRET=your_jwt_secret_key
   UNDERGRAD_REFRESH_SECRET=your_refresh_secret_key
   UNDERGRAD_EMAIL_VERIFICATION_SECRET=your_email_verification_secret
   
   # R2 Storage (Cloudflare)
   R2_ACCESS_KEY_ID=your_r2_access_key
   R2_SECRET_ACCESS_KEY=your_r2_secret
   R2_BUCKET_NAME=your_bucket
   R2_ENDPOINT=https://your-endpoint.r2.cloudflarestorage.com/bucket
   
   # Email Service (Gmail)
   MAIL_ID=your-email@gmail.com
   MAIL_PW=your_gmail_app_password
   
   # Base URL for email verification links
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## � Authentication System

### Overview
- **JWT-based authentication** with access tokens (7 days) and refresh tokens (30 days)
- **Email verification** system with automated emails
- **Password hashing** using bcryptjs with 12 salt rounds
- **HTTP-only cookies** for refresh tokens (secure)
- **Role-based access** (currently supporting undergraduate users)

### Auth Context Usage

#### Frontend Integration
**Key Hook:** Import `useAuth` from `@/contexts/AuthContext`

```typescript
// 🎯 ONE LINE TO GET AUTH CONTEXT
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading, login, register, logout } = useAuth();
  
  // ✅ Check authentication status
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  // 🎯 Access user data directly
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.universityEmail}</p>
      <p>Index: {user.index}</p>
      <p>Verified: {user.isVerified ? '✅' : '❌'}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**What you get from `user` object:**
- `id`, `index`, `name`, `nameWithInitials`
- `universityEmail`, `batch`, `education`
- `isVerified`, `jobSearchingStatus`
- `profilePicUrl`, `lastLogin`

#### Protected Routes
**Component:** Import `ProtectedRoute` from `@/components/ProtectedRoute`

```typescript
// 🎯 ONE WRAPPER TO PROTECT PAGES
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {/* Your protected content - user is guaranteed to be authenticated */}
      <div>Only logged-in users see this</div>
    </ProtectedRoute>
  );
}
```

### API Authentication

#### For Developers: Protecting API Routes
**Key Function:** Import `verifyUndergradAuth` from `@/lib/auth/undergraduate/middleware`

```typescript
// Import authentication middleware
import { verifyUndergradAuth } from '@/lib/auth/undergraduate/middleware';
import connect from "@/utils/db";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // ✅ ONE LINE TO AUTHENTICATE USER
    const authResult = await verifyUndergradAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: authResult.error || "Authentication failed"
      }, { status: 401 });
    }
    
    // 🎯 Access authenticated user data
    const userId = authResult.user.id;
    const userEmail = authResult.user.universityEmail;
    const userIndex = authResult.user.index;
    
    // Your protected logic here
    return NextResponse.json({ 
      success: true, 
      data: `Hello ${authResult.user.name}!` 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Server error" 
    }, { status: 500 });
  }
}
```

**What you get from `authResult.user`:**
- `id` - User MongoDB ID
- `index` - University index number  
- `universityEmail` - Verified email
- `name` - Full name
- `isVerified` - Email verification status
- `type` - Always 'undergraduate'

## �📁 Project Structure & Guidelines

### **Models** → Use `src/lib/models/` (Mongoose Only)
We use **Mongoose validation only** (Zod removed for simplicity).

```typescript
// src/lib/models/undergraduate.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const undergraduateSchema = new mongoose.Schema({
  index: {
    type: String,
    required: [true, 'Index number is required'],
    unique: true,
    trim: true
  },
  universityEmail: {
    type: String,
    required: [true, 'University email is required'],
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Add validation directly in schema
  address: {
    type: String,
    required: true,
    minlength: [3, 'Address must be at least 3 characters']
  }
}, {
  timestamps: true
});

// Add methods and middleware
undergraduateSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Undergraduate || mongoose.model("Undergraduate", undergraduateSchema);
```

### **APIs** → Use `src/app/api/`
```typescript
// src/app/api/users/route.ts
import connect from "@/utils/db";
import UserModel from "@/lib/modals/userSchema";

export async function GET() {
  await connect(); // Always connect first
  const users = await UserModel.find({});
  return Response.json({ users });
}
```

### **Services** → Use `src/lib/services/`
```typescript
// Use existing emailService.ts
import { sendEmail, emailTemplates } from "@/lib/services/emailService";
```

## 🔧 How to Use Core Features

### **Database Connection**
```typescript
import connect from "@/utils/db";

// In any API route:
export async function GET() {
  await connect(); // Always call this first
  // Your database operations here
}
```

### **File Upload API**
**Endpoint:** `POST /api/file/upload`

**Takes:**
- `file` (FormData) - The file to upload
- `folderPath` (optional) - Folder like "documents/resumes"

**Returns:**
```json
{
  "success": true,
  "data": {
    "url": "https://r2-endpoint/path/file.pdf",
    "fileName": "timestamp-filename.pdf",
    "originalName": "resume.pdf",
    "mimeType": "application/pdf",
    "size": 123456
  }
}
```

### **File Download API**
**Endpoint:** `GET /api/file/download?url=FILE_URL`

**Takes:**
- `url` (query param) - The file URL from upload response

**Returns:** Direct file download

### **Usage Example:**
```typescript
// Upload
const formData = new FormData();
formData.append('file', file);
const response = await fetch('/api/file/upload', { method: 'POST', body: formData });
const { data } = await response.json();

// Store the URL in your schema
await UserModel.findByIdAndUpdate(userId, { resume: data.url });

// Download
window.open(`/api/file/download?url=${encodeURIComponent(data.url)}`);
```

## 🔄 Git Workflow & CI

### **⚠️ CRITICAL RULES:**
1. **NEVER merge to `main`**
2. **Always use `dev` branch**
3. **CI checks must pass**

### **Workflow:**
```bash
# Always start from dev
git checkout dev
git pull origin dev
git checkout -b feature/your-feature

# Work and commit
git add .
git commit -m "feat: your changes"
git push origin feature/your-feature

# Create PR to dev (NOT main)
```

### **CI Workflow:**
- Automatically checks TypeScript compilation
- Runs linting and build tests
- **Blocks direct merges to main**
- **Only allows feature → dev → main flow**

### **Branch Strategy:**
- `main` = Production only
- `dev` = All development work
- `feature/*` = Individual features

---

**Prepared by AdeepaK**

**Remember: dev first, main never! 🚨**
