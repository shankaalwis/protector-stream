# Technical Documentation - Smart Home Security SIEM Platform

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Technologies](#frontend-technologies)
4. [Backend Technologies](#backend-technologies)
5. [Database Schema](#database-schema)
6. [Edge Functions](#edge-functions)
7. [Authentication & Security](#authentication--security)
8. [External Integrations](#external-integrations)
9. [Deployment](#deployment)
10. [Development Workflow](#development-workflow)

---

## 1. Project Overview

**Project Name:** Smart Home Security SIEM Platform  
**Type:** Full-stack Web Application  
**Purpose:** Real-time network security monitoring and threat detection platform with AI-powered analysis

### Key Features
- Real-time network anomaly detection using ML models
- Smart device monitoring and management
- AI-powered security assistant (Aura)
- Security alerts and threat analysis
- MQTT protocol monitoring
- Comprehensive security reports and analytics
- Multi-factor authentication with OTP
- Dark/Light mode support

---

## 2. Architecture Overview

### Technology Stack Summary
```
┌─────────────────────────────────────────┐
│           Frontend Layer                │
│  React + TypeScript + Vite + Tailwind   │
└─────────────────┬───────────────────────┘
                  │
                  │ REST API / Real-time
                  │
┌─────────────────▼───────────────────────┐
│         Supabase Backend                │
│  PostgreSQL + Edge Functions + Auth     │
└─────────────────┬───────────────────────┘
                  │
                  │
┌─────────────────▼───────────────────────┐
│       External Services                 │
│  OpenAI, Resend, Gemini, Splunk         │
└─────────────────────────────────────────┘
```

---

## 3. Frontend Technologies

### 3.1 Core Framework & Build Tools

#### **React 18.3.1**
- **Why:** Industry-standard UI library with excellent performance, large ecosystem, and strong community support
- **Use Cases:** Component-based architecture, state management, lifecycle management
- **Key Features Used:** Hooks, Context API, Suspense

#### **TypeScript**
- **Why:** Type safety, better IDE support, reduced runtime errors, improved code maintainability
- **Configuration:** Strict mode enabled for maximum type safety
- **Use Cases:** Type definitions for all components, API responses, and data structures

#### **Vite**
- **Why:** Lightning-fast HMR (Hot Module Replacement), optimized build times, modern ES modules support
- **Configuration:** 
  - Port: 8080
  - SWC for React compilation (faster than Babel)
  - Path aliases (`@/` for src)
- **Benefits:** Development server starts in milliseconds, instant updates on save

### 3.2 Styling & UI Components

#### **Tailwind CSS**
- **Why:** Utility-first approach, consistent design system, highly customizable, excellent performance
- **Custom Configuration:**
  - HSL color system for theme consistency
  - Custom color palette (dark-sky-blue, electric-blue, neon-green, signal-red)
  - Responsive breakpoints
  - Custom animations and transitions
- **Design Tokens:** All colors defined as CSS variables in `index.css`

#### **shadcn/ui Components**
- **Why:** Accessible, customizable, copy-paste components, built on Radix UI primitives
- **Components Used:**
  - Form controls (Input, Select, Checkbox, Switch, Radio)
  - Overlays (Dialog, Sheet, Popover, Hover Card, Tooltip)
  - Navigation (Tabs, Accordion, Navigation Menu, Sidebar)
  - Feedback (Alert, Toast/Sonner, Progress)
  - Data Display (Card, Table, Badge, Avatar)
  - Layout (Resizable Panels, Scroll Area, Separator)

#### **Radix UI Primitives**
- **Why:** Unstyled, accessible components following WAI-ARIA standards
- **Version:** Latest stable versions of 30+ Radix packages
- **Accessibility:** WCAG 2.1 compliant, keyboard navigation, screen reader support

#### **Lucide React Icons**
- **Why:** Modern, consistent icon set with 1000+ icons, tree-shakeable
- **Usage:** Navigation, status indicators, action buttons

#### **next-themes**
- **Why:** Seamless dark/light mode switching with system preference detection
- **Features:** 
  - Persistent theme storage
  - No flash on page load
  - System preference synchronization

### 3.3 State Management & Data Fetching

#### **TanStack React Query (v5.83.0)**
- **Why:** Powerful data synchronization, caching, and state management for server data
- **Use Cases:**
  - Supabase query caching
  - Real-time data synchronization
  - Automatic refetching
  - Optimistic updates
- **Benefits:** Reduces boilerplate, automatic background refetching, cache invalidation

#### **React Hook Form (v7.61.1)**
- **Why:** Performant form validation with minimal re-renders
- **Integration:** Zod schema validation resolver
- **Use Cases:** Authentication forms, device management, settings

#### **Zod (v3.25.76)**
- **Why:** TypeScript-first schema validation, type inference
- **Use Cases:** Form validation, API response validation, data parsing
- **Benefits:** Runtime and compile-time type safety

### 3.4 Data Visualization

#### **Recharts (v2.15.4)**
- **Why:** Declarative React charts built on D3, responsive, customizable
- **Charts Used:**
  - Line Chart: Network anomaly detection over time
  - Bar Chart: Top targeted clients, busiest topics
  - Area Chart: Message throughput
  - Composed Charts: Multi-metric dashboards
- **Features:** Tooltips, legends, responsive design, animations

### 3.5 Routing

#### **React Router DOM (v6.30.1)**
- **Why:** Standard routing library for React SPAs
- **Routes:**
  - `/` - Main dashboard (Index page)
  - `/siem-dashboard` - Detailed SIEM analytics
  - `/aura-assistant` - AI chat interface
  - `/reports` - Security reports and PDF export
  - `/auth` - Authentication page
  - `*` - 404 Not Found page
- **Features:** Lazy loading, protected routes, dynamic routing

### 3.6 Additional Frontend Libraries

#### **jsPDF + jsPDF-AutoTable**
- **Why:** Client-side PDF generation for reports
- **Use Cases:** Downloadable security reports with charts and tables

#### **date-fns (v4.1.0)**
- **Why:** Modern, modular date utility library
- **Use Cases:** Date formatting, time calculations, relative time display

#### **Embla Carousel React**
- **Why:** Lightweight, extensible carousel with touch support
- **Use Cases:** Image galleries, feature showcases

#### **Class Variance Authority (CVA)**
- **Why:** Type-safe component variants with Tailwind
- **Use Cases:** Button variants, card styles, badge colors

#### **clsx & tailwind-merge**
- **Why:** Conditional class merging without conflicts
- **Use Cases:** Dynamic styling, component composition

---

## 4. Backend Technologies

### 4.1 Supabase Platform

#### **PostgreSQL Database**
- **Why:** Robust, open-source relational database with excellent performance
- **Version:** Managed by Supabase (latest stable)
- **Features Used:**
  - JSONB columns for flexible data
  - Triggers for automated workflows
  - Functions for business logic
  - Foreign keys for data integrity
  - Indexes for query optimization

#### **Supabase Client (@supabase/supabase-js v2.57.4)**
- **Why:** Official client library with real-time, auth, and storage support
- **Configuration:**
  - Persistent sessions in localStorage
  - Auto-refresh tokens
  - Type-safe with generated TypeScript types
- **Features Used:**
  - Authentication API
  - Database queries (select, insert, update, delete)
  - Real-time subscriptions
  - Edge Function invocation

### 4.2 Edge Functions (Deno Runtime)

#### **Deno**
- **Why:** Secure by default, TypeScript-native, modern runtime for serverless functions
- **Version:** Managed by Supabase (Deno 1.x)
- **Benefits:**
  - No node_modules
  - Built-in TypeScript support
  - Secure permissions model
  - Web-standard APIs

#### **Edge Function Architecture**
```
Edge Function → CORS Handler → Authentication → Business Logic → Response
```

### 4.3 Edge Functions Inventory

#### **1. aura-chat**
- **Purpose:** AI-powered security assistant
- **Technology:** Lovable AI Gateway (Gemini)
- **Authentication:** JWT required
- **Features:**
  - Conversational AI for security queries
  - Context-aware responses (user devices, alerts, profile)
  - Streaming responses
  - Chat history management (JSONB storage)

#### **2. ai-analysis**
- **Purpose:** Automated threat analysis
- **Authentication:** Public (verify_jwt = false)
- **Features:**
  - AI-generated security recommendations
  - Threat severity assessment
  - Incident response suggestions

#### **3. anomaly-alert**
- **Purpose:** Real-time anomaly detection webhook
- **Authentication:** Public
- **Integration:** Splunk/SIEM systems
- **Data Processing:** Stores anomaly data with scores

#### **4. firewall-control**
- **Purpose:** Remote firewall management
- **Authentication:** Public
- **Features:**
  - Block/unblock IP addresses
  - Rule management
  - Integration with external firewall APIs

#### **5. send-otp**
- **Purpose:** Multi-factor authentication
- **Authentication:** Public
- **Integration:** Resend email service
- **Features:**
  - 6-digit OTP generation
  - 10-minute expiration
  - Email delivery via templates

#### **6. splunk-webhook**
- **Purpose:** Receive security alerts from Splunk
- **Authentication:** Public
- **Features:**
  - Alert normalization
  - Device association
  - Email notifications via Resend
  - Auto-increment threat counters

#### **7. metrics-ingest**
- **Purpose:** Dashboard metrics collection
- **Authentication:** Public
- **Metrics Handled:**
  - Top targeted clients
  - Busiest MQTT topics
  - Failed authentication attempts
  - Successful connections
  - Message throughput (rolling 60-point history)
- **Storage:** JSONB with upsert logic

---

## 5. Database Schema

### 5.1 Tables Overview

#### **users**
```sql
Primary Key: id (UUID)
Columns:
  - id: UUID (references auth.users)
  - email: TEXT (NOT NULL)
  - first_name: TEXT
  - last_name: TEXT
  - firewall_api_key: TEXT
  - phone_number: TEXT
  - client_id: TEXT
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE

RLS Policies:
  - Users can view/update/insert their own profile
  - No DELETE allowed

Purpose: Extended user profile data
```

#### **devices**
```sql
Primary Key: id (UUID)
Columns:
  - id: UUID (auto-generated)
  - user_id: UUID (NOT NULL, no FK to avoid direct auth reference)
  - device_name: TEXT (NOT NULL)
  - client_id: TEXT (NOT NULL, unique identifier)
  - ip_address: TEXT (NOT NULL)
  - mac_address: TEXT
  - status: TEXT (default: 'safe')
  - connected_since: TIMESTAMP WITH TIME ZONE
  - alerts: JSONB (default: [])
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE

RLS Policies:
  - Users can CRUD their own devices (user_id = auth.uid())

Purpose: Smart home device inventory
```

#### **security_alerts**
```sql
Primary Key: id (UUID)
Columns:
  - id: UUID (auto-generated)
  - device_id: UUID (NOT NULL)
  - alert_type: TEXT (NOT NULL)
  - description: TEXT (NOT NULL)
  - severity: TEXT (NOT NULL) [low, medium, high, critical]
  - status: TEXT (default: 'unresolved')
  - timestamp: TIMESTAMP WITH TIME ZONE
  - ai_analysis_chat: JSONB (default: [])
  - created_at: TIMESTAMP WITH TIME ZONE

RLS Policies:
  - System can insert alerts (true)
  - Users can view/update alerts for their devices

Purpose: Security incident tracking
```

#### **anomaly_alerts**
```sql
Primary Key: id (UUID)
Columns:
  - id: UUID (auto-generated)
  - user_id: UUID
  - client_id: TEXT (NOT NULL)
  - timestamp: TIMESTAMP WITH TIME ZONE (NOT NULL)
  - packet_count: INTEGER (NOT NULL)
  - anomaly_score: NUMERIC (NOT NULL)
  - is_anomaly: BOOLEAN (default: false)
  - created_at: TIMESTAMP WITH TIME ZONE

RLS Policies:
  - System can insert anomaly alerts
  - Users can view their own alerts

Purpose: ML-detected network anomalies
```

#### **dashboard_metrics**
```sql
Primary Key: id (UUID)
Columns:
  - id: UUID (auto-generated)
  - user_id: UUID
  - metric_key: TEXT (NOT NULL, unique per user)
  - metric_value: JSONB (NOT NULL)
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE

RLS Policies:
  - System can insert/update metrics
  - Users can view their own metrics

Purpose: Aggregated dashboard statistics
```

#### **network_metrics**
```sql
Primary Key: id (UUID)
Columns:
  - id: UUID (auto-generated)
  - user_id: UUID (NOT NULL)
  - total_devices: INTEGER (default: 0)
  - threats_detected: INTEGER (default: 0)
  - data_transferred_mb: INTEGER (default: 0)
  - network_activity: JSONB (default: [])
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE

RLS Policies:
  - Users can view/update/insert their own metrics

Purpose: Real-time network statistics
```

#### **otp_codes**
```sql
Primary Key: id (UUID)
Columns:
  - id: UUID (auto-generated)
  - email: TEXT (NOT NULL)
  - code: TEXT (NOT NULL, 6 digits)
  - verified: BOOLEAN (default: false)
  - created_at: TIMESTAMP WITH TIME ZONE
  - expires_at: TIMESTAMP WITH TIME ZONE (now() + 10 minutes)

RLS Policies:
  - Anyone can insert/read/update OTP codes

Purpose: Two-factor authentication codes
```

### 5.2 Database Functions

#### **handle_new_user()**
- **Type:** Trigger Function
- **Language:** PL/pgSQL
- **Security:** DEFINER (runs with elevated privileges)
- **Trigger:** AFTER INSERT on auth.users
- **Purpose:**
  - Auto-create user profile in public.users
  - Extract metadata from raw_user_meta_data
  - Initialize network_metrics row
  - Ensures data consistency on signup

#### **cleanup_expired_otps()**
- **Type:** Utility Function
- **Language:** PL/pgSQL
- **Security:** DEFINER
- **Purpose:** Delete expired OTP codes (can be scheduled)

#### **update_updated_at_column()**
- **Type:** Trigger Function
- **Language:** PL/pgSQL
- **Purpose:** Auto-update updated_at timestamp on row changes

### 5.3 Row Level Security (RLS)

**Philosophy:** All tables have RLS enabled for security

**Key Patterns:**
1. **User Ownership:** `auth.uid() = user_id`
2. **Device Ownership:** `EXISTS (SELECT 1 FROM devices WHERE device_id = X AND user_id = auth.uid())`
3. **System Insert:** `true` (for webhooks/edge functions)
4. **Public Read (OTP):** `true` (temporary, short-lived data)

---

## 6. Edge Functions

### 6.1 CORS Configuration

All edge functions include CORS headers:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### 6.2 Configuration (supabase/config.toml)

```toml
project_id = "drwbehbecdrlklqydmbo"

[functions.ai-analysis]
verify_jwt = false

[functions.anomaly-alert]
verify_jwt = false

[functions.aura-chat]
verify_jwt = true

[functions.splunk-webhook]
verify_jwt = false

[functions.firewall-control]
verify_jwt = false

[functions.metrics-ingest]
verify_jwt = false

[functions.send-otp]
verify_jwt = false
```

### 6.3 Environment Variables (Secrets)

Managed via Supabase Dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `RESEND_API_KEY`
- `LOVABLE_API_KEY`
- `GEMINI_API_KEY`

---

## 7. Authentication & Security

### 7.1 Authentication Flow

```
User Sign Up → Supabase Auth → handle_new_user() Trigger → Profile Created
                    ↓
              Email Verification
                    ↓
              User Sign In → JWT Token → Persistent Session
                    ↓
              Optional: OTP Verification (send-otp function)
```

### 7.2 Authentication Features

#### **Supabase Auth**
- **Methods Supported:**
  - Email + Password
  - Magic Links (email redirect)
  - Future: OAuth providers (Google, GitHub)
- **Session Management:**
  - JWT tokens (auto-refresh)
  - localStorage persistence
  - Secure httpOnly cookies (server-side)

#### **Custom Hook: useAuth**
```typescript
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Methods: signUp, signIn, signOut
  // Auto-syncs with Supabase auth state
}
```

#### **Multi-Factor Authentication (MFA)**
- OTP sent via email (Resend)
- 6-digit code
- 10-minute expiration
- Stored in `otp_codes` table
- Cleanup function for expired codes

### 7.3 Security Measures

1. **Row Level Security (RLS):** All tables protected
2. **JWT Verification:** Edge functions can require auth
3. **CORS:** Configured for cross-origin requests
4. **API Key Encryption:** Firewall API keys stored encrypted (user responsibility)
5. **SQL Injection Prevention:** Parameterized queries via Supabase client
6. **XSS Prevention:** React auto-escapes content
7. **CSRF Protection:** Supabase handles token validation

---

## 8. External Integrations

### 8.1 Lovable AI Gateway (Gemini)

- **Purpose:** Power Aura AI assistant
- **Model:** Google Gemini (via Lovable AI Gateway)
- **API Key:** `LOVABLE_API_KEY` (secret)
- **Features:**
  - Streaming responses
  - Context injection (user data, devices, alerts)
  - Conversation history
- **Integration:** `supabase/functions/aura-chat/index.ts`

### 8.2 Resend Email Service

- **Purpose:** Transactional emails
- **Use Cases:**
  - OTP delivery
  - Security alert notifications
  - Welcome emails (future)
- **API Key:** `RESEND_API_KEY` (secret)
- **Features:**
  - HTML email templates
  - High deliverability
  - Webhook support

### 8.3 Splunk Integration

- **Purpose:** Receive security alerts from SIEM
- **Endpoint:** `splunk-webhook` edge function
- **Data Flow:**
  ```
  Splunk → Webhook → Normalize Data → Match Device → Create Alert → Email User
  ```
- **Alert Types:** Intrusions, port scans, malware, DDoS

### 8.4 External Firewall API (Future)

- **Purpose:** Remote firewall control
- **Storage:** `firewall_api_key` in users table
- **Function:** `firewall-control` edge function
- **Actions:** Block IP, unblock IP, update rules

---

## 9. Deployment

### 9.1 Frontend Deployment (Cloudflare Pages)

#### **GitHub Actions Workflow**
```yaml
File: .github/workflows/deploy-cloudflare-pages.yml
Trigger: Push to main branch
Steps:
  1. Checkout code
  2. Setup Node.js 18
  3. npm ci (clean install)
  4. npm run build
  5. Deploy to Cloudflare Pages
```

#### **Required Secrets**
- `CF_API_TOKEN` (Cloudflare API token)
- `CF_ACCOUNT_ID` (Cloudflare account ID)
- `CF_PROJECT_NAME` (Pages project name)

#### **Build Configuration**
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18
- Package manager: npm (to avoid Bun lockfile issues)

#### **Cloudflare Pages Settings**
- Branch: main
- Framework: Vite
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

### 9.2 Backend Deployment (Supabase)

#### **Edge Functions**
- **Deployment:** Automatic via Supabase CLI or Git integration
- **Runtime:** Deno on Supabase Edge Network
- **Regions:** Global edge locations for low latency
- **Monitoring:** Logs accessible via Supabase Dashboard

#### **Database**
- **Hosting:** Supabase-managed PostgreSQL
- **Backups:** Automatic daily backups
- **Migrations:** Version-controlled SQL files
- **Region:** Configurable per project

### 9.3 Environment Configuration

#### **Development (.env)**
```
VITE_SUPABASE_PROJECT_ID="drwbehbecdrlklqydmbo"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOi..."
VITE_SUPABASE_URL="https://drwbehbecdrlklqydmbo.supabase.co"
```

#### **Production**
- Environment variables set in Cloudflare Pages dashboard
- Secrets managed in Supabase dashboard
- No .env file deployed

---

## 10. Development Workflow

### 10.1 Local Development

#### **Prerequisites**
- Node.js 18+
- npm or bun
- Git
- Supabase CLI (optional, for edge functions)

#### **Setup Steps**
```bash
# Clone repository
git clone <repo-url>

# Install dependencies
npm install

# Start dev server
npm run dev
# Server runs on http://localhost:8080

# Build for production
npm run build

# Preview production build
npm run preview
```

#### **Hot Reload**
- Vite provides instant HMR
- Changes reflect immediately
- TypeScript errors shown in terminal

### 10.2 Code Organization

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── AuraChat.tsx    # AI assistant
│   └── ...
├── pages/              # Route pages
│   ├── Index.tsx       # Home/overview
│   ├── SiemDashboard.tsx
│   ├── AuraAssistant.tsx
│   └── Reports.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── use-toast.ts
├── integrations/       # External service clients
│   └── supabase/
│       ├── client.ts
│       └── types.ts    # Auto-generated
├── lib/                # Utilities
│   └── utils.ts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles + design tokens
```

### 10.3 Git Workflow

#### **Branch Strategy**
- `main` - Production branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`

#### **Commit Convention**
```
feat: Add new feature
fix: Bug fix
docs: Documentation updates
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

### 10.4 Testing Strategy (Future)

**Recommended Tools:**
- **Unit Tests:** Vitest (Vite-native)
- **Component Tests:** React Testing Library
- **E2E Tests:** Playwright or Cypress
- **Type Checking:** `tsc --noEmit`

### 10.5 Performance Optimization

#### **Frontend**
- Code splitting via React.lazy()
- Image optimization (webp, lazy loading)
- Tailwind purge for minimal CSS
- Vite tree-shaking for unused code

#### **Backend**
- Database indexes on frequently queried columns
- JSONB indexing for fast JSON queries
- Edge function caching (future)
- Real-time subscriptions for live data

### 10.6 Monitoring & Debugging

#### **Available Tools**
1. **Supabase Logs:** Real-time edge function logs
2. **PostgreSQL Logs:** Database query performance
3. **Browser DevTools:** Network, console, React DevTools
4. **Cloudflare Analytics:** Page views, performance metrics

#### **Error Tracking (Recommended)**
- Sentry (frontend + backend)
- LogRocket (session replay)
- Supabase Dashboard (built-in metrics)

---

## 11. Key Design Decisions & Rationale

### 11.1 Why Supabase?
✅ Open-source Firebase alternative  
✅ PostgreSQL (battle-tested RDBMS)  
✅ Built-in auth, real-time, edge functions  
✅ Generous free tier  
✅ Self-hostable if needed  

### 11.2 Why Vite over Create React App?
✅ 10-100x faster dev server  
✅ Modern ES modules  
✅ SWC compilation (faster than Babel)  
✅ Optimized production builds  

### 11.3 Why Tailwind CSS?
✅ Utility-first = faster development  
✅ Consistent design system via config  
✅ Purge CSS = tiny bundle size  
✅ Dark mode built-in  

### 11.4 Why Edge Functions over Traditional Backend?
✅ Serverless = no server management  
✅ Global edge network = low latency  
✅ Auto-scaling  
✅ Pay-per-use pricing  

### 11.5 Why TypeScript?
✅ Catch errors at compile time  
✅ Better IDE autocomplete  
✅ Self-documenting code  
✅ Easier refactoring  

---

## 12. Future Enhancements

### Planned Features
1. **Mobile App:** React Native with shared types
2. **Advanced Analytics:** Time-series forecasting with TensorFlow.js
3. **Multi-User Support:** Role-based access control (RBAC)
4. **Notification System:** Push notifications via Firebase Cloud Messaging
5. **Audit Logs:** Track all user actions
6. **API Rate Limiting:** Protect edge functions
7. **Webhook Management UI:** User-configurable webhooks
8. **Automated Testing:** Full test coverage
9. **CI/CD Pipeline:** Automated testing + deployment
10. **Internationalization (i18n):** Multi-language support

### Scalability Considerations
- **Database:** Connection pooling, read replicas
- **Edge Functions:** Response caching, CDN integration
- **Frontend:** Service workers, offline support
- **Monitoring:** APM tools (Application Performance Monitoring)

---

## 13. Troubleshooting Guide

### Common Issues

#### **1. Real-time Not Updating**
**Solution:** Check RLS policies, ensure subscription filters match user_id

#### **2. Edge Function Timeout**
**Solution:** Optimize queries, add indexes, reduce external API calls

#### **3. CORS Errors**
**Solution:** Verify corsHeaders in edge functions, check Supabase CORS config

#### **4. Type Errors After DB Changes**
**Solution:** Regenerate types: `supabase gen types typescript`

#### **5. Build Fails on Cloudflare**
**Solution:** Check Node version, ensure environment variables set

---

## 14. Contact & Support

**Project Repository:** [GitHub URL]  
**Supabase Dashboard:** https://supabase.com/dashboard/project/drwbehbecdrlklqydmbo  
**Cloudflare Pages:** [Cloudflare Dashboard]  

**Documentation:**
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com

---

## 15. Conclusion

This platform combines modern frontend technologies (React, TypeScript, Vite, Tailwind) with a robust backend (Supabase, PostgreSQL, Edge Functions) to deliver a real-time security monitoring solution. The architecture prioritizes:

- **Performance:** Fast dev server, optimized builds, edge computing
- **Security:** RLS, JWT auth, encrypted secrets
- **Scalability:** Serverless functions, managed database
- **Developer Experience:** TypeScript, hot reload, modern tooling
- **User Experience:** Real-time updates, dark mode, responsive design

The technology choices reflect industry best practices while maintaining simplicity and cost-effectiveness for a production-ready application.

---

**Document Version:** 1.0  
**Last Updated:** 2025  
**Maintained By:** Development Team