"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, LoginInput, RegisterInput } from "@/types/auth";
import { loginUser, registerUser, getCurrentUser, ApiError } from "@/services/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        localStorage.removeItem("access_token");
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(data: LoginInput) {
    const tokenResponse = await loginUser(data);
    localStorage.setItem("access_token", tokenResponse.access_token);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function register(data: RegisterInput) {
    await registerUser(data);
    // Auto-login after successful registration
    await login({ email: data.email, password: data.password });
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}