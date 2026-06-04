'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  fullName: string;
  docType: string;
  docNumber: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
