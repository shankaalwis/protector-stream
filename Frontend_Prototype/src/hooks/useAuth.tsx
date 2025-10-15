import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockAuth, User } from "@/mock/mockAuth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const existingUser = mockAuth.getSession();
    setUser(existingUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user, error } = await mockAuth.login(email, password);
    if (user) {
      setUser(user);
    }
    return { error };
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const { user, error } = await mockAuth.signup(email, password, firstName, lastName);
    if (user) {
      setUser(user);
    }
    return { error };
  };

  const logout = async () => {
    await mockAuth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
