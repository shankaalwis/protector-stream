# AuraShield Backend Prototype

This is a complete standalone backend prototype for the AuraShield Smart Home Security System. It contains all backend logic, Edge Functions, database schema, and configurations used in the main application.

## 🏗️ Architecture

- **Runtime**: Deno (for Supabase Edge Functions)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth with JWT
- **Email Service**: Resend
- **AI Integration**: Lovable AI Gateway (OpenAI compatible)

## 📁 Project Structure

```
Backend_Prototype/
├── supabase/
│   ├── functions/          # Edge Functions (Serverless)
│   │   ├── ai-analysis/    # AI-powered security alert analysis
│   │   ├── anomaly-alert/  # Anomaly detection data ingestion
│   │   ├── aura-chat/      # AI assistant chat interface
│   │   ├── firewall-control/ # Device firewall management
│   │   ├── metrics-ingest/ # Dashboard metrics collection
│   │   ├── send-otp/       # OTP email delivery
│   │   └── splunk-webhook/ # Splunk alert integration
│   ├── migrations/         # Database schema and seed data
│   └── config.toml         # Supabase configuration
├── tests/                  # API test scripts
├── .env.example           # Environment variables template
├── Developer_Report.md    # Comprehensive technical documentation
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Deno](https://deno.land/) installed (v1.37+)
- PostgreSQL database (or Supabase project)

### Setup Instructions

1. **Clone/Copy this Backend_Prototype folder**

2. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. **Initialize Supabase** (if starting fresh):
   ```bash
   supabase init
   ```

5. **Link to Supabase Project** (or use local development):
   ```bash
   # For existing project
   supabase link --project-ref your-project-ref
   
   # OR for local development
   supabase start
   ```

6. **Run Database Migrations**:
   ```bash
   supabase db push
   ```

7. **Set Edge Function Secrets**:
   ```bash
   supabase secrets set RESEND_API_KEY=your_key
   supabase secrets set LOVABLE_API_KEY=your_key
   supabase secrets set GEMINI_API_KEY=your_key
   ```

8. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy
   ```

## 🧪 Testing

Run the test scripts to verify functionality:

```bash
cd tests
deno run --allow-net --allow-env test-otp.ts
deno run --allow-net --allow-env test-metrics.ts
deno run --allow-net --allow-env test-anomaly.ts
```

## 📚 API Endpoints

All Edge Functions are accessible at:
```
https://[PROJECT_REF].supabase.co/functions/v1/[function-name]
```

### Available Functions:

1. **send-otp** - Send OTP codes via email
2. **anomaly-alert** - Ingest anomaly detection data
3. **metrics-ingest** - Collect dashboard metrics
4. **splunk-webhook** - Receive Splunk alerts
5. **firewall-control** - Control device firewall rules
6. **aura-chat** - AI assistant chat (requires auth)
7. **ai-analysis** - Analyze security alerts with AI

See `Developer_Report.md` for detailed API documentation.

## 🔒 Security

- All functions use CORS headers
- JWT verification enabled for sensitive endpoints (aura-chat)
- Row-Level Security (RLS) policies on all database tables
- OTP codes expire after 10 minutes
- Passwords never stored in plain text (handled by Supabase Auth)

## 📖 Documentation

For comprehensive technical documentation, architecture details, and API specifications, see:
- **[Developer_Report.md](./Developer_Report.md)** - Complete technical documentation

## 🛠️ Development

### Adding a New Edge Function

1. Create function directory:
   ```bash
   mkdir -p supabase/functions/my-function
   ```

2. Create `index.ts`:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
   
   serve(async (req) => {
     // Your logic here
   });
   ```

3. Update `supabase/config.toml`:
   ```toml
   [functions.my-function]
   verify_jwt = false
   ```

4. Deploy:
   ```bash
   supabase functions deploy my-function
   ```

### Local Testing

```bash
# Serve function locally
supabase functions serve function-name

# Make test request
curl -X POST http://localhost:54321/functions/v1/function-name \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📝 License

This is a prototype for educational and demonstration purposes.

## 🤝 Support

For questions or issues, refer to the Developer_Report.md or Supabase documentation.
