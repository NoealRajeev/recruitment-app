# Manpower Recruitment Web Application

A full-stack Next.js 14 application for managing foreign labor recruitment. This system is designed for a middleman agency (Party 1) to facilitate connections between client companies (Party 2) and recruitment agencies. The application offers both a public-facing website and a secure dashboard for logged-in clients to manage their requirements.

---

## 🌐 Live Preview

> (Add deployment link here when available)

---

## 📦 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Session-based (Pluggable)
- **Icons**: Lucide Icons
- **Form Handling**: React Hook Form
- **API Communication**: Axios

---

## 🎯 Purpose

This application streamlines the recruitment process by:

- Offering a clean, informative landing page
- Allowing companies to submit labor requirements
- Guiding them through a structured recruitment process
- Giving access to a dashboard to manage applications and feedback

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
