import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import React from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock session
    const storedUser = localStorage.getItem('skincare_mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
    };
    
    setUser(mockUser);
    localStorage.setItem('skincare_mock_user', JSON.stringify(mockUser));
    setIsLoading(false);
    toast.success('Successfully logged in');
  };

  const signup = async (name: string, email: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      name,
    };
    
    setUser(mockUser);
    localStorage.setItem('skincare_mock_user', JSON.stringify(mockUser));
    setIsLoading(false);
    toast.success('Account created successfully');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skincare_mock_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
