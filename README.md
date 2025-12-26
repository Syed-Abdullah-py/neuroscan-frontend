# NeuroScan Frontend

NeuroScan is a medical imaging analytics platform designed to empower radiologists with real-time AI segmentation, volumetric analysis, and case management tools. This repository contains the Next.js frontend application.

## 🚀 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion (Code-driven animations)
- **Database:** SQLite (via Prisma ORM)
- **Authentication:** Custom JWT-based Auth (Server Actions)
- **Validation:** Zod

## 📂 Project Structure

```bash
├── actions/             # Server Actions (Backend Logic)
│   ├── auth-actions.ts  # Login/Signup/Logout logic
│   └── user-actions.ts  # User management logic
├── app/                 # App Router Pages & API Routes
│   ├── (auth)/          # Authentication routes (login/signup)
│   └── (doctor)/        # Doctor dashboard routes
├── features/            # Feature-based Modular Architecture
│   └── auth/
│       └── components/  # Auth UI components (Forms, Scanners)
├── lib/                 # Shared Utilities
│   ├── prisma.ts        # Database Client Singleton
│   └── utils.tsx        # Helper functions (cn, formatBytes)
└── prisma/              # Database Schema & Migrations
    └── schema.prisma    # Data Models
```

## 💾 Database Schema

The application uses **Prisma** with a local **SQLite** database. Key models include:

### User
Represents system users (Doctors/Admins).
- **Role:** `DOCTOR` or `ADMIN`.
- **Auth:** Email/Password (hashed with bcrypt).
- **Relations:** owns `assignedCases` and `uploadedCases`.

### Case
Represents a medical imaging case (MRI/CT Scan).
- **Status:** `PENDING`, `PROCESSING`, `COMPLETED`.
- **Data:** `scanUrl`, `maskUrl` (AI output), `priority`.
- **Relations:** Linked to a `Patient` and a `Doctor`.

### Patient
Represents the subject of the medical scans.

## 🔄 Data Flow

1.  **User Interaction:** User submits a form (e.g., Login).
2.  **Server Action:** The request is handled by a function in `actions/*` (e.g., `loginUser`).
3.  **Validation:** Input is validated using **Zod** schemas.
4.  **Database:** Prisma Client queries the SQLite database.
5.  **Response:** The Server Action returns success or error messages, or performs a redirect.

## 🛠️ Key Functions

### Authentication (`actions/auth-actions.ts`)
- `registerUser`: Validates input, checks for existing emails, hashes password, and creates a user.
- `loginUser`: Verifies credentials, generates a signed JWT, and sets a secure `session` cookie.

### Utils (`lib/utils.tsx`)
- `cn`: Utility for merging Tailwind classes conditionally.
- `formatBytes`: Helpers for displaying file sizes in the UI.

## 📦 Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Setup Database:**
    ```bash
    npx prisma migrate dev --name init
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Open:** [http://localhost:3000](http://localhost:3000)
