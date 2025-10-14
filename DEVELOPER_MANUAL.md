# Aura Shield Platform - Complete Developer Manual

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Architecture Deep Dive](#architecture-deep-dive)
4. [Frontend Documentation](#frontend-documentation)
5. [Backend Documentation](#backend-documentation)
6. [Database Schema & Operations](#database-schema--operations)
7. [Authentication System](#authentication-system)
8. [Edge Functions Reference](#edge-functions-reference)
9. [Design System & Styling](#design-system--styling)
10. [Component Library](#component-library)
11. [State Management](#state-management)
12. [Routing & Navigation](#routing--navigation)
13. [API Integration Patterns](#api-integration-patterns)
14. [Development Workflows](#development-workflows)
15. [Testing Strategies](#testing-strategies)
16. [Deployment Guide](#deployment-guide)
17. [Troubleshooting & Debugging](#troubleshooting--debugging)
18. [Performance Optimization](#performance-optimization)
19. [Security Best Practices](#security-best-practices)
20. [Contributing Guidelines](#contributing-guidelines)

---

## 1. Project Overview

### 1.1 Project Summary
**Aura Shield Platform** is a comprehensive Smart Home Security SIEM (Security Information and Event Management) system that provides real-time network monitoring, threat detection, and AI-powered security analysis for home networks.

### 1.2 Key Features
- **Real-time Network Monitoring**: Track all devices connected to your home network
- **Anomaly Detection**: AI-powered detection of unusual network behavior
- **Security Alerts**: Instant notifications for potential threats
- **AI Assistant (Aura)**: Conversational AI for security guidance and analysis
- **Device Management**: Control and block suspicious devices
- **Security Reports**: Generate comprehensive PDF reports
- **MQTT Monitoring**: Real-time protocol monitoring
- **Multi-Factor Authentication**: OTP-based security enhancement

### 1.3 Technology Stack

#### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack React Query v5
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + jsPDF-autotable

#### Backend
- **Platform**: Supabase (PostgreSQL + Edge Functions)
- **Runtime**: Deno (for Edge Functions)
- **Database**: PostgreSQL 15+
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth

#### External Services
- **AI**: Lovable AI Gateway (Gemini Flash)
- **Email**: Resend
- **SIEM Integration**: Splunk webhook support
- **Deployment**: Cloudflare Pages (frontend), Supabase (backend)

### 1.4 Project Structure

```
aura-shield/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── wireframes/     # Wireframe components
│   │   ├── AlertDetailCard.tsx
│   │   ├── AnomalyChart.tsx
│   │   ├── AuraChat.tsx
│   │   ├── AuthPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── NetworkHealthMonitor.tsx
│   │   └── theme-*.tsx     # Theme components
│   ├── pages/              # Route pages
│   │   ├── Index.tsx
│   │   ├── SiemDashboard.tsx
│   │   ├── Reports.tsx
│   │   ├── AuraAssistant.tsx
│   │   ├── ColorPaletteInfographic.tsx
│   │   ├── WireframeDocumentation.tsx
│   │   └── NotFound.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── integrations/       # External integrations
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/               # Utility libraries
│   │   └── utils.ts
│   ├── assets/            # Static assets
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── supabase/
│   ├── functions/         # Edge Functions
│   │   ├── aura-chat/
│   │   ├── ai-analysis/
│   │   ├── anomaly-alert/
│   │   ├── firewall-control/
│   │   ├── send-otp/
│   │   ├── splunk-webhook/
│   │   └── metrics-ingest/
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase configuration
├── public/                # Public assets
├── .github/workflows/     # CI/CD workflows
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 2. Quick Start Guide

### 2.1 Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager
- Supabase account
- Git

### 2.2 Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd aura-shield

# Install dependencies
npm install
# or
bun install

# Set up environment variables
# Create .env file (not needed for this project as we use Supabase directly)

# Start development server
npm run dev
# or
bun dev
```

### 2.3 Environment Configuration

The project uses Supabase with the following configuration:
- **Project URL**: `https://drwbehbecdrlklqydmbo.supabase.co`
- **Anon Key**: Configured in `src/integrations/supabase/client.ts`

### 2.4 First Run

1. Navigate to `http://localhost:8080`
2. You'll see the authentication page
3. Sign up with an email and password
4. Verify your email (check your inbox)
5. Log in and explore the dashboard

---

## 3. Architecture Deep Dive

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Dashboard │  │    SIEM    │  │   Reports  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │    Aura    │  │    Auth    │  │ Wireframes │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Supabase Client  │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                    Backend (Supabase)                      │
│  ┌────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                    │   │
│  │  • users           • devices                        │   │
│  │  • security_alerts • anomaly_alerts                 │   │
│  │  • dashboard_metrics • network_metrics              │   │
│  │  • otp_codes                                        │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Edge Functions (Deno)                  │   │
│  │  • aura-chat      • ai-analysis                     │   │
│  │  • anomaly-alert  • firewall-control                │   │
│  │  • send-otp       • splunk-webhook                  │   │
│  │  • metrics-ingest                                   │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Supabase Auth                          │   │
│  │  • Email/Password • Magic Links • JWT               │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  External Services │
                    │  • Lovable AI      │
                    │  • Resend          │
                    │  • Splunk          │
                    └────────────────────┘
```

### 3.2 Data Flow

#### Authentication Flow
```
1. User submits credentials → AuthPage component
2. useAuth hook calls supabase.auth.signInWithPassword()
3. Supabase validates credentials
4. JWT token stored in localStorage
5. onAuthStateChange listener updates app state
6. Protected routes become accessible
```

#### Real-time Alert Flow
```
1. External system sends alert → Splunk webhook
2. splunk-webhook edge function receives data
3. Inserts alert into security_alerts table
4. anomaly-alert function analyzes data
5. AI analysis via ai-analysis function
6. Alert appears in Dashboard via Supabase Realtime
7. User receives notification
```

#### Aura Chat Flow
```
1. User sends message → AuraChat component
2. Message sent to aura-chat edge function
3. Function calls Lovable AI Gateway (Gemini)
4. Streaming response returned to frontend
5. Chat UI updates in real-time
```

### 3.3 Authentication Architecture

#### Session Management
- JWT tokens stored in localStorage
- Auto-refresh enabled via Supabase client
- Session persistence across page reloads
- Auth state managed by useAuth hook

#### User Lifecycle
1. **Sign Up**: Creates auth.users entry → Triggers handle_new_user() → Creates users table entry
2. **Email Verification**: Supabase sends verification email
3. **Sign In**: Validates credentials → Issues JWT → Updates session
4. **Sign Out**: Clears localStorage → Invalidates session

---

## 4. Frontend Documentation

### 4.1 Application Entry Point

#### main.tsx
```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

#### App.tsx Structure
```typescript
// Provider hierarchy:
ThemeProvider
  └─ QueryClientProvider
      └─ TooltipProvider
          └─ BrowserRouter
              └─ Routes
                  ├─ / (Dashboard or AuthPage)
                  ├─ /siem-dashboard
                  ├─ /reports
                  ├─ /aura
                  ├─ /color-palette
                  └─ /wireframe-docs
```

### 4.2 Routing Configuration

| Route | Component | Protected | Description |
|-------|-----------|-----------|-------------|
| `/` | Dashboard/AuthPage | Conditional | Main dashboard or login |
| `/siem-dashboard` | SiemDashboard | Yes | SIEM monitoring interface |
| `/reports` | Reports | Yes | Security reports generation |
| `/aura` | AuraAssistant | Yes | AI assistant chat |
| `/color-palette` | ColorPaletteInfographic | No | Design system reference |
| `/wireframe-docs` | WireframeDocumentation | No | Wireframe documentation |
| `*` | Navigate to `/` | - | Catch-all redirect |

### 4.3 Core Pages

#### Dashboard (src/components/Dashboard.tsx)
**Purpose**: Main security monitoring interface

**Features**:
- Network health metrics
- Active devices list
- Recent security alerts
- Anomaly detection chart
- Quick actions

**Data Sources**:
- `network_metrics` table
- `devices` table
- `security_alerts` table
- `anomaly_alerts` table

**Key Components**:
- NetworkHealthMonitor
- Device list with status indicators
- Alert cards
- AnomalyChart

#### SIEM Dashboard (src/pages/SiemDashboard.tsx)
**Purpose**: Advanced security information and event management

**Features**:
- Real-time event stream
- Advanced filtering
- Threat intelligence
- Log analysis
- Correlation rules

**Data Sources**:
- `security_alerts` table
- `anomaly_alerts` table
- Real-time subscriptions

#### Reports (src/pages/Reports.tsx)
**Purpose**: Generate and download security reports

**Features**:
- PDF generation
- Date range selection
- Custom report templates
- Email delivery
- Scheduled reports

**Dependencies**:
- jsPDF for PDF generation
- jsPDF-autotable for tables

#### Aura Assistant (src/pages/AuraAssistant.tsx)
**Purpose**: AI-powered security assistant

**Features**:
- Natural language queries
- Security recommendations
- Device control commands
- Threat analysis
- Context-aware responses

**Integration**:
- aura-chat edge function
- Lovable AI Gateway

#### Authentication (src/components/AuthPage.tsx)
**Purpose**: User authentication interface

**Features**:
- Email/password sign in
- Sign up with profile data
- Email verification
- Password reset
- OTP verification (optional)

**Form Fields**:
- Email (required)
- Password (required, min 6 chars)
- First Name
- Last Name
- Phone Number
- Firewall API Key

### 4.4 Key Components

#### NetworkHealthMonitor
**File**: `src/components/NetworkHealthMonitor.tsx`

**Props**: None

**Data Fetching**:
```typescript
const { data: metrics } = useQuery({
  queryKey: ['network-metrics'],
  queryFn: async () => {
    const { data } = await supabase
      .from('network_metrics')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    return data;
  }
});
```

**Displays**:
- Total devices connected
- Threats detected
- Data transferred (MB)
- Network activity graph

#### AnomalyChart
**File**: `src/components/AnomalyChart.tsx`

**Props**:
```typescript
interface AnomalyChartProps {
  data: AnomalyData[];
}
```

**Chart Type**: Line chart with area fill

**Data Structure**:
```typescript
interface AnomalyData {
  timestamp: string;
  packet_count: number;
  anomaly_score: number;
  is_anomaly: boolean;
}
```

**Visualization**:
- X-axis: Timestamp
- Y-axis: Packet count
- Color coding: Anomalies highlighted in red

#### AuraChat
**File**: `src/components/AuraChat.tsx`

**Features**:
- Message history
- Streaming responses
- Code syntax highlighting
- Copy message functionality
- Loading states

**Message Structure**:
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}
```

**API Integration**:
```typescript
const sendMessage = async (message: string) => {
  const { data, error } = await supabase.functions.invoke('aura-chat', {
    body: { message }
  });
};
```

#### AlertDetailCard
**File**: `src/components/AlertDetailCard.tsx`

**Props**:
```typescript
interface AlertDetailCardProps {
  alert: SecurityAlert;
  onResolve?: (alertId: string) => void;
  onBlock?: (deviceId: string) => void;
}
```

**Features**:
- Alert severity indicator
- Device information
- AI analysis display
- Action buttons (resolve, block)
- Timestamp display

---

## 5. Backend Documentation

### 5.1 Supabase Configuration

#### Client Initialization
**File**: `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://drwbehbecdrlklqydmbo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

#### Configuration File
**File**: `supabase/config.toml`

```toml
project_id = "drwbehbecdrlklqydmbo"

[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public"]

[functions.aura-chat]
verify_jwt = true

[functions.ai-analysis]
verify_jwt = true

[functions.anomaly-alert]
verify_jwt = false

[functions.firewall-control]
verify_jwt = true

[functions.send-otp]
verify_jwt = false

[functions.splunk-webhook]
verify_jwt = false

[functions.metrics-ingest]
verify_jwt = false
```

### 5.2 Database Tables

#### users Table
**Purpose**: Store user profile and configuration data

**Columns**:
- `id` (uuid, primary key): Links to auth.users.id
- `email` (text, not null): User email address
- `first_name` (text): User's first name
- `last_name` (text): User's last name
- `phone_number` (text): Phone for OTP/alerts
- `firewall_api_key` (text): API key for firewall integration
- `client_id` (text): Unique client identifier
- `created_at` (timestamptz): Account creation timestamp
- `updated_at` (timestamptz): Last update timestamp

**RLS Policies**:
- SELECT: Users can view their own profile (`auth.uid() = id`)
- INSERT: Users can insert their own profile (`auth.uid() = id`)
- UPDATE: Users can update their own profile (`auth.uid() = id`)

**Triggers**:
- `handle_new_user()`: Automatically creates user profile on auth.users insert

#### devices Table
**Purpose**: Track all devices connected to user's network

**Columns**:
- `id` (uuid, primary key)
- `user_id` (uuid, not null): Foreign key to users
- `device_name` (text, not null): Human-readable device name
- `ip_address` (text, not null): Device IP address
- `mac_address` (text): Device MAC address
- `client_id` (text, not null): Unique device identifier
- `status` (text, default 'safe'): Device security status (safe/blocked/suspicious)
- `connected_since` (timestamptz): First connection timestamp
- `alerts` (jsonb, default []): Array of alert objects
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies**:
- SELECT: Users can view their own devices
- INSERT: Users can insert their own devices
- UPDATE: Users can update their own devices
- DELETE: Users can delete their own devices

**Indexes**:
- Index on `user_id` for fast lookups
- Index on `client_id` for device identification

#### security_alerts Table
**Purpose**: Store security alerts for devices

**Columns**:
- `id` (uuid, primary key)
- `device_id` (uuid, not null): Foreign key to devices
- `alert_type` (text, not null): Type of alert (intrusion/anomaly/malware)
- `description` (text, not null): Alert description
- `severity` (text, not null): Severity level (low/medium/high/critical)
- `status` (text, default 'unresolved'): Alert status (unresolved/resolved/ignored)
- `timestamp` (timestamptz): When alert occurred
- `ai_analysis_chat` (jsonb, default []): AI analysis conversation history
- `created_at` (timestamptz)

**RLS Policies**:
- SELECT: Users can view alerts for their devices (via devices.user_id)
- INSERT: System can insert alerts (public access for webhook)
- UPDATE: Users can update alerts for their devices

**Relationships**:
- Many-to-one with devices table

#### anomaly_alerts Table
**Purpose**: Store ML-detected network anomalies

**Columns**:
- `id` (uuid, primary key)
- `user_id` (uuid): Foreign key to users
- `client_id` (text, not null): Client identifier
- `timestamp` (timestamptz, not null): Anomaly detection time
- `packet_count` (integer, not null): Number of packets observed
- `anomaly_score` (numeric, not null): ML confidence score (0-1)
- `is_anomaly` (boolean, default false): Whether classified as anomaly
- `created_at` (timestamptz)

**RLS Policies**:
- SELECT: Users can view their own anomaly alerts
- INSERT: System can insert alerts (public access)

**Analysis**:
- Scores > 0.7 typically indicate anomalies
- Used for real-time anomaly detection charting

#### dashboard_metrics Table
**Purpose**: Store aggregated dashboard metrics

**Columns**:
- `id` (uuid, primary key)
- `user_id` (uuid): Foreign key to users
- `metric_key` (text, not null): Metric identifier
- `metric_value` (jsonb, not null): Metric data as JSON
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies**:
- SELECT: Users can view their own metrics
- INSERT: System can insert metrics
- UPDATE: System can update metrics

**Metric Keys**:
- `active_threats`
- `total_devices`
- `blocked_devices`
- `data_transferred`

#### network_metrics Table
**Purpose**: Store network-level statistics

**Columns**:
- `id` (uuid, primary key)
- `user_id` (uuid, not null): Foreign key to users
- `total_devices` (integer, default 0)
- `threats_detected` (integer, default 0)
- `data_transferred_mb` (integer, default 0)
- `network_activity` (jsonb, default []): Time-series activity data
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies**:
- SELECT: Users can view their own metrics
- INSERT: Users can insert their own metrics
- UPDATE: Users can update their own metrics

**Activity Structure**:
```json
[
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "devices": 12,
    "bandwidth": 250.5
  }
]
```

#### otp_codes Table
**Purpose**: Store one-time passcodes for MFA

**Columns**:
- `id` (uuid, primary key)
- `email` (text, not null): User email
- `code` (text, not null): 6-digit OTP
- `verified` (boolean, default false): Verification status
- `created_at` (timestamptz)
- `expires_at` (timestamptz): Expiration time (10 minutes)

**RLS Policies**:
- SELECT: Public (anyone can read to verify)
- INSERT: Public (anyone can request OTP)
- UPDATE: Public (anyone can mark verified)

**Cleanup**:
- `cleanup_expired_otps()` function removes expired codes

---

## 6. Database Schema & Operations

### 6.1 Database Functions

#### handle_new_user()
**Purpose**: Automatically create user profile when auth user is created

**Trigger**: AFTER INSERT on auth.users

**Implementation**:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, email, firewall_api_key, phone_number, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'firewall_api_key',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  INSERT INTO public.network_metrics (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;
```

#### cleanup_expired_otps()
**Purpose**: Remove expired OTP codes

**Scheduled**: Can be called via cron or manually

**Implementation**:
```sql
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < now();
END;
$function$;
```

#### update_updated_at_column()
**Purpose**: Automatically update updated_at timestamp

**Trigger**: BEFORE UPDATE on tables

**Implementation**:
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
```

### 6.2 Common Query Patterns

#### Fetch User's Devices
```typescript
const { data: devices, error } = await supabase
  .from('devices')
  .select('*')
  .eq('user_id', userId)
  .order('connected_since', { ascending: false });
```

#### Create Security Alert
```typescript
const { data, error } = await supabase
  .from('security_alerts')
  .insert({
    device_id: deviceId,
    alert_type: 'intrusion',
    description: 'Suspicious network activity detected',
    severity: 'high',
    timestamp: new Date().toISOString()
  });
```

#### Update Alert Status
```typescript
const { error } = await supabase
  .from('security_alerts')
  .update({ status: 'resolved' })
  .eq('id', alertId);
```

#### Real-time Alert Subscription
```typescript
const subscription = supabase
  .channel('security-alerts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'security_alerts'
    },
    (payload) => {
      console.log('New alert:', payload.new);
      // Handle new alert
    }
  )
  .subscribe();

// Cleanup
return () => subscription.unsubscribe();
```

#### Fetch Anomalies with Threshold
```typescript
const { data: anomalies } = await supabase
  .from('anomaly_alerts')
  .select('*')
  .eq('user_id', userId)
  .gt('anomaly_score', 0.7)
  .order('timestamp', { ascending: false })
  .limit(50);
```

---

## 7. Authentication System

### 7.1 useAuth Hook

**File**: `src/hooks/useAuth.ts`

**State Management**:
```typescript
const [user, setUser] = useState<User | null>(null);
const [session, setSession] = useState<Session | null>(null);
const [loading, setLoading] = useState(true);
```

**Auth State Listener**:
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }
  );

  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

### 7.2 Authentication Methods

#### Sign Up
```typescript
const signUp = async (
  email: string, 
  password: string, 
  firstName: string,
  lastName: string,
  firewallApiKey: string, 
  phoneNumber: string
) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        first_name: firstName,
        last_name: lastName,
        firewall_api_key: firewallApiKey,
        phone_number: phoneNumber
      }
    }
  });
  return { error };
};
```

#### Sign In
```typescript
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { error };
};
```

#### Sign Out
```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
```

### 7.3 Protected Routes

**Implementation in App.tsx**:
```typescript
const { user, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

return (
  <Routes>
    <Route path="/" element={user ? <Dashboard /> : <AuthPage />} />
    <Route 
      path="/siem-dashboard" 
      element={user ? <SiemDashboard /> : <Navigate to="/" />} 
    />
    {/* More protected routes */}
  </Routes>
);
```

### 7.4 OTP Verification Flow

1. User requests OTP via `send-otp` edge function
2. 6-digit code generated and stored in `otp_codes` table
3. Email sent via Resend service
4. User enters code in frontend
5. Frontend verifies code against database
6. Code marked as `verified` if correct
7. Expired codes cleaned up periodically

---

## 8. Edge Functions Reference

### 8.1 aura-chat

**File**: `supabase/functions/aura-chat/index.ts`

**Purpose**: Handle AI chat interactions with Aura assistant

**Authentication**: Required (JWT verification enabled)

**Request Body**:
```typescript
{
  message: string;
}
```

**Response**:
```typescript
{
  response: string;
  conversation_id?: string;
}
```

**Implementation Details**:
- Calls Lovable AI Gateway (Gemini Flash)
- Maintains conversation context
- Provides security-focused responses
- Handles device control queries

**Error Handling**:
- 401: Unauthorized (invalid JWT)
- 400: Missing message
- 500: AI service error

### 8.2 ai-analysis

**File**: `supabase/functions/ai-analysis/index.ts`

**Purpose**: Analyze security alerts using AI

**Authentication**: Required

**Request Body**:
```typescript
{
  alert_id: string;
  alert_data: {
    alert_type: string;
    description: string;
    severity: string;
    device_info: object;
  }
}
```

**Response**:
```typescript
{
  analysis: string;
  recommendations: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}
```

**AI Prompt Template**:
```
Analyze the following security alert:
Type: {alert_type}
Description: {description}
Severity: {severity}

Provide:
1. Root cause analysis
2. Potential impact
3. Recommended actions
4. Similar threat patterns
```

### 8.3 anomaly-alert

**File**: `supabase/functions/anomaly-alert/index.ts`

**Purpose**: Process and store network anomaly detections

**Authentication**: Not required (public webhook)

**Request Body**:
```typescript
{
  client_id: string;
  user_id?: string;
  timestamp: string;
  packet_count: number;
  anomaly_score: number;
}
```

**Processing Logic**:
1. Validate incoming data
2. Calculate anomaly classification (score > 0.7)
3. Insert into `anomaly_alerts` table
4. If critical (score > 0.9), create security alert
5. Return confirmation

**Response**:
```typescript
{
  success: boolean;
  anomaly_id: string;
  is_critical: boolean;
}
```

### 8.4 firewall-control

**File**: `supabase/functions/firewall-control/index.ts`

**Purpose**: Block or unblock devices via firewall API

**Authentication**: Required

**Request Body**:
```typescript
{
  deviceId: string;
  action: 'block' | 'unblock';
}
```

**Workflow**:
1. Fetch device from database
2. Retrieve user's firewall API key
3. Call external firewall API
4. Update device status in database
5. Log action

**External API Call**:
```typescript
const response = await fetch(`${FIREWALL_API_URL}/control`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firewallApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mac_address: device.mac_address,
    action: action
  })
});
```

**Response**:
```typescript
{
  success: boolean;
  device_id: string;
  new_status: string;
}
```

### 8.5 send-otp

**File**: `supabase/functions/send-otp/index.ts`

**Purpose**: Generate and send OTP codes via email

**Authentication**: Not required (public endpoint)

**Request Body**:
```typescript
{
  email: string;
}
```

**OTP Generation**:
```typescript
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
```

**Email Template**:
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Your Aura Shield Verification Code</h2>
  <p>Your one-time passcode is:</p>
  <h1 style="color: #4F46E5; letter-spacing: 5px;">{OTP_CODE}</h1>
  <p>This code will expire in 10 minutes.</p>
  <p>If you didn't request this code, please ignore this email.</p>
</body>
</html>
```

**Resend Integration**:
```typescript
await resend.emails.send({
  from: 'Aura Shield <security@aurashield.com>',
  to: email,
  subject: 'Your Verification Code',
  html: emailTemplate
});
```

### 8.6 splunk-webhook

**File**: `supabase/functions/splunk-webhook/index.ts`

**Purpose**: Receive security alerts from Splunk SIEM

**Authentication**: Not required (webhook endpoint)

**Request Body** (Splunk format):
```typescript
{
  result: {
    _time: string;
    source_ip: string;
    dest_ip: string;
    alert_type: string;
    severity: string;
    description: string;
    client_id: string;
  }
}
```

**Processing**:
1. Parse Splunk webhook payload
2. Map to internal alert format
3. Find or create device record
4. Insert security alert
5. Trigger AI analysis
6. Send notification

### 8.7 metrics-ingest

**File**: `supabase/functions/metrics-ingest/index.ts`

**Purpose**: Ingest network metrics from monitoring agents

**Authentication**: Not required (webhook endpoint)

**Request Body**:
```typescript
{
  client_id: string;
  user_id: string;
  metrics: {
    total_devices: number;
    threats_detected: number;
    data_transferred_mb: number;
    timestamp: string;
  }
}
```

**Update Logic**:
```typescript
await supabase
  .from('network_metrics')
  .upsert({
    user_id: userId,
    total_devices: metrics.total_devices,
    threats_detected: metrics.threats_detected,
    data_transferred_mb: metrics.data_transferred_mb,
    network_activity: [
      ...existingActivity,
      {
        timestamp: metrics.timestamp,
        devices: metrics.total_devices,
        bandwidth: metrics.data_transferred_mb
      }
    ]
  });
```

### 8.8 CORS Configuration

All edge functions use standard CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle preflight
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// Include in all responses
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

---

## 9. Design System & Styling

### 9.1 Tailwind Configuration

**File**: `tailwind.config.ts`

```typescript
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 9.2 CSS Variables

**File**: `src/index.css`

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

### 9.3 Theme Provider

**File**: `src/components/theme-provider.tsx`

**Usage**:
```typescript
<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
  <App />
</ThemeProvider>
```

**Available Themes**: `light`, `dark`, `system`

### 9.4 Component Styling Patterns

#### Card Component
```typescript
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Content
  </CardContent>
</Card>
```

#### Button Variants
```typescript
// Primary
<Button variant="default">Primary Action</Button>

// Secondary
<Button variant="secondary">Secondary Action</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Outline
<Button variant="outline">Cancel</Button>

// Ghost
<Button variant="ghost">Ghost</Button>

// Link
<Button variant="link">Learn More</Button>
```

#### Alert Severity Colors
```typescript
const severityColors = {
  low: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  medium: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
  high: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  critical: 'text-red-500 bg-red-50 dark:bg-red-950',
};
```

---

## 10. Component Library

### 10.1 shadcn/ui Components

The project uses shadcn/ui components located in `src/components/ui/`:

- **Layout**: Card, Separator, Scroll Area, Resizable
- **Navigation**: Breadcrumb, Navigation Menu, Menubar, Sidebar, Tabs
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Calendar, Form
- **Feedback**: Alert, Toast, Progress, Skeleton, Sonner
- **Overlay**: Dialog, Sheet, Drawer, Popover, Hover Card, Tooltip, Alert Dialog, Context Menu, Dropdown Menu
- **Data Display**: Badge, Avatar, Table, Accordion, Collapsible, Carousel, Aspect Ratio
- **Others**: Button, Command, Toggle, Toggle Group, OTP Input

### 10.2 Custom Component Patterns

#### Loading State
```typescript
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
) : (
  <Content />
)}
```

#### Error State
```typescript
{error && (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

#### Empty State
```typescript
{data.length === 0 && (
  <div className="text-center py-12">
    <p className="text-muted-foreground">No data available</p>
  </div>
)}
```

---

## 11. State Management

### 11.1 TanStack Query (React Query)

**Configuration** (in App.tsx):
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

<QueryClientProvider client={queryClient}>
  {/* App */}
</QueryClientProvider>
```

### 11.2 Query Patterns

#### Basic Query
```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['devices', userId],
  queryFn: async () => {
    const { data } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', userId);
    return data;
  },
  enabled: !!userId, // Only run if userId exists
});
```

#### Mutation
```typescript
const mutation = useMutation({
  mutationFn: async (alertId: string) => {
    const { error } = await supabase
      .from('security_alerts')
      .update({ status: 'resolved' })
      .eq('id', alertId);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    toast.success('Alert resolved');
  },
  onError: (error) => {
    toast.error('Failed to resolve alert');
  },
});
```

#### Real-time Updates
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('alerts-channel')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'security_alerts'
    }, (payload) => {
      queryClient.setQueryData(['alerts'], (old: any) => 
        [...(old || []), payload.new]
      );
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

---

## 12. Routing & Navigation

### 12.1 Route Configuration

```typescript
<Routes>
  <Route path="/" element={user ? <Dashboard /> : <AuthPage />} />
  <Route path="/siem-dashboard" element={user ? <SiemDashboard /> : <Navigate to="/" />} />
  <Route path="/reports" element={user ? <Reports /> : <Navigate to="/" />} />
  <Route path="/aura" element={user ? <AuraAssistant /> : <Navigate to="/" />} />
  <Route path="/color-palette" element={<ColorPaletteInfographic />} />
  <Route path="/wireframe-docs" element={<WireframeDocumentation />} />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

### 12.2 Navigation Component

```typescript
import { Link, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/siem-dashboard">SIEM</Link>
      <Link to="/reports">Reports</Link>
      <Link to="/aura">Aura Assistant</Link>
      <button onClick={() => navigate('/settings')}>Settings</button>
    </nav>
  );
};
```

---

## 13. API Integration Patterns

### 13.1 Supabase Client Methods

#### Select
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2, related_table(*)')
  .eq('column', value)
  .order('created_at', { ascending: false })
  .limit(10);
```

#### Insert
```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert({ column1: value1, column2: value2 })
  .select();
```

#### Update
```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ column: newValue })
  .eq('id', recordId);
```

#### Delete
```typescript
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', recordId);
```

### 13.2 Edge Function Invocation

```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: 'value' },
  headers: {
    'Custom-Header': 'value'
  }
});
```

---

## 14. Development Workflows

### 14.1 Local Development

```bash
# Start dev server
npm run dev

# Access at http://localhost:8080
```

### 14.2 Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### 14.3 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

### 14.4 Commit Conventions

Format: `<type>(<scope>): <subject>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(dashboard): add network health widget
fix(auth): resolve token refresh issue
docs(api): update edge function documentation
```

---

## 15. Testing Strategies

### 15.1 Unit Testing (Recommended)

**Framework**: Vitest

**Example Test**:
```typescript
import { describe, it, expect } from 'vitest';
import { generateOTP } from './utils';

describe('generateOTP', () => {
  it('should generate 6-digit code', () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
    expect(Number(otp)).toBeGreaterThanOrEqual(100000);
    expect(Number(otp)).toBeLessThanOrEqual(999999);
  });
});
```

### 15.2 Component Testing (Recommended)

**Framework**: React Testing Library

**Example**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders and handles click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 15.3 E2E Testing (Recommended)

**Framework**: Playwright

**Example**:
```typescript
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('http://localhost:8080');
  
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 16. Deployment Guide

### 16.1 Frontend Deployment (Cloudflare Pages)

**Automatic Deployment via GitHub Actions**:

**File**: `.github/workflows/deploy-cloudflare-pages.yml`

```yaml
name: Build and deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: ${{ secrets.CF_PROJECT_NAME }}
          directory: './dist'
```

**Required Secrets**:
- `CF_API_TOKEN`: Cloudflare API token
- `CF_ACCOUNT_ID`: Cloudflare account ID
- `CF_PROJECT_NAME`: Cloudflare Pages project name

### 16.2 Backend Deployment (Supabase)

**Edge Functions**: Automatically deployed with code changes

**Database Migrations**: Run via Supabase CLI or dashboard

```bash
# Link to project
supabase link --project-ref drwbehbecdrlklqydmbo

# Push migrations
supabase db push

# Deploy functions
supabase functions deploy
```

### 16.3 Environment Variables

**Frontend** (Cloudflare Pages):
- No environment variables needed (using Supabase client directly)

**Backend** (Supabase Secrets):
- `LOVABLE_API_KEY`: Auto-configured
- `RESEND_API_KEY`: Email service
- `GEMINI_API_KEY`: AI service (if not using Lovable AI)
- `SUPABASE_URL`: Auto-configured
- `SUPABASE_PUBLISHABLE_KEY`: Auto-configured
- `SUPABASE_SERVICE_ROLE_KEY`: Admin operations
- `SUPABASE_DB_URL`: Database connection

### 16.4 Production Checklist

- [ ] All secrets configured in Supabase
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Edge functions tested
- [ ] Email templates reviewed
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented
- [ ] SSL certificates valid
- [ ] DNS configured correctly

---

## 17. Troubleshooting & Debugging

### 17.1 Common Issues

#### Issue: "Invalid JWT"
**Cause**: Token expired or invalid
**Solution**:
```typescript
// Force token refresh
await supabase.auth.refreshSession();
```

#### Issue: "Row violates RLS policy"
**Cause**: Missing user_id in insert
**Solution**:
```typescript
// Always include user_id
await supabase.from('table').insert({
  ...data,
  user_id: user.id
});
```

#### Issue: Edge function timeout
**Cause**: Long-running operation
**Solution**:
```typescript
// Add timeout and error handling
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 25000);

try {
  const response = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeout);
}
```

### 17.2 Debugging Tools

#### Browser Console
```typescript
// Enable debug mode
localStorage.setItem('debug', 'supabase:*');

// Log query execution
console.log('Query:', { table, filters, data });
```

#### Supabase Dashboard
- **Auth Logs**: Monitor authentication events
- **Database Logs**: View query execution
- **Edge Function Logs**: Debug function calls
- **Real-time Inspector**: Monitor subscriptions

#### Network Tab
- Check request/response headers
- Verify payload structure
- Monitor response times
- Identify CORS issues

---

## 18. Performance Optimization

### 18.1 Frontend Optimization

#### Code Splitting
```typescript
// Lazy load routes
const SiemDashboard = lazy(() => import('./pages/SiemDashboard'));
const Reports = lazy(() => import('./pages/Reports'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/siem-dashboard" element={<SiemDashboard />} />
    <Route path="/reports" element={<Reports />} />
  </Routes>
</Suspense>
```

#### Memoization
```typescript
import { useMemo, useCallback } from 'react';

const MemoizedComponent = ({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);

  const handleAction = useCallback(() => {
    onAction();
  }, [onAction]);

  return <div>{/* render */}</div>;
};
```

#### Query Optimization
```typescript
// Pagination
const { data } = useQuery({
  queryKey: ['alerts', page],
  queryFn: () => supabase
    .from('security_alerts')
    .select('*')
    .range(page * 10, (page + 1) * 10 - 1)
});

// Select specific columns
const { data } = useQuery({
  queryKey: ['devices'],
  queryFn: () => supabase
    .from('devices')
    .select('id, device_name, status') // Only needed columns
});
```

### 18.2 Backend Optimization

#### Database Indexes
```sql
CREATE INDEX idx_security_alerts_device_id ON security_alerts(device_id);
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_anomaly_alerts_timestamp ON anomaly_alerts(timestamp DESC);
```

#### Query Optimization
```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM security_alerts
WHERE device_id = '...'
ORDER BY timestamp DESC
LIMIT 10;
```

#### Edge Function Caching
```typescript
// Cache responses
const cache = new Map();

const getCachedData = async (key: string) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchData();
  cache.set(key, data);
  setTimeout(() => cache.delete(key), 60000); // 1 minute TTL
  
  return data;
};
```

---

## 19. Security Best Practices

### 19.1 Authentication Security

- Always use HTTPS in production
- Implement rate limiting on auth endpoints
- Use strong password requirements (min 8 chars, mixed case, numbers)
- Enable email verification
- Implement MFA for sensitive operations
- Rotate JWT secrets regularly

### 19.2 Data Security

- Enable RLS on all tables
- Never expose service role key to frontend
- Validate all inputs server-side
- Sanitize user-generated content
- Use parameterized queries (Supabase handles this)
- Encrypt sensitive data at rest

### 19.3 API Security

- Verify JWT tokens in edge functions
- Implement CORS properly
- Rate limit API endpoints
- Log security events
- Monitor for unusual patterns
- Use API keys for external services

### 19.4 Frontend Security

- Avoid storing sensitive data in localStorage
- Implement CSP headers
- Sanitize user inputs
- Avoid XSS vulnerabilities
- Use secure cookies for sessions
- Keep dependencies updated

---

## 20. Contributing Guidelines

### 20.1 Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic
- Keep functions small and focused

### 20.2 Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request
6. Address review comments
7. Merge after approval

### 20.3 Documentation

- Update README for major changes
- Document new components
- Add JSDoc comments
- Update API documentation
- Include usage examples
- Keep changelog updated

---

## Appendix A: API Reference

### Edge Functions

| Function | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/aura-chat` | POST | Yes | AI assistant chat |
| `/ai-analysis` | POST | Yes | Analyze security alerts |
| `/anomaly-alert` | POST | No | Process anomaly detections |
| `/firewall-control` | POST | Yes | Block/unblock devices |
| `/send-otp` | POST | No | Send OTP codes |
| `/splunk-webhook` | POST | No | Receive Splunk alerts |
| `/metrics-ingest` | POST | No | Ingest network metrics |

### Database Tables

| Table | Purpose | RLS | Relations |
|-------|---------|-----|-----------|
| `users` | User profiles | Yes | None |
| `devices` | Network devices | Yes | users |
| `security_alerts` | Security alerts | Yes | devices |
| `anomaly_alerts` | Anomaly detections | Yes | users |
| `dashboard_metrics` | Dashboard stats | Yes | users |
| `network_metrics` | Network statistics | Yes | users |
| `otp_codes` | OTP verification | Partial | None |

---

## Appendix B: Glossary

- **SIEM**: Security Information and Event Management
- **RLS**: Row Level Security
- **JWT**: JSON Web Token
- **OTP**: One-Time Passcode
- **MFA**: Multi-Factor Authentication
- **MQTT**: Message Queuing Telemetry Transport
- **ML**: Machine Learning
- **AI**: Artificial Intelligence
- **API**: Application Programming Interface
- **CORS**: Cross-Origin Resource Sharing
- **CSP**: Content Security Policy
- **XSS**: Cross-Site Scripting

---

## Appendix C: Quick Reference

### Useful Commands
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
supabase status          # Check Supabase status
supabase db reset        # Reset database
supabase functions deploy # Deploy all functions
```

### Important URLs
- Frontend: https://aura-shield.pages.dev
- Supabase: https://drwbehbecdrlklqydmbo.supabase.co
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub: [repository-url]

### Support Contacts
- Technical Support: dev@aurashield.com
- Security Issues: security@aurashield.com
- Documentation: docs@aurashield.com

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-15  
**Maintained By**: Aura Shield Development Team

---

*This developer manual is a living document. Please keep it updated as the project evolves.*
