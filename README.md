A Web-Based Anomaly Detection and Firewall Management Solution Using Machine Learning and a Large Language Model
Project Proposal CSG3101.2 – Applied Project Group 01
Supervisor Mr. Jude Kiruparatnam
Team Members Shanka Alwis - 10685892 (c)
Thiveekshan Gunasegaran – 10685900
Manhith Ransilu Sanjeewa – 10686639
Rashini Dulya Dias 10677999
Thanoj Nimsara Sahabandu – 10696408

## Getting Started

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Run the development server**
   ```sh
   npm run dev
   ```
3. **Lint the project**
   ```sh
   npm run lint
   ```

The app is served on `http://localhost:8080` by default.

## Environment Variables

Create a `.env` file at the project root based on `.env.example`. The following environment variables are required at runtime:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Edge functions expect these additional variables to be configured in Supabase:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_API_KEY`
- `AI_API_URL`

## Supabase Edge Functions

The repository includes two Supabase edge functions under `supabase/functions`:

- `ai-analysis`: Produces structured incident summaries for security alerts.
- `aura-chat`: Streams conversational responses for the Aura assistant.

Deploy them using the Supabase CLI:

```sh
supabase functions deploy ai-analysis
supabase functions deploy aura-chat
```

Refer to `TECHNICAL_DOCUMENTATION.md` for a deeper architectural overview and guidance on extending the platform.
