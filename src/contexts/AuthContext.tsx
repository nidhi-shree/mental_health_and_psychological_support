import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profileCompleted?: boolean;
  role: 'user' | 'psychologist' | 'admin';  
  bio?: string;
  avatar_seed?: string;
  interests?: string[];
  age?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  // FIX: Updated signature to accept role
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('mindcare-token');
      if (!token) return false;

      const res = await fetch('http://localhost:5000/api/debug/check-token', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      return res.ok;
    } catch (err) {
      console.error('Token validation error:', err);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('mindcare-user');
      const savedToken = localStorage.getItem('mindcare-token');
      
      if (savedUser && savedToken) {
        try {
          const isValid = await validateToken();
          if (isValid) {
            setUser(JSON.parse(savedUser));
          } else {
            console.log('🔄 Token invalid, clearing storage');
            localStorage.removeItem('mindcare-user');
            localStorage.removeItem('mindcare-token');
          }
        } catch (error) {
          console.error('Error during auth initialization:', error);
          localStorage.removeItem('mindcare-user');
          localStorage.removeItem('mindcare-token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('mindcare-token', data.token);
        localStorage.setItem('mindcare-user', JSON.stringify(data.user));
        setUser(data.user);
        localStorage.setItem("userEmail", data.user.email);
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Updated to accept and send 'role'
  const register = async (name: string, email: string, password: string, role: string = 'user'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // FIX: Included role in the body
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('mindcare-token', data.token);
        localStorage.setItem('mindcare-user', JSON.stringify(data.user));
        setUser(data.user);
        localStorage.setItem("userEmail", data.user.email);
        return true;
      } else {
        console.error('Registration failed:', data.error);
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mindcare-token')}`
        },
        body: JSON.stringify(data), // Send whatever object is passed
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to update profile');
      }

      // Merge updates into local user state
      const updatedUser = { ...user, ...responseData.user };
      setUser(updatedUser);
      localStorage.setItem('mindcare-user', JSON.stringify(updatedUser));

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindcare-user');
    localStorage.removeItem('mindcare-token');
    console.log('✅ Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
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