'use client';

import { useCallback } from 'react';
import { logout } from '@/lib/auth';

export function LogoutButton() {
  const handleLogout = useCallback(() => {
    logout();
  }, []);

  return <button onClick={handleLogout}>Logout</button>;
}
