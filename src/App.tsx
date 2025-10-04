import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "@/components/AuthPage";
import { Dashboard } from "@/components/Dashboard";
import SiemDashboard from "@/pages/SiemDashboard";
import Reports from "@/pages/Reports";
import AuraAssistant from "@/pages/AuraAssistant";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering...");
  
  try {
    const { user, loading } = useAuth();
    console.log("Auth state:", { user: !!user, loading });

    if (loading) {
      console.log("Showing loading screen");
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    console.log("Rendering main app, user authenticated:", !!user);
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={user ? <Dashboard /> : <AuthPage />} />
              <Route path="/siem-dashboard" element={user ? <SiemDashboard /> : <Navigate to="/" />} />
              <Route path="/reports" element={user ? <Reports /> : <Navigate to="/" />} />
              <Route path="/aura" element={user ? <AuraAssistant /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
      </ThemeProvider>
    );
  } catch (error) {
    console.error("Error in App component:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error Loading App</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
};

export default App;
