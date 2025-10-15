# Frontend Prototype - Smart Home Security Dashboard

This is a standalone frontend prototype demonstrating the user interface and interactions of the Smart Home Security application.

## Technologies Used

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Shadcn UI** components
- **Recharts** for data visualization
- **Mock data** instead of real API calls

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Demo Credentials

Use these credentials to test the login flow:
- **Email:** demo@example.com
- **Password:** demo123

## Available Pages

- `/` - Landing/Login page
- `/dashboard` - Main security dashboard
- `/aura` - AI Assistant interface
- `/reports` - Security reports
- `/siem` - SIEM Dashboard

## Project Structure

```
Frontend_Prototype/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities
│   ├── hooks/          # Custom React hooks
│   ├── mock/           # Mock data and services
│   └── types/          # TypeScript definitions
├── public/             # Static assets
└── ...config files
```

## Key Features Demonstrated

- ✅ User authentication flow (mock)
- ✅ Real-time dashboard with charts
- ✅ Alert management
- ✅ AI chatbot interface
- ✅ Responsive design
- ✅ Dark/Light theme support
- ✅ Form validation

## Limitations

- All data is mocked (no real backend)
- Authentication is simulated
- Charts use static data
- No persistent storage

See **Developer_Report.md** for detailed documentation.
