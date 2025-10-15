export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

// Mock user database
const mockUsers = [
  {
    id: "1",
    email: "demo@example.com",
    password: "demo123",
    firstName: "Demo",
    lastName: "User",
  },
  {
    id: "2",
    email: "admin@example.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
  },
];

export const mockAuth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return {
        user: null,
        error: "Invalid email or password",
      };
    }

    const { password: _, ...userWithoutPassword } = user;
    
    // Store session in localStorage
    localStorage.setItem("mockUser", JSON.stringify(userWithoutPassword));

    return {
      user: userWithoutPassword,
      error: null,
    };
  },

  signup: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return {
        user: null,
        error: "User already exists",
      };
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      email,
      firstName,
      lastName,
    };

    mockUsers.push({ ...newUser, password });
    
    // Store session
    localStorage.setItem("mockUser", JSON.stringify(newUser));

    return {
      user: newUser,
      error: null,
    };
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    localStorage.removeItem("mockUser");
  },

  getSession: (): User | null => {
    const userStr = localStorage.getItem("mockUser");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  verifyOtp: async (otp: string): Promise<{ success: boolean; error: string | null }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Accept any 6-digit code
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      return { success: true, error: null };
    }
    
    return { success: false, error: "Invalid OTP code" };
  },
};
