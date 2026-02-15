
```markdown
# Implementation Plan: Universal File Storage (Hackathon)

## Context
**Goal:** Implement a unified storage solution for **images, audio, and Word documents** quickly for a hackathon.
**Stack:** PostgreSQL, Drizzle ORM, React Frontend, Express API (or similar).
**Strategy:** Use **Supabase Storage** for the actual files and **Postgres (Drizzle)** for metadata. 

**Core Principle:** 1. Files are uploaded directly from Frontend -> Supabase Storage (saves backend bandwidth).
2. Metadata is saved from Frontend -> API -> Postgres.

---

## 1. Supabase Configuration

**Action:** Set up a storage bucket.

1.  Create a new Storage Bucket named: `uploads`.
2.  **Permissions:** Set bucket to **Public** (for hackathon speed/ease).
3.  **CORS:** Ensure CORS is configured to allow uploads from the frontend domain.

---

## 2. Database Schema (Drizzle)

**Action:** Create a single table to track all file types.

**File:** `schema.ts`

```typescript
import { pgTable, text, integer, uuid, timestamp } from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  // The unique path in the bucket (e.g., "uuid-filename.ext")
  // THIS IS THE SOURCE OF TRUTH
  storageKey: text("storage_key").notNull().unique(),

  // The public access URL (cached for convenience)
  url: text("url").notNull(),

  // Metadata
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),

  // Optional: Link to user if auth is implemented
  uploadedBy: uuid("uploaded_by"), 
  
  createdAt: timestamp("created_at").defaultNow()
});

```

---

## 3. Frontend Implementation (React)

**Action:** Implement direct upload to Supabase, then save metadata to our API.

### A. Upload Utility

Do not pipe binary data through our own API. Upload directly to Supabase via REST.

```typescript
// utils/upload.ts

const SUPABASE_PROJECT_ID = "your-project-id";
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = "your-anon-key";

export async function uploadFile(file: File) {
  // 1. Generate a unique key
  const uniqueId = crypto.randomUUID();
  const storageKey = `${uniqueId}-${file.name}`; // This is the storageKey

  // 2. Upload to Supabase
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/uploads/${storageKey}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        // content-type is automatically handled by fetch with BodyInit
      },
      body: file
    }
  );

  if (!res.ok) throw new Error("Upload failed");

  // 3. Construct Public URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/uploads/${storageKey}`;

  return {
    storageKey,
    publicUrl,
    name: file.name,
    mimeType: file.type,
    size: file.size
  };
}

```

### B. Logic Flow (Component Level)

1. User selects file.
2. Call `uploadFile(file)`.
3. Take the result (storageKey, url, etc.) and `POST` it to **our** backend API to save the row in Postgres.

---

## 4. Backend Implementation (API)

**Action:** Endpoint to save file metadata.

```typescript
// api/files.ts (Pseudo-code)

app.post('/api/files', async (req, res) => {
  const { storageKey, url, name, mimeType, size, userId } = req.body;

  await db.insert(files).values({
    storageKey,
    url,
    name,
    mimeType,
    size,
    uploadedBy: userId // if applicable
  });

  res.json({ success: true });
});

```

---

## 5. UI Rendering Strategy

**Action:** Render component based on `mimeType` stored in DB.

```tsx
function FilePreview({ file }) {
  const { mimeType, url } = file;

  // Images
  if (mimeType.startsWith("image/")) {
    return <img src={url} alt="preview" className="max-w-full h-auto" />;
  }

  // Audio
  if (mimeType.startsWith("audio/")) {
    return <audio controls src={url} />;
  }

  // PDFs
  if (mimeType.includes("pdf")) {
    return <iframe src={url} className="w-full h-64" />;
  }

  // Word Docs / Others
  return (
    <div className="p-4 border rounded">
      <p>Document: {file.name}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
        Download / View
      </a>
    </div>
  );
}

```

```

```