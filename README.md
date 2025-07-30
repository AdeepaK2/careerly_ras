# Careerly - Career Connecting Platform

A Next.js career platform connecting undergraduates with employers.

## 🚀 Quick Setup

1. Clone repo and install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/...
   R2_ACCESS_KEY_ID=your_r2_access_key
   R2_SECRET_ACCESS_KEY=your_r2_secret
   R2_BUCKET_NAME=your_bucket
   R2_ENDPOINT=https://your-endpoint.r2.cloudflarestorage.com/bucket
   MAIL_ID=your-email@gmail.com
   MAIL_PW=your_gmail_app_password
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure & Guidelines

### **Schemas** → Use `src/lib/modals/`
```typescript
// src/lib/modals/userSchema.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  profilePicture: String // Store file URLs here
});

export default mongoose.models.User || mongoose.model("User", userSchema);
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
