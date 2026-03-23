/**
 * AdminAuthContext
 * Manages the admin session (login / logout / token persistence in localStorage).
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

interface AdminAuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  token: null,
  isLoggedIn: false,
  login: async () => false,
  logout: () => {},
});

const TOKEN_KEY = 'admin_token';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) return false;
      const { token: newToken } = (await res.json()) as { token: string };
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ token, isLoggedIn: !!token, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
