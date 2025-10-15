import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Button onClick={() => navigate("/")}>
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
