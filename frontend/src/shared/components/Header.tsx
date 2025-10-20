/**
 * Social media style header
 */

'use client';

import { Button } from './Button';

interface HeaderProps {
  userEmail: string;
  onLogout: () => void;
}

export function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Moderator</h1>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {userEmail.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-700 max-w-[150px] truncate">
              {userEmail}
            </span>
          </div>
          <Button variant="text" onClick={onLogout} className="text-sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
