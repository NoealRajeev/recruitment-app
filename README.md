# Findly - Manpower Recruitment Platform

A full-stack Next.js 14 application for managing foreign labor recruitment. This system is designed for a middleman agency (BreaktroughF1 LLP) to facilitate connections between client companies in Qatar and recruitment agencies. The application offers both a public-facing website and a secure dashboard for logged-in clients to manage their requirements.

---

## 🌐 Live Preview

> (Add deployment link here when available)

---

## 📦 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js (Session-based)
- **File Storage**: AWS S3
- **Real-time**: WebSocket Server
- **Form Handling**: React Hook Form + Zod validation
- **API Communication**: Axios
- **Deployment**: Vercel with AWS EC2 fallback
- **Email**: SMTP integration

---

## 🎯 Purpose & Features

Findly is a web-based control-center that helps companies in Qatar bring in skilled blue-collar workers from abroad without drowning in paperwork. It serves as a digital "assembly line" that moves every candidate from first enquiry to arrival on site, keeping everyone—HR teams, overseas agents, and the workers themselves—on the same page.

### Key Features

- **Multi-role Platform**: Serves clients (companies in Qatar), agencies (recruiting partners), and admins (internal ops team)
- **Streamlined Workflow**: From requirement creation to candidate arrival
- **Document Management**: Secure storage and handling of important documents
- **Real-time Updates**: Instant notifications across all parties
- **Compliance**: Built-in audit trails and role-based access control
- **Internationalization**: Support for multiple languages

---

## 📁 Folder Structure Overview

Here's a breakdown of the main folders and what they contain:

```tree

├── app/                   # All route-based pages (App Router)
├── components/           # Reusable UI components
├── lib/                  # Shared logic: API, Auth, and Utilities
├── public/               # Static assets like images, SVGs
├── types/                # TypeScript definitions
├── config & root files   # Next.js config, ESLint, TSConfig, etc.

```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Environment Setup

1. Clone the repository
2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your configuration:
   - Set up your PostgreSQL database connection string
   - Configure authentication secrets
   - Set up email service credentials
   - Configure AWS credentials (if using S3 for file storage)

### Installation

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# Start the development server
npm run dev
```

### Running the WebSocket Server

```bash
# In a separate terminal
node websocket-server.js
```

---

## 🏗️ Architecture

### Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **Users**: Different user roles (Client Admin, Recruitment Agency, Recruitment Admin)
- **Requirements**: Job requirements posted by clients
- **Candidates**: Worker profiles submitted by agencies
- **Documents**: Secure storage of important documents (passports, medical certificates, etc.)
- **Notifications**: System for real-time updates

### Workflow

1. **Create a Requirement**: Client posts job requirements
2. **Add Candidates**: Agency submits worker profiles and documents
3. **Review & Shortlist**: Client reviews and selects candidates
4. **Visa Processing**: System tracks document collection and visa status
5. **Final Boarding**: Worker travels and arrives on site

---

## 🔒 Security & Compliance

- **Role-based Access Control**: Users only see what their role allows
- **Audit Trail**: Every field change is time-stamped for legal audits
- **Secure Document Storage**: Documents are stored in private S3 buckets with expiring URLs
- **Data Privacy**: GDPR-style opt-in with data deletion options
- **Authentication**: Secure session-based authentication with NextAuth.js

---

## 📂 app/

This directory contains all the route-based pages of the application using Next.js App Router (app directory structure). Each subfolder represents a route, and each `page.tsx` is a page component for that route.

### 📄 page.tsx

- **Path:** `/`
- **Description:** The landing page of the application. Contains hero, services, process overview, and contact CTA.

### 📂 about/

- **Path:** `/about`
- **Purpose:** Company introduction, mission, values, team info, and industries served.

### 📂 auth/

- **Path:** `/auth`
- Contains authentication-related pages.
  - **📄 login/page.tsx** – Login page for Party 2 clients.
  - **📂 register/** – Reserved for future client registration functionality.

### 📂 contact/

- **Path:** `/contact`
- **Purpose:** Contact page with email, phone, and embedded map. Includes a message form for client queries.

### 📂 process/

- **Path:** `/process`
- **Purpose:** Detailed breakdown of the manpower recruitment lifecycle – from requirement submission to deployment.

### 📂 submit-requirement/

- **Path:** `/submit-requirement`
- **Purpose:** Public form page for clients to submit their manpower needs. Accessible before login.

### 📂 dashboard/

- **Path:** `/dashboard`
- **Purpose:** Protected area for logged-in clients (Party 2). Includes multiple subpages:

  - **📄 page.tsx** – Dashboard home/overview.
  - **📄 layout.tsx** – Dashboard layout wrapper with sidebar and header.

  #### Subroutes:

  - **📂 requirements/**
    - **📄 page.tsx** – View all submitted requirements.
    - **📄 [id]/page.tsx** – View details of a specific requirement (dynamic route).
  - **📂 applications/** – View shortlisted candidates and application statuses.
  - **📂 feedback/** – Submit or view feedback regarding services and candidates.
  - **📂 profile/** – Client profile settings and preferences.

### 📄 layout.tsx

- App-level layout wrapper for global UI (header/footer).

### 📄 globals.css

- Global stylesheet for the application.

---

## 📦 components/

This folder contains all the reusable UI and layout components used across the application. It is organized into subfolders by purpose for easy maintenance and scalability.

### 📁 form/

- **📄 SubmitRequirementForm.tsx**
  - Contains the complete form used on the `/submit-requirement` page and inside the dashboard for submitting manpower needs.
  - Handles field rendering, validations, and submit events.

### 📁 icons/

- **📄 Icon.tsx**
  - Centralized icon component using Lucide icons.
  - Enables consistent icon rendering with dynamic props (name, size, color).

### 📁 layout/

- Layout-level components shared across pages.

  - **📄 Header.tsx**

    - Top navigation bar.
    - Includes logo, navigation links, profile dropdown (with Logout, Settings, etc.).

  - **📄 Footer.tsx**
    - Bottom footer section with links and contact details.
    - Appears on public pages like home, contact, about.

### 📁 sections/

- Specific to landing page content blocks. Each component maps to a section of the landing page.

  - **📄 HeroSection.tsx**

    - The hero banner with headline, subheadline, and primary CTA button.

  - **📄 ServicesSection.tsx**

    - Displays categorized services offered (Construction Workers, Masons, etc.) with icons and labels.

  - **📄 ProcessSection.tsx**

    - A visual representation of the recruitment process from submission to deployment.

  - **📄 TestimonialsSection.tsx**
    - Optional section for showing client feedback and endorsements.

### 📁 shared/

- Small reusable components shared across various parts of the app.

  - **📄 Card.tsx**
    - Generic card layout component used for displaying content blocks in a consistent style.

### 📁 ui/

- Foundational UI components used throughout the app.

  - **📄 Button.tsx**

    - Styled button component (primary, secondary, loading states).

  - **📄 Input.tsx**
    - Styled input field component with label and error handling support.

---

## 🧠 lib/

The `lib/` folder is where all shared logic and utilities live. It is structured for separation of concerns: API handling, authentication, and general helper functions.

### 📁 api/

- Contains methods for handling server and client API communication.

  - **📄 client.ts**

    - Utility functions and wrappers to make API calls from the client side (e.g., fetching data with `fetch`, Axios, etc.).
    - Can be used in React hooks or component logic.

  - **📄 server.ts**
    - API utility functions that run on the server side (e.g., fetching DB records during SSR).
    - Ideal for `getServerSideProps` or Next.js Server Actions (if used).

### 📁 auth/

- Authentication-related utilities.

  - **📄 session.ts**
    - Manages user session logic, likely using NextAuth or a custom JWT-based approach.
    - Contains logic for checking auth status, retrieving user info, or enforcing protected routes.

### 📁 utils/

- General-purpose helper functions used across the application.

  - **📄 helpers.ts**
    - Utility methods for formatting, date handling, string manipulation, validations, etc.
    - Keeps your component code clean and DRY.
