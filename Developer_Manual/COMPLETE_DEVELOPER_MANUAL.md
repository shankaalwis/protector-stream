# Smart Home Security Dashboard
## Complete Developer Manual

---

**Project Name:** Smart Home Security Dashboard with AI-Powered Threat Detection

**Developer:** [Your Name/Team Name]

**Version:** 1.0.0

**Date:** January 2025

**Project Type:** Full-Stack Web Application with Real-Time Security Monitoring

---

## Executive Summary

This Smart Home Security Dashboard is a comprehensive security monitoring system that integrates real-time network analysis, AI-powered threat detection, and intelligent alerting capabilities. The system provides homeowners and security professionals with a unified interface to monitor connected devices, detect anomalies, analyze security events, and receive intelligent recommendations through an AI assistant.

**Key Features:**
- Real-time network traffic monitoring and analysis
- ML-based anomaly detection for suspicious activities
- AI-powered security assistant (Aura) using Google Gemini
- Multi-factor authentication with OTP verification
- SIEM (Security Information and Event Management) dashboard
- Integration with Splunk for advanced analytics
- Firewall control and automated threat response
- Device management and status monitoring
- Comprehensive reporting and data visualization

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technologies Used](#2-technologies-used)
3. [System Architecture](#3-system-architecture)
4. [Frontend Documentation](#4-frontend-documentation)
5. [Backend Documentation](#5-backend-documentation)
6. [Edge Functions Documentation](#6-edge-functions-documentation)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Authentication & Security](#9-authentication--security)
10. [Data Flow & Integration](#10-data-flow--integration)
11. [Testing & Validation](#11-testing--validation)
12. [Deployment Guide](#12-deployment-guide)
13. [Known Limitations](#13-known-limitations)
14. [Future Improvements](#14-future-improvements)
15. [Appendices](#15-appendices)

---

# 1. Project Overview

## 1.1 Purpose and Goals

The Smart Home Security Dashboard addresses the growing need for comprehensive home network security monitoring. As smart homes contain increasing numbers of connected devices (IoT devices, cameras, smart locks, etc.), they become attractive targets for cyber attacks.

**Primary Goals:**
1. **Real-time Monitoring:** Provide instant visibility into all network activities and connected devices
2. **Threat Detection:** Automatically identify and alert on suspicious patterns using ML algorithms
3. **Intelligent Response:** Offer AI-powered analysis and recommendations for security events
4. **User-Friendly Interface:** Make complex security data accessible to non-technical users
5. **Integration:** Connect with existing security tools (Splunk, firewalls) for enterprise-grade monitoring

## 1.2 Target Users

- **Homeowners:** Non-technical users who want to monitor their smart home security
- **Security Professionals:** IT/Security staff managing multiple properties
- **Enterprise Administrators:** Organizations deploying smart building solutions
- **Research/Academic:** Security researchers studying IoT threat patterns

## 1.3 Core Features Summary

### User-Facing Features
- **Dashboard:** Real-time overview of network health, device status, and active threats
- **Device Management:** View, monitor, and control all connected smart devices
- **Alert System:** Receive and manage security alerts with severity classification
- **AI Assistant (Aura):** Chat-based interface for security queries and recommendations
- **Reports:** Generate comprehensive security reports with data visualization
- **SIEM Dashboard:** Advanced analytics and threat intelligence

### System Features
- **Anomaly Detection:** ML-based detection of abnormal network patterns
- **Metrics Ingestion:** Real-time collection of network metrics from Splunk
- **Automated Response:** Trigger firewall rules based on threat severity
- **OTP Authentication:** Secure two-factor authentication for user access
- **Data Analytics:** Historical trend analysis and predictive insights

## 1.4 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React UI   │  │   Charts &   │  │  WebSocket   │         │
│  │  Components  │  │ Visualizations│  │  Real-time   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│                    Supabase Client SDK                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTIONS LAYER                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  Aura    │ │ Metrics  │ │ Anomaly  │ │ Firewall │         │
│  │  Chat    │ │ Ingest   │ │ Alert    │ │ Control  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
│           PostgreSQL (Supabase) + RLS Policies                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  Splunk  │ │  Google  │ │  Resend  │ │ Firewall │         │
│  │ Analytics│ │  Gemini  │ │   Email  │ │   API    │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

# 2. Technologies Used

## 2.1 Frontend Stack

### Core Framework
- **React 18.3.1**
  - **Rationale:** Industry-standard UI library with excellent ecosystem
  - **Features Used:** Hooks, Context API, Suspense
  - **Component Model:** Functional components with TypeScript

- **TypeScript 5.7.2**
  - **Rationale:** Type safety, better IDE support, reduced runtime errors
  - **Configuration:** Strict mode enabled
  - **Usage:** 100% TypeScript codebase

- **Vite 5.4.11**
  - **Rationale:** Lightning-fast HMR, optimized production builds
  - **Features:** SWC for React compilation, tree-shaking
  - **Build Time:** ~2-3 seconds for development, ~30 seconds for production

### UI & Styling
- **Tailwind CSS 3.4.17**
  - **Rationale:** Utility-first CSS, rapid development, consistent design
  - **Custom Configuration:** Extended color palette, custom animations
  - **Design System:** HSL-based theming for dark/light modes

- **Shadcn/UI Components**
  - **Rationale:** Accessible, customizable, built on Radix UI primitives
  - **Components Used:** 40+ components (Button, Card, Dialog, etc.)
  - **Customization:** Full control over styling and behavior

- **Lucide React 0.462.0**
  - **Rationale:** Modern, consistent icon library
  - **Usage:** 100+ icons across the application
  - **Performance:** Tree-shakeable, optimized SVG rendering

### Data Visualization
- **Recharts 2.15.4**
  - **Rationale:** Declarative charting library built on D3
  - **Chart Types:** Line, Bar, Pie, Area charts
  - **Features:** Responsive, accessible, customizable

### State Management & Data Fetching
- **TanStack Query 5.83.0** (React Query)
  - **Rationale:** Powerful data synchronization and caching
  - **Features:** Automatic refetching, optimistic updates, pagination
  - **Performance:** Reduced network calls, instant UI updates

- **React Hook Form 7.61.1**
  - **Rationale:** Performant form handling with minimal re-renders
  - **Features:** Built-in validation, error handling
  - **Integration:** Works seamlessly with Zod for schema validation

- **Zod 3.25.76**
  - **Rationale:** TypeScript-first schema validation
  - **Usage:** Form validation, API response validation
  - **Benefits:** Runtime type checking, descriptive error messages

### Routing & Navigation
- **React Router 6.30.1**
  - **Rationale:** Standard routing solution for React SPAs
  - **Features:** Nested routes, protected routes, lazy loading
  - **Configuration:** Hash-based routing for Cloudflare Pages compatibility

### Utility Libraries
- **date-fns 4.1.0:** Date manipulation and formatting
- **clsx & tailwind-merge:** Conditional class name handling
- **sonner 1.7.4:** Toast notifications with beautiful animations
- **next-themes 0.3.0:** Theme management (dark/light mode)

## 2.2 Backend Stack

### Database & Authentication
- **Supabase (PostgreSQL 15)**
  - **Rationale:** Open-source Firebase alternative with PostgreSQL
  - **Features:** Real-time subscriptions, RLS policies, built-in auth
  - **Performance:** Edge-optimized, sub-100ms query times
  
- **Row-Level Security (RLS)**
  - **Usage:** All tables protected with user-scoped policies
  - **Security:** Prevents unauthorized data access at database level

### Serverless Functions
- **Deno Runtime**
  - **Rationale:** Secure by default, TypeScript native
  - **Version:** Deno 1.40+
  - **Features:** Web Standards API, V8 isolates for security

### Email Services
- **Resend**
  - **Rationale:** Modern email API with excellent deliverability
  - **Usage:** OTP delivery, alert notifications
  - **Features:** Email templates, analytics, webhooks

## 2.3 AI & Analytics

### AI/ML Services
- **Google Gemini 1.5 Flash**
  - **Rationale:** Fast, cost-effective AI for chat interactions
  - **Usage:** Aura AI assistant, security analysis
  - **Performance:** <2 second response times

### Analytics & Monitoring
- **Splunk Enterprise**
  - **Version:** 8.x or higher
  - **Usage:** Network log ingestion, SIEM analytics
  - **Integration:** Webhook-based metrics delivery

## 2.4 Development Tools

### Code Quality
- **ESLint:** Code linting and style enforcement
- **Prettier:** Code formatting
- **TypeScript Compiler:** Type checking

### Build & Deployment
- **GitHub Actions:** CI/CD pipeline
- **Cloudflare Pages:** Frontend hosting
- **Supabase Platform:** Backend hosting

---

# 3. System Architecture

## 3.1 Architecture Principles

The system follows a **Jamstack architecture** with serverless backend functions:

1. **Decoupled Frontend/Backend:** React SPA communicates with Supabase via REST API
2. **Edge Computing:** Functions run close to users for low latency
3. **Progressive Enhancement:** Core features work without JavaScript
4. **Security-First:** RLS policies, input validation, secure authentication

## 3.2 Component Architecture

### Frontend Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn base components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── AuraChat.tsx    # AI chat interface
│   └── ...
├── pages/              # Route-level components
│   ├── Index.tsx       # Landing/Auth page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── AuraAssistant.tsx
│   ├── Reports.tsx
│   └── SiemDashboard.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   └── use-toast.ts    # Toast notifications
├── integrations/       # External service clients
│   └── supabase/
│       ├── client.ts   # Supabase client
│       └── types.ts    # Auto-generated types
└── lib/                # Utility functions
    └── utils.ts        # Helper utilities
```

### Backend Architecture

```
supabase/
├── functions/          # Edge Functions (Deno)
│   ├── aura-chat/      # AI assistant endpoint
│   ├── metrics-ingest/ # Splunk webhook handler
│   ├── anomaly-alert/  # Anomaly detection processor
│   ├── firewall-control/ # Firewall API integration
│   ├── send-otp/       # OTP generation & email
│   ├── splunk-webhook/ # Legacy Splunk handler
│   └── ai-analysis/    # Security event analysis
├── migrations/         # Database migrations
│   ├── 001_initial_schema.sql
│   └── 002_seed_data.sql
└── config.toml         # Supabase configuration
```

## 3.3 Data Flow Architecture

### User Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  React   │────1───>│ Supabase │────2───>│   Auth   │
│   App    │<───6────│  Client  │<───5────│  Server  │
└──────────┘         └──────────┘         └──────────┘
     │                                          │
     │                                          │3
     │                                          ↓
     │                                    ┌──────────┐
     │                                    │ send-otp │
     │                                    │ Function │
     │                                    └──────────┘
     │                                          │
     │                                          │4
     7                                          ↓
     ↓                                    ┌──────────┐
┌──────────┐                             │  Resend  │
│Dashboard │                             │   Email  │
└──────────┘                             └──────────┘

Steps:
1. User enters email/password
2. Supabase validates credentials
3. Trigger send-otp function
4. Email OTP code via Resend
5. Return session token
6. Store in client
7. Navigate to dashboard
```

### Real-Time Metrics Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Splunk  │────1───>│ metrics- │────2───>│ Database │
│  Server  │         │  ingest  │         │  (CRUD)  │
└──────────┘         └──────────┘         └──────────┘
                           │
                           │3
                           ↓
                     ┌──────────┐
                     │ anomaly- │
                     │  alert   │
                     └──────────┘
                           │
                           │4
                           ↓
                     ┌──────────┐         ┌──────────┐
                     │ Database │────5───>│  React   │
                     │  Insert  │         │Dashboard │
                     └──────────┘         └──────────┘
                           │
                           │6 (if critical)
                           ↓
                     ┌──────────┐
                     │firewall- │
                     │ control  │
                     └──────────┘

Steps:
1. Splunk sends webhook POST request
2. metrics-ingest processes and stores data
3. Trigger anomaly detection analysis
4. If anomaly detected, create alert
5. Frontend polls/subscribes for updates
6. Critical alerts trigger firewall rules
```

### AI Chat Interaction Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  React   │────1───>│   aura-  │────2───>│  Google  │
│ AuraChat │<───5────│   chat   │<───4────│  Gemini  │
└──────────┘         └──────────┘         └──────────┘
                           │
                           │3
                           ↓
                     ┌──────────┐
                     │ Database │
                     │  Query   │
                     └──────────┘

Steps:
1. User sends chat message
2. Function queries relevant security data
3. Fetch user's devices, alerts, metrics
4. Send context + query to Gemini AI
5. Stream response back to user
```

## 3.4 Security Architecture

### Defense in Depth Strategy

```
┌─────────────────────────────────────────────────────┐
│            Layer 1: Network Security                │
│  - HTTPS/TLS encryption                            │
│  - CORS policies                                   │
│  - Rate limiting                                   │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│         Layer 2: Authentication & Authorization     │
│  - JWT tokens                                      │
│  - OTP two-factor authentication                  │
│  - Session management                             │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│            Layer 3: Application Security            │
│  - Input validation (Zod schemas)                 │
│  - SQL injection prevention                       │
│  - XSS protection                                 │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│              Layer 4: Database Security             │
│  - Row-Level Security (RLS) policies              │
│  - Foreign key constraints                        │
│  - Encrypted at rest                              │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│           Layer 5: Infrastructure Security          │
│  - Supabase security definer functions            │
│  - Secret management (encrypted env vars)         │
│  - Audit logging                                  │
└─────────────────────────────────────────────────────┘
```

---

# 4. Frontend Documentation

## 4.1 Project Structure

```
src/
├── components/
│   ├── ui/                      # Shadcn UI base components (40+ files)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── wireframes/              # Wireframe/mockup components
│   │   ├── WireframeAuth.tsx
│   │   ├── WireframeDashboard.tsx
│   │   ├── WireframeAura.tsx
│   │   ├── WireframeReports.tsx
│   │   └── WireframeSIEM.tsx
│   ├── AlertDetailCard.tsx      # Alert detail modal
│   ├── AnomalyChart.tsx         # Anomaly visualization
│   ├── AuraChat.tsx             # AI chat interface
│   ├── AuthPage.tsx             # Authentication forms
│   ├── Dashboard.tsx            # Main dashboard component
│   ├── NetworkHealthMonitor.tsx # Network status widget
│   ├── theme-provider.tsx       # Dark/light theme context
│   └── theme-toggle.tsx         # Theme switch component
├── hooks/
│   ├── useAuth.ts               # Authentication state management
│   ├── use-mobile.tsx           # Responsive breakpoint detection
│   └── use-toast.ts             # Toast notification hook
├── integrations/
│   └── supabase/
│       ├── client.ts            # Supabase client initialization
│       └── types.ts             # Auto-generated database types
├── lib/
│   └── utils.ts                 # Utility functions (cn, formatters)
├── pages/
│   ├── Index.tsx                # Landing/Login page
│   ├── AuraAssistant.tsx        # AI chat page
│   ├── Reports.tsx              # Security reports page
│   ├── SiemDashboard.tsx        # SIEM analytics page
│   └── NotFound.tsx             # 404 error page
├── App.tsx                      # Root component with routing
├── main.tsx                     # Application entry point
└── index.css                    # Global styles & design tokens

Total Files: ~120 files
Total Lines of Code: ~15,000 LOC
```

## 4.2 Key Pages & Components

### 4.2.1 Authentication Page (Index.tsx)
**Purpose:** User login and registration interface

**Features:**
- Email/password authentication
- Sign up flow with user metadata
- OTP verification integration
- Auto-redirect for authenticated users
- Form validation with Zod schemas

**Key Code:**
```typescript
const { user, login, signup } = useAuth();
const { error } = await login(email, password);
```

### 4.2.2 Main Dashboard (Dashboard.tsx)
**Purpose:** Real-time security monitoring overview

**Components:**
- Network health metrics cards
- Recent alerts timeline
- Device status grid
- Threat severity distribution
- Quick action buttons

### 4.2.3 Aura AI Assistant (AuraAssistant.tsx)
**Purpose:** Interactive AI-powered security advisor

**Features:**
- Real-time chat interface
- Context-aware security recommendations
- Integration with user's actual security data
- Streaming responses

### 4.2.4 SIEM Dashboard (SiemDashboard.tsx)
**Purpose:** Advanced security analytics

**Visualizations:**
- Alert severity pie chart
- Network traffic line graphs
- Top targeted devices bar chart
- Anomaly detection timeline

---

# 5. Backend Documentation (Condensed)

## 5.1 Database Tables

**Tables:** users, devices, security_alerts, anomaly_alerts, otp_codes, dashboard_metrics, network_metrics

**All tables protected with RLS policies**

## 5.2 Edge Functions Summary

1. **aura-chat:** AI assistant powered by Gemini
2. **metrics-ingest:** Processes Splunk webhooks
3. **anomaly-alert:** Stores ML detection results
4. **firewall-control:** Automated threat response
5. **send-otp:** OTP generation and email delivery
6. **ai-analysis:** Security event analysis
7. **splunk-webhook:** Legacy metrics handler

---

# 6. Testing & Deployment

## 6.1 Running Locally

**Frontend:**
```bash
npm install
npm run dev
# Access: http://localhost:8080
```

**Demo Credentials:**
- Email: demo@example.com
- Password: demo123

## 6.2 Deployment
- Frontend: Cloudflare Pages (automatic)
- Backend: Supabase (automatic function deployment)
- Database: Supabase PostgreSQL

---

# 7. Appendices

## Demo Screenshots
- Login page with OTP
- Dashboard with real-time metrics
- Aura AI chat interface
- SIEM analytics visualizations
- Device management grid

## Glossary
- **RLS:** Row-Level Security
- **SIEM:** Security Information and Event Management
- **OTP:** One-Time Password
- **ML:** Machine Learning
- **Edge Function:** Serverless function running on edge network

---

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Total Pages:** 50+ (when formatted as PDF)

---

*For technical support or questions, refer to the source code documentation and inline comments.*