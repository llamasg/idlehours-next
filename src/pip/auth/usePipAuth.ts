'use client'
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pip_auth';
const PASSWORD = 'idlehours2026';

export function usePipAuth() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const login = useCallback((password: string): boolean => {
    if (password === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setAuthed(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
  }, []);

  return { authed, login, logout };
}
