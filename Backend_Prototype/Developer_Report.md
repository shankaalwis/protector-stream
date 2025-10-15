# AuraShield Backend Prototype - Developer Report

## 1. Overview

This backend prototype is a complete, standalone implementation of the AuraShield Smart Home Security System backend. It includes all Edge Functions, database schema, authentication logic, and API endpoints used in the main application.

**Purpose**: Demonstrate backend architecture, data flow, security measures, and integration capabilities for a production-grade IoT security platform.

**Technology Stack**:
- **Runtime**: Deno (for Edge Functions)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth with JWT
- **Email**: Resend API
- **AI**: Lovable AI Gateway

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Clients   │─────▶│  Edge Functions  │─────▶│  PostgreSQL │
│ (IoT/Web)   │      │   (Serverless)   │      │  Database   │
└─────────────┘      └──────────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ External APIs│
                     │ (Email, AI)  │
                     └──────────────┘
```

### Components

1. **Edge Functions** (7 serverless functions)
2. **Database Schema** (8 tables with RLS)
3. **Authentication Layer** (Supabase Auth)
4. **External Integrations** (Resend, AI services)

---

## 3. API Endpoints

All endpoints follow the pattern: `https://[PROJECT_REF].supabase.co/functions/v1/[function-name]`

### 3.1 send-otp

**Purpose**: Send one-time password codes via email for authentication

**Method**: POST  
**Authentication**: None (public endpoint)  
**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true
}
```

**Features**:
- Generates 6-digit OTP
- 10-minute expiration
- Stores in database
- Sends formatted email via Resend

---

### 3.2 anomaly-alert

**Purpose**: Ingest ML-based anomaly detection data from IoT devices

**Method**: POST  
**Authentication**: None (accepts data from ML pipeline)  
**Request Body**:
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "client_id": "mqtt-device-001",
  "packet_count": 1500,
  "anomaly_score": 0.85,
  "is_anomaly": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Anomaly alert saved successfully",
  "id": "uuid-here"
}
```

**Validation**:
- Required fields check
- Data type validation
- Anomaly score range: 0-1

---

### 3.3 metrics-ingest

**Purpose**: Collect and aggregate dashboard metrics from Splunk/monitoring tools

**Method**: POST  
**Authentication**: None  
**Supported Metrics**:

1. **Top Targeted Clients**
```json
{
  "metric_key": "top_targeted_clients",
  "data": [
    {"targeted_client": "device-001", "failure_count": "150"}
  ],
  "timestamp": 1234567890
}
```

2. **Top Busiest Topics**
```json
{
  "metric_key": "top_busiest_topics",
  "data": [
    {"topic_name": "home/temperature", "message_count": "5000"}
  ],
  "timestamp": 1234567890
}
```

3. **Message Throughput** (Rolling 60-point history)
```json
{
  "search_name": "Dashboard Data: Message Throughput (New)",
  "result": {"time": "1234567890", "value": "25"}
}
```

**Response**:
```json
{
  "success": true,
  "data": [...]
}
```

---

### 3.4 splunk-webhook

**Purpose**: Receive security alerts from Splunk SIEM

**Method**: POST  
**Authentication**: None (webhook endpoint)  
**Request Body** (Flexible format):
```json
{
  "search_name": "Security Alert",
  "result": {
    "client_id": "device-001",
    "src_ip": "192.168.1.100",
    "alert_type": "Unauthorized Access",
    "description": "Failed login attempts",
    "severity": "high"
  }
}
```

**Response**:
```json
{
  "success": true,
  "alert_id": "uuid",
  "device_id": "uuid"
}
```

**Actions**:
- Matches device by client_id or IP
- Creates security alert
- Updates device status to 'threat'
- Sends email notification

---

### 3.5 firewall-control

**Purpose**: Control firewall rules for IoT devices

**Method**: POST  
**Authentication**: None  
**Request Body**:
```json
{
  "deviceId": "uuid",
  "action": "block"  // or "unblock"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Device blocked successfully",
  "status": "blocked"
}
```

**Note**: Requires firewall API key configured in user profile

---

### 3.6 aura-chat

**Purpose**: AI-powered security assistant chat interface

**Method**: POST  
**Authentication**: **Required** (JWT bearer token)  
**Request Body**:
```json
{
  "messages": [
    {"role": "user", "content": "What are my recent alerts?"}
  ]
}
```

**Response**: Server-Sent Events (streaming)

**Features**:
- Fetches user context (devices, alerts, profile)
- Streams AI responses
- Maintains conversation history

---

### 3.7 ai-analysis

**Purpose**: Analyze security alerts using AI

**Method**: POST  
**Authentication**: None  
**Request Body**:

**Initial Analysis**:
```json
{
  "alertId": "uuid"
}
```

**Conversational Follow-up**:
```json
{
  "alertId": "uuid",
  "userQuery": "How serious is this threat?"
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "summary": "Brief overview",
    "threat_level": "high",
    "recommended_actions": ["Action 1", "Action 2"],
    "technical_details": "Detailed analysis",
    "false_positive_likelihood": 15
  }
}
```

---

## 4. Database Schema

### 4.1 Tables Overview

| Table | Purpose | RLS Enabled |
|-------|---------|-------------|
| users | User profiles and API keys | ✅ |
| devices | IoT device registry | ✅ |
| security_alerts | Security incidents | ✅ |
| anomaly_alerts | ML anomaly detection | ✅ |
| otp_codes | Authentication OTPs | ✅ |
| dashboard_metrics | Aggregated metrics | ✅ |
| network_metrics | Network statistics | ✅ |

### 4.2 Key Relationships

```
users (1) ──< (N) devices
devices (1) ──< (N) security_alerts
users (1) ──< (N) anomaly_alerts
users (1) ──< (N) dashboard_metrics
users (1) ─── (1) network_metrics
```

### 4.3 Row-Level Security (RLS)

**Security Model**: Users can only access their own data

Example policies:
- `users`: User can view/update own profile
- `devices`: User can CRUD own devices
- `security_alerts`: User can view alerts for their devices
- `anomaly_alerts`: System can insert, user can view own

---

## 5. Edge Functions Detailed

### Function Configuration (config.toml)

```toml
[functions.send-otp]
verify_jwt = false  # Public endpoint

[functions.aura-chat]
verify_jwt = true   # Requires authentication

[functions.ai-analysis]
verify_jwt = false  # Accepts system calls

# ... etc
```

### Trigger Mechanisms

1. **Webhook Triggers**: splunk-webhook, metrics-ingest, anomaly-alert
2. **User Initiated**: send-otp, aura-chat, firewall-control
3. **System Triggered**: ai-analysis (can be automated)

### Error Handling

All functions include:
- CORS preflight handling
- Input validation
- Try-catch error wrapping
- Detailed logging
- Structured error responses

---

## 6. Setup Instructions

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Install Deno (for testing)
curl -fsSL https://deno.land/install.sh | sh
```

### Local Development

1. **Start Supabase locally**:
```bash
cd Backend_Prototype
supabase start
```

2. **Run migrations**:
```bash
supabase db reset
```

3. **Set secrets**:
```bash
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set LOVABLE_API_KEY=your_key
```

4. **Deploy functions**:
```bash
supabase functions deploy
```

### Production Deployment

1. **Link to project**:
```bash
supabase link --project-ref your-ref
```

2. **Push database**:
```bash
supabase db push
```

3. **Deploy functions**:
```bash
supabase functions deploy --no-verify-jwt
```

---

## 7. Testing Summary

### Test Scripts

Located in `tests/` directory:

1. **test-otp.ts** - OTP generation and validation
2. **test-anomaly.ts** - Anomaly data ingestion
3. **test-metrics.ts** - Metrics aggregation

### Test Results

✅ **OTP Functionality**:
- 6-digit code generation: PASS
- Email delivery: PASS
- 10-minute expiration: PASS (database constraint)
- Input validation: PASS

✅ **Anomaly Detection**:
- Valid data ingestion: PASS
- Data type validation: PASS
- Missing field handling: PASS

✅ **Metrics Ingestion**:
- Multiple metric types: PASS
- Rolling history (60 points): PASS
- Splunk format compatibility: PASS

### Manual Testing

Use `curl` or Postman:

```bash
# Test OTP
curl -X POST http://localhost:54321/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test Anomaly Alert
curl -X POST http://localhost:54321/functions/v1/anomaly-alert \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp":"2025-01-15T10:00:00Z",
    "client_id":"test-device",
    "packet_count":100,
    "anomaly_score":0.5,
    "is_anomaly":false
  }'
```

---

## 8. Security Considerations

### Authentication
- JWT tokens for sensitive endpoints (aura-chat)
- Service role key for server-to-server (edge functions to DB)
- OTP expiration enforced at database level

### Data Protection
- Row-Level Security on all tables
- Users isolated by auth.uid()
- No cross-user data leakage

### Input Validation
- Type checking on all inputs
- Required field validation
- Anomaly score range validation (0-1)

### API Security
- CORS headers configured
- Rate limiting (via Supabase)
- No SQL injection (parameterized queries)

---

## 9. Future Improvements

### Performance
- [ ] Add Redis caching for metrics
- [ ] Implement batch processing for anomaly alerts
- [ ] Optimize database indexes

### Features
- [ ] Webhook signature verification
- [ ] Multi-tenant support
- [ ] Advanced AI analysis with context memory
- [ ] Real-time WebSocket connections
- [ ] Device grouping and automation rules

### Monitoring
- [ ] Prometheus metrics export
- [ ] Distributed tracing
- [ ] Alert correlation engine
- [ ] Anomaly threshold auto-tuning

### DevOps
- [ ] CI/CD pipeline for automated deployments
- [ ] Staging environment
- [ ] Automated integration tests
- [ ] Load testing suite

---

## 10. Appendix

### Environment Variables

See `.env.example` for complete list:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `LOVABLE_API_KEY`
- `GEMINI_API_KEY`

### Database Functions

1. `handle_new_user()` - Auto-creates user profile on signup
2. `cleanup_expired_otps()` - Removes expired OTP codes
3. `update_updated_at_column()` - Auto-updates timestamps

### Useful Commands

```bash
# View function logs
supabase functions logs function-name

# Reset database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > types.ts
```

---

## Contact & Support

For questions or issues with this prototype, refer to:
- Supabase Documentation: https://supabase.com/docs
- Edge Functions Guide: https://supabase.com/docs/guides/functions
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Author**: AuraShield Development Team
